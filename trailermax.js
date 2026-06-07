(function () {
    "use strict";

    function State(object) {
        this.state = object.state;
        this.start = function () {
            this.dispatch(this.state);
        };
        this.dispatch = function (action_name) {
            var action = object.transitions[action_name];
            if (action) {
                action.call(this, this);
            } else {
                console.log("invalid action");
            }
        };
    }

    var Player = (function () {
        function Player(object, video, isBgMode) {
            var _this = this;
            this.paused = false;
            this.display = false;
            this.ended = false;
            this.isBgMode = isBgMode;
            this.video = video;
            this.listener = Lampa.Subscribe();

            this.html = $('<div class="cardify-trailer ' + (this.isBgMode ? 'bg-mode' : 'fg-mode') + '">' +
                '<div class="cardify-trailer__youtube">' +
                    '<div class="cardify-trailer__youtube-iframe"></div>' +
                    '<div class="cardify-trailer__youtube-line one"></div>' +
                    '<div class="cardify-trailer__youtube-line two"></div>' +
                '</div>' +
                (!this.isBgMode ? '<div class="cardify-trailer__controlls">' +
                    '<div class="cardify-trailer__title"></div>' +
                    '<div class="cardify-trailer__remote">' +
                        '<div class="cardify-trailer__remote-icon">' +
                            '<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                                '<path d="M32.5196 7.22042L26.7992 12.9408C27.8463 14.5217 28.4561 16.4175 28.4561 18.4557C28.4561 20.857 27.6098 23.0605 26.1991 24.7844L31.8718 30.457C34.7226 27.2724 36.4561 23.0667 36.4561 18.4561C36.4561 14.2059 34.983 10.2998 32.5196 7.22042Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M31.262 31.1054L31.1054 31.262C31.158 31.2102 31.2102 31.158 31.262 31.1054Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M29.6917 32.5196L23.971 26.7989C22.3901 27.846 20.4943 28.4557 18.4561 28.4557C16.4179 28.4557 14.5221 27.846 12.9412 26.7989L7.22042 32.5196C10.2998 34.983 14.2059 36.4561 18.4561 36.4561C22.7062 36.4561 26.6123 34.983 29.6917 32.5196Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M5.81349 31.2688L5.64334 31.0986C5.69968 31.1557 5.7564 31.2124 5.81349 31.2688Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M5.04033 30.4571L10.7131 24.7844C9.30243 23.0605 8.4561 20.857 8.4561 18.4557C8.4561 16.4175 9.06588 14.5217 10.113 12.9408L4.39251 7.22037C1.9291 10.2998 0.456055 14.2059 0.456055 18.4561C0.456054 23.0667 2.18955 27.2724 5.04033 30.4571Z" fill="white" fill-opacity="0.28"/>' +
                                '<path d="M6.45507 5.04029C9.63973 2.18953 13.8455 0.456055 18.4561 0.456055C23.0667 0.456054 27.2724 2.18955 30.4571 5.04034L24.7847 10.7127C23.0609 9.30207 20.8573 8.45575 18.4561 8.45575C16.0549 8.45575 13.8513 9.30207 12.1275 10.7127L6.45507 5.04029Z" fill="white" fill-opacity="0.28"/>' +
                                '<circle cx="18.4565" cy="18.4561" r="7" fill="white"/>' +
                            '</svg>' +
                        '</div>' +
                        '<div class="cardify-trailer__remote-text">' + Lampa.Lang.translate("cardify_enable_sound") + '</div>' +
                    '</div>' +
                '</div>' : '') +
            '</div>');
        }

        Player.prototype.initYoutube = function() {
            var _this = this;
            var bgSound = Lampa.Storage.field("cardify_bg_trailer_sound") === true;
            var isHorizontal = window.innerWidth > window.innerHeight;
            
            var h = (this.isBgMode || isHorizontal) ? window.innerHeight * 2 : '100%';
            var w = (this.isBgMode || isHorizontal) ? window.innerWidth : '100%';

            this.youtube = new window.YT.Player(
                this.html.find(".cardify-trailer__youtube-iframe")[0],
                {
                    height: h,
                    width: w,
                    playerVars: {
                        controls: 0,
                        showinfo: 0,
                        autohide: 1,
                        modestbranding: 1,
                        autoplay: 0,
                        disablekb: 1,
                        fs: 0,
                        enablejsapi: 1,
                        playsinline: 1,
                        rel: 0,
                        suggestedQuality: "hd1080",
                        setPlaybackQuality: "hd1080",
                        mute: (this.isBgMode && !bgSound) ? 1 : 0,
                        start: 8
                    },
                    videoId: this.video.id,
                    events: {
                        onReady: function(event) {
                            _this.loaded = true;
                            var iframe = $(_this.youtube.getIframe());
                            
                            var blurVal = parseInt(Lampa.Storage.field("cardify_trailers_blur")) || 0;
                            if (blurVal > 0) {
                                iframe.css('filter', 'blur(' + blurVal + 'px)');
                            }

                            if (_this.isBgMode || isHorizontal) {
                                var zoomVal = Lampa.Storage.field("cardify_trailers_zoom");
                                if (zoomVal === true) zoomVal = "33"; 
                                if (zoomVal === false) zoomVal = "0";
                                zoomVal = zoomVal || "0";

                                if (zoomVal !== "0") {
                                    var scale = 1;
                                    if (zoomVal == "25") scale = 1.25;
                                    else if (zoomVal == "33") scale = 1.33;
                                    else if (zoomVal == "40") scale = 1.40;
                                    else if (zoomVal == "45") scale = 1.45;
                                    else if (zoomVal == "50") scale = 1.50;
                                    
                                    iframe.css('transform', 'scale(' + scale + ')');
                                }
                            }

                            _this.listener.send("loaded");
                        },
                        onStateChange: function(state) {
                            if (state.data == window.YT.PlayerState.PLAYING) {
                                _this.paused = false;
                                clearInterval(_this.timer);
                                _this.timer = setInterval(function () {
                                    var left = _this.youtube.getDuration() - _this.youtube.getCurrentTime();
                                    var toend = 2;
                                    if (left <= toend) {
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
                        onError: function(e) {
                            _this.loaded = false;
                            _this.listener.send("error");
                        }
                    }
                }
            );
        };

        Player.prototype.initHtml5 = function() {
            var _this = this;
            var blurVal = parseInt(Lampa.Storage.field("cardify_trailers_blur")) || 0;
            var zoomVal = Lampa.Storage.field("cardify_trailers_zoom");
            var bgSound = Lampa.Storage.field("cardify_bg_trailer_sound") === true;
            var isHorizontal = window.innerWidth > window.innerHeight;
            
            if (zoomVal === true) zoomVal = "33";
            if (zoomVal === false) zoomVal = "0";
            zoomVal = zoomVal || "0";

            var scale = 1;
            if (zoomVal == "25") scale = 1.25;
            else if (zoomVal == "33") scale = 1.33;
            else if (zoomVal == "40") scale = 1.40;
            else if (zoomVal == "45") scale = 1.45;
            else if (zoomVal == "50") scale = 1.50;

            var container = this.html.find(".cardify-trailer__youtube-iframe");
            container.empty();
            
            var videoElem = document.createElement('video');
            videoElem.autoplay = true;
            videoElem.playsInline = true;
            videoElem.controls = false; 
            videoElem.disablePictureInPicture = true;
            videoElem.disableRemotePlayback = true;

            if (this.isBgMode && !bgSound) videoElem.muted = true;
            else videoElem.muted = false;
            
            videoElem.style.width = '100%';
            videoElem.style.height = '100%';
            videoElem.style.objectFit = (!this.isBgMode && !isHorizontal) ? 'contain' : 'cover';
            videoElem.style.border = 'none';
            videoElem.style.pointerEvents = 'none';
            videoElem.style.outline = 'none';
            videoElem.style.background = 'transparent';
            videoElem.tabIndex = -1; 

            if (blurVal > 0) videoElem.style.filter = 'blur(' + blurVal + 'px)';
            if (scale > 1 && (this.isBgMode || isHorizontal)) videoElem.style.transform = 'scale(' + scale + ')';

            var srcUrl = this.video.url;
            if (this.video.startTime) {
                srcUrl += "#t=" + this.video.startTime;
            }
            videoElem.src = srcUrl;
            
            container.append(videoElem);
            this.videoNode = videoElem;

            this.videoNode.addEventListener('loadedmetadata', function() {
                if (_this.video.startTime) {
                    if (_this.videoNode.currentTime < _this.video.startTime) {
                        _this.videoNode.currentTime = _this.video.startTime;
                    }
                }
            });

            this.videoNode.addEventListener('loadeddata', function() {
                _this.loaded = true;
                _this.listener.send("loaded");
            });

            this.videoNode.addEventListener('play', function() {
                _this.paused = false;
                clearInterval(_this.timer);
                _this.timer = setInterval(function() {
                    if (_this.videoNode && !_this.videoNode.paused && !_this.videoNode.ended && _this.videoNode.duration) {
                        var left = _this.videoNode.duration - _this.videoNode.currentTime;
                        if (left <= 2 && left > 0) {
                            clearInterval(_this.timer);
                            _this.listener.send("ended");
                        }
                    }
                }, 100);
                
                _this.listener.send("play");
                if (window.cardify_fist_unmute && !_this.isBgMode) _this.unmute();
            });

            this.videoNode.addEventListener('pause', function() {
                _this.paused = true;
                clearInterval(_this.timer);
                _this.listener.send("paused");
            });

            this.videoNode.addEventListener('ended', function() {
                _this.listener.send("ended");
            });

            this.videoNode.addEventListener('error', function() {
                _this.loaded = false;
                _this.listener.send("error");
            });
        };

        Player.prototype.play = function() {
            if (this.videoNode) {
                try { this.videoNode.play(); } catch(e) {}
            } else {
                try { this.youtube.playVideo(); } catch (e) {}
            }
        };

        Player.prototype.pause = function() {
            if (this.videoNode) {
                try { this.videoNode.pause(); } catch(e) {}
            } else {
                try { this.youtube.pauseVideo(); } catch (e) {}
            }
        };

        Player.prototype.unmute = function() {
            try {
                if (this.isBgMode) return;
                if (this.videoNode) {
                    this.videoNode.muted = false;
                } else {
                    this.youtube.unMute();
                }
                this.html.find(".cardify-trailer__remote").remove();
                window.cardify_fist_unmute = true;
            } catch (e) {}
        };

        Player.prototype.show = function() {
            this.html.addClass("display");
            this.display = true;
        };

        Player.prototype.hide = function() {
            this.html.removeClass("display");
            this.display = false;
        };

        Player.prototype.render = function() {
            return this.html;
        };

        Player.prototype.destroy = function() {
            this.loaded = false;
            this.display = false;

            if (this.videoNode) {
                try {
                    this.videoNode.pause();
                    this.videoNode.removeAttribute('src');
                    this.videoNode.load();
                } catch(e) {}
            } else {
                try { this.youtube.destroy(); } catch (e) {}
            }

            clearInterval(this.timer);
            this.html.remove();
        };

        return Player;
    })();

    var Trailer = (function () {
        function Trailer(object, video, isBgMode) {
            var _this = this;

            object.activity.trailer_ready = true;
            this.object = object;
            this.video = video;
            this.isBgMode = isBgMode;
            this.player = null;
            
            var isHorizontal = window.innerWidth > window.innerHeight;
            if (isHorizontal) {
                this.background = this.object.activity.render().find(".full-start__background, .m-full-start__background");
            } else {
                this.background = this.object.activity.render().find(".full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img");
            }
            
            this.startblock = this.object.activity.render().find(".cardify");
            this.head = $(".head");
            this.timelauch = isBgMode ? 100 : 5000;
            this.state = new State({
                state: "start",
                transitions: {
                    start: function(state) {
                        clearTimeout(_this.timer_load);
                        if (_this.player.display) state.dispatch("play");
                        else if (_this.player.loaded) {
                            _this.timer_load = setTimeout(function () {
                                state.dispatch("load");
                            }, _this.timelauch);
                        }
                    },
                    load: function(state) {
                        if (
                            _this.player.loaded &&
                            (Lampa.Controller.enabled().name == "full_start" || Lampa.Controller.enabled().name == "scroll") &&
                            _this.same() &&
                            $('.modal').length === 0
                        )
                            state.dispatch("play");
                    },
                    play: function() {
                        _this.player.play();
                    },
                    toggle: function(state) {
                        if (_this.isBgMode) {
                            if (!_this.same()) {
                                if (_this.player.display) state.dispatch("hide");
                                return;
                            }
                            
                            var playerOpen = $('body').hasClass('player--open') || $('.player').length > 0;
                            
                            if (!playerOpen) {
                                if (!_this.player.display && _this.player.loaded) {
                                    state.start();
                                }
                            } else {
                                if (_this.player.display) state.dispatch("hide");
                            }
                            return;
                        }

                        clearTimeout(_this.timer_load);
                        if (Lampa.Controller.enabled().name == "cardify_trailer");
                        else if (
                            Lampa.Controller.enabled().name == "full_start" &&
                            _this.same()
                        ) {
                            state.start();
                        } else if (_this.player.display) {
                            state.dispatch("hide");
                        }
                    },
                    hide: function() {
                        if (!_this.player.display) return;
                        _this.player.pause();
                        _this.player.hide();
                        var isHorizontalNow = window.innerWidth > window.innerHeight;
                        
                        if (!isHorizontalNow && _this.isBgMode) {
                            _this.background.css('opacity', '1');
                        } else {
                            _this.background.removeClass("nodisplay").css('opacity', '1');
                        }
                        
                        if (!_this.isBgMode) {
                            _this.startblock.removeClass("nodisplay");
                            _this.head.removeClass("nodisplay");
                            _this.object.activity.render().find('.cardify-effects-overlay').removeClass("nodisplay");
                        }
                    }
                }
            });
            this.start();
        }

        Trailer.prototype.same = function() {
            return Lampa.Activity.active().activity === this.object.activity;
        };

        Trailer.prototype.controll = function() {
            if (this.isBgMode) return; 
            var _this = this;

            var out = function() {
                _this.state.dispatch("hide");
                Lampa.Controller.toggle("full_start");
            };

            Lampa.Controller.add("cardify_trailer", {
                toggle: function() {
                    Lampa.Controller.clear();
                },
                enter: function() {
                    _this.player.unmute();
                },
                left: out,
                up: out,
                down: out,
                right: out,
                back: function() {
                    _this.player.destroy();
                    out();
                }
            });
            Lampa.Controller.toggle("cardify_trailer");
        };

        Trailer.prototype.start = function() {
            var _this = this;
            var _self = this;

            var toggle = function() {
                _self.state.dispatch("toggle");
            };

            var activityListener = function(a) {
                if (a.object.activity === _self.object.activity) {
                    if (a.type === "destroy") {
                        remove();
                    } else if (a.type === "background") {
                        _self.state.dispatch("hide");
                    } else if (a.type === "foreground") {
                        _self.state.dispatch("toggle");
                    }
                }
            };

            var remove = function() {
                Lampa.Listener.remove("activity", activityListener);
                Lampa.Controller.listener.remove("toggle", toggle);
                
                if (window.cardifyBgPlayer === _this.player) {
                    window.cardifyBgPlayer = null;
                }
                if (window.cardifyBgTrailer === _self) {
                    window.cardifyBgTrailer = null;
                }

                _self.destroy();
            };

            Lampa.Listener.follow("activity", activityListener);
            Lampa.Controller.listener.follow("toggle", toggle);

            this.player = new Player(this.object, this.video, this.isBgMode);
            
            if (this.isBgMode) {
                window.cardifyBgPlayer = this.player;
                window.cardifyBgTrailer = this;
            }

            this.player.listener.follow("loaded", function() {
                _this.state.start();
            });

            this.player.listener.follow("play", function() {
                clearTimeout(_this.timer_show);

                _this.timer_show = setTimeout(function() {
                    if (_this.isBgMode) {
                        if (_this.player.html && _this.player.html.length) {
                            _this.player.html[0].style.setProperty('transition', 'opacity 2s ease-in-out', 'important');
                        }
                        if (_this.background && _this.background.length) {
                            _this.background.each(function() {
                                this.style.setProperty('transition', 'opacity 2s ease-in-out', 'important');
                            });
                        }
                    }

                    _this.player.show();
                    
                    var isHorizontalNow = window.innerWidth > window.innerHeight;
                    if (!isHorizontalNow && _this.isBgMode) {
                        _this.background.css('opacity', '0');
                    } else {
                        _this.background.addClass("nodisplay");
                    }

                    if (!_this.isBgMode) {
                        _this.startblock.addClass("nodisplay");
                        _this.head.addClass("nodisplay");
                        _this.object.activity.render().find('.cardify-effects-overlay').addClass("nodisplay");
                        _this.controll();
                    }
                }, _this.isBgMode ? 100 : 500);
            });

            this.player.listener.follow("ended,error", function() {
                if (_this.isBgMode) {
                    try {
                        if (_this.player.videoNode) {
                            _this.player.videoNode.currentTime = 8;
                        } else if (_this.player.youtube && typeof _this.player.youtube.seekTo === 'function') {
                            _this.player.youtube.seekTo(8);
                        }
                    } catch(err) {}
                    _this.player.play(); 
                    return;
                }

                _this.state.dispatch("hide");

                if (Lampa.Controller.enabled().name !== "full_start")
                    Lampa.Controller.toggle("full_start");

                setTimeout(remove, 300);
            });

            var $render = this.object.activity.render();
            var $overlay = $render.find('.cardify-effects-overlay');
            var isHorizontal = window.innerWidth > window.innerHeight;

            if (!isHorizontal && this.isBgMode) {
                var $bg = $render.find('.full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img').first();
                var $playerHtml = this.player.render();
                if ($bg.length) {
                    $playerHtml.find('.cardify-trailer__youtube').css({
                        position: 'absolute',
                        height: '100%',
                        width: '100%'
                    });
                    
                    var $bgParent = $bg.parent();
                    if ($bgParent.css('position') === 'static') {
                        $bgParent.css('position', 'relative');
                    }
                    
                    $bgParent.css({
                        '-webkit-mask-image': '-webkit-linear-gradient(top, white 50%, rgba(255,255,255,0) 100%)',
                        'mask-image': 'linear-gradient(to bottom, white 50%, rgba(255,255,255,0) 100%)'
                    });

                    $bg.css({
                        '-webkit-mask-image': 'none',
                        'mask-image': 'none'
                    });

                    $playerHtml.css({
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        zIndex: $bg.css('z-index') !== 'auto' ? $bg.css('z-index') : 1,
                        overflow: 'hidden',
                        '-webkit-mask-image': 'none',
                        'mask-image': 'none',
                        'border-radius': $bg.css('border-radius') || '0'
                    });

                    $bg.after($playerHtml);
                } else {
                    $render.find(".activity__body").prepend($playerHtml);
                }
            } else {
                if (this.isBgMode && $overlay.length) {
                    $overlay.before(this.player.render());
                } else {
                    $render.find(".activity__body").prepend(this.player.render());
                }
            }

            if (this.video.type === 'imdb_video') {
                this.player.initHtml5();
            } else {
                var checkYT = setInterval(function() {
                    if (window.YT && window.YT.Player) {
                        clearInterval(checkYT);
                        _this.player.initYoutube();
                    }
                }, 100);

                if (!window.YT && !window.cardify_yt_injecting) {
                    window.cardify_yt_injecting = true;
                    Lampa.Utils.putScript(['https://www.youtube.com/iframe_api'], function(){});
                }
            }
        };

        Trailer.prototype.destroy = function() {
            clearTimeout(this.timer_load);
            clearTimeout(this.timer_show);
            this.player.destroy();
        };

        return Trailer;
    })();

    function startPlugin() {
        Lampa.Lang.add({
            cardify_enable_sound: {
                ru: "Включить звук",
                en: "Enable sound",
                uk: "Увімкнути звук",
                be: "Уключыць гук",
                zh: "启用声音",
                pt: "Ativar som",
                bg: "Включване на звук"
            }
        });

        if (window.Lampa && Lampa.Player && Lampa.Player.listener) {
            Lampa.Player.listener.follow('ready', function() {
                if (window.cardifyBgTrailer && window.cardifyBgTrailer.state) {
                    window.cardifyBgTrailer.state.dispatch('hide');
                } else if (window.cardifyBgPlayer && typeof window.cardifyBgPlayer.pause === 'function') {
                    window.cardifyBgPlayer.pause();
                    if (typeof window.cardifyBgPlayer.hide === 'function') window.cardifyBgPlayer.hide();
                }
            });

            Lampa.Player.listener.follow('destroy', function() {
                setTimeout(function() {
                    if (Lampa.Activity.active() && Lampa.Activity.active().component === 'full_start') {
                        if (window.cardifyBgTrailer && window.cardifyBgTrailer.state) {
                            window.cardifyBgTrailer.state.start();
                        } else if (window.cardifyBgPlayer && typeof window.cardifyBgPlayer.play === 'function') {
                            window.cardifyBgPlayer.play();
                            if (typeof window.cardifyBgPlayer.show === 'function') window.cardifyBgPlayer.show();
                        }
                    }
                }, 300);
            });
        }
        
        var isHorizontal = window.innerWidth > window.innerHeight;
        
        if (isHorizontal) {
            Lampa.Template.add(
                "full_start_new",
                '<div class="full-start-new cardify">\n        <div class="full-start-new__body">\n            <div class="full-start-new__left hide">\n                <div class="full-start-new__poster">\n                    <img class="full-start-new__img full--poster" />\n                </div>\n            </div>\n\n            <div class="full-start-new__right">\n                \n                <div class="cardify__left">\n                    <div class="full-start-new__head"></div>\n                    <div class="full-start-new__title">{title}</div>\n\n                    <div class="full-start-new__rate-line rate-fix">\n                        <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>\n                        <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>\n                        <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>\n                        <div class="full-start__rate rate--cub hide"><div></div><div>CUB</div></div>\n                    </div>\n\n                    <div class="cardify__details">\n                        <div class="full-start-new__details"></div>\n                    </div>\n\n                    <div class="full-start-new__buttons">\n                        <div class="full-start__button selector button--play">\n                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n                            </svg>\n\n                            <span>#{title_watch}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--book">\n                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{settings_input_links}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--reaction">\n                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>\n                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>\n                            </svg>                \n\n                            <span>#{title_reactions}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--subscribe hide">\n                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>\n                            <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{title_subscribe}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--options">\n                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>\n                            </svg>\n                        </div>\n                    </div>\n                </div>\n\n                <div class="cardify__right">\n                    <div class="full-start-new__reactions selector">\n                        <div>#{reactions_none}</div>\n                    </div>\n\n                    <div class="full-start-new__rate-line">\n                        <div class="full-start__pg hide"></div>\n                        <div class="full-start__status hide"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class="hide buttons--container">\n            <div class="full-start__button view--torrent hide">\n                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px">\n                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>\n                </svg>\n\n                <span>#{full_torrents}</span>\n            </div>\n            <div class="full-start__button selector view--trailer">\n                <svg width="28" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <path d="M21.582 6.186c-.23-.86-.908-1.538-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.86.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418c.86-.23 1.538-.908 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814zM9.75 15.021V8.979l6.5 3.021-6.5 3.021z" fill="currentColor"/>\n                </svg>\n                <span>Трейлеры</span>\n            </div>\n        </div>\n    </div>'
            );
        }

        var style = '<style>' +
            '.cardify{-webkit-transition:all .3s;-o-transition:all .3s;-moz-transition:all .3s;transition:all .3s}' +
            '.cardify .full-start-new__body{height:80vh}' +
            '.cardify .full-start-new__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-moz-box-align:end;-ms-flex-align:end;align-items:flex-end}' +
            '.cardify .full-start-new__title{text-shadow:0 0 .1em rgba(0,0,0,0.3)}' +
            '.cardify__left{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1}' +
            '.cardify__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;position:relative}' +
            '.cardify__details{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}' +
            '.cardify .full-start-new__reactions, .cardify .reaction__count {display:none !important}' +
            '@media screen and (orientation: landscape) {' +
                '.cardify .full-start-new__rate-line.rate-fix{margin: 1em 0 1.7em 0}' +
                '.cardify .full-start-new__details{margin:0 0 1.4em -0.3em;}' +
                '.cardify .full-start-new__rate-line{margin:0;margin-left:3.5em}' +
                '.cardify .full-start-new__rate-line>*:last-child{margin-right:0 !important}' +
            '}' +
            '.cardify__background{left:0}' +
            '.cardify__background.nodisplay{opacity:0 !important}' +
            '.cardify.nodisplay{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}' +
            '.head.nodisplay{-webkit-transform:translate3d(0,-100%,0);-moz-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}' +
            'body:not(.menu--open) .cardify__background{-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));-webkit-mask-image:-webkit-linear-gradient(top,white 50%,rgba(255,255,255,0) 100%);mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));mask-image:linear-gradient(to bottom,white 50%,rgba(255,255,255,0) 100%)}' +
            '.cardify__background{animation:none !important;-webkit-animation:none !important;transform:none !important;-webkit-transform:none !important;}' +
            '.cardify-effects-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;background-color:transparent;background-image:linear-gradient(225deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0) 55%);background-repeat:no-repeat;background-size:100vw 100vh;transition:background-color 0.4s ease;}' +
            '.cardify-effects-overlay.cardify-scrolled{background-color:rgba(0,0,0,0.5) !important;}' +
            '.cardify-effects-overlay.nodisplay{opacity:0 !important; pointer-events:none !important;}' +
            '.cardify-trailer{opacity:0;transition:opacity .3s;position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;}' +
            '.cardify-trailer.fg-mode{z-index:100 !important; background-color:#000;}' +
            '.cardify-trailer__youtube{background-color:#000;position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:0;}' +
            '.cardify-trailer__youtube iframe{border:0;width:100%;height:100%;flex-shrink:0;z-index:0;transition:transform 0.3s;pointer-events:none;}' +
            '.cardify-trailer__youtube-iframe video { outline:none; border:none; pointer-events:none; cursor:none; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls-enclosure { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls-panel { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls-play-button { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-iframe video::-webkit-media-controls-start-playback-button { display:none !important; opacity:0 !important; }' +
            '.cardify-trailer__youtube-line{position:fixed;height:6.2em;background-color:#000;width:100%;left:0;display:none;z-index:2;}' +
            '.cardify-trailer__youtube-line.one{top:0}' +
            '.cardify-trailer__youtube-line.two{bottom:0}' +
            '.cardify-trailer__controlls{position:fixed;left:1.5em;right:1.5em;bottom:1.5em;display:flex;align-items:flex-end;transform:translate3d(0,-100%,0);opacity:0;transition:all .3s;z-index:10;}' +
            '.cardify-trailer__title{flex-grow:1;padding-right:5em;font-size:4em;font-weight:600;text-shadow: 2px 2px 4px #000;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;}' +
            '.cardify-trailer__remote{flex-shrink:0;display:flex;align-items:center;}' +
            '.cardify-trailer__remote-icon{flex-shrink:0;width:2.5em;height:2.5em}' +
            '.cardify-trailer__remote-text{margin-left:1em;text-shadow: 1px 1px 2px #000;}' +
            '.cardify-trailer.display{opacity:1}' +
            '.cardify-trailer.display .cardify-trailer__controlls{transform:translate3d(0,0,0);opacity:1}' +
        '</style>';

        Lampa.Template.add("cardify_css", style);
        $("body").append(Lampa.Template.get("cardify_css", {}, true));

        var icon = '<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>' +
            '<rect x="5" y="14" width="17" height="4" rx="2" fill="white"/>' +
            '<rect x="5" y="20" width="10" height="3" rx="1.5" fill="white"/>' +
            '<rect x="25" y="20" width="6" height="3" rx="1.5" fill="white"/>' +
        '</svg>';
        
        Lampa.SettingsApi.addComponent({
            component: "cardify",
            icon: icon,
            name: "CARD mod"
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_run_trailers",
                type: "trigger",
                default: false
            },
            field: {
                name: "Показывать трейлеры",
                description: "Запускать трейлер через таймаут 5 сек (вместо фона и интерфейса)"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailers_bg",
                type: "trigger",
                default: false
            },
            field: {
                name: "Трейлеры вместо слайдшоу",
                description: "Загрузить трейлер на задний фон сразу"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_bg_trailer_sound",
                type: "trigger",
                default: false
            },
            field: {
                name: "Звук фонового трейлера",
                description: "Включить звук для трейлера, который играет на фоне вместо фото/слайдшоу"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailer_source",
                type: "select",
                values: {
                    "tmdb": "TMDB (YouTube)",
                    "imdb": "IMDB (Balloonerism)"
                },
                default: "tmdb"
            },
            field: {
                name: "Источник трейлеров",
                description: "Откуда загружать трейлеры"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailer_quality",
                type: "select",
                values: {
                    "1080": "1080p",
                    "720": "720p",
                    "480": "480p",
                    "sd": "SD",
                    "auto": "Авто"
                },
                default: "auto"
            },
            field: {
                name: "Качество фонового трейлера IMDB",
                description: "Работает только если источник - IMDB"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_button_imdb_quality",
                type: "select",
                values: {
                    "1080": "1080p",
                    "720": "720p",
                    "480": "480p",
                    "sd": "SD",
                    "auto": "Авто"
                },
                default: "auto"
            },
            field: {
                name: "Качество кнопки IMDB Trailer",
                description: "Качество видео при ручном запуске трейлера с кнопки"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailer_proxy",
                type: "trigger",
                default: true
            },
            field: {
                name: "Прокси для трейлеров IMDB",
                description: "Использовать прокси для запросов API и видео"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailers_blur",
                type: "select",
                values: {
                    "0": "Выключено (0%)",
                    "1": "1%",
                    "2": "2%",
                    "3": "3%",
                    "4": "4%",
                    "5": "5%",
                    "10": "10%"
                },
                default: "0"
            },
            field: {
                name: "Размытие трейлера",
                description: "Настройте уровень размытия фонового трейлера"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_trailers_zoom",
                type: "select",
                values: {
                    "0": "Выключено (0%)",
                    "25": "25%",
                    "33": "33%",
                    "40": "40%",
                    "45": "45%",
                    "50": "50%"
                },
                default: "0"
            },
            field: {
                name: "Степень растяжения трейлера",
                description: "Убирает черные полосы видео (по умолчанию 0%)"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_run_slideshow",
                type: "trigger",
                default: true
            },
            field: {
                name: "Слайд-шоу",
                description: "Плавно менять фоновые изображения"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_slideshow_quality",
                type: "select",
                values: {
                    w780: "Стандартная (w780)",
                    w1280: "Высокая (w1280)",
                    original: "Оригинал (original)"
                },
                default: "w1280"
            },
            field: {
                name: "Качество изображений"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_slideshow_duration",
                type: "select",
                values: {
                    5000: "5 секунд",
                    8000: "8 секунд",
                    10000: "10 секунд",
                    15000: "15 секунд"
                },
                default: 8000
            },
            field: {
                name: "Длительность фото (сек)"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_show_status",
                type: "trigger",
                default: false
            },
            field: {
                name: "Показывать статус"
            }
        });

        Lampa.SettingsApi.addParam({
            component: "cardify",
            param: {
                name: "cardify_show_pg",
                type: "trigger",
                default: false
            },
            field: {
                name: "Показывать возрастной рейтинг"
            }
        });

        function getVideo(data) {
            var vids = data.videos || (data.movie && data.movie.videos) || (data.tv && data.tv.videos);
            if (vids && vids.results && vids.results.length) {
                var items = [];
                vids.results.forEach(function(element) {
                    var name_orig = (element.name || "").toLowerCase();
                    
                    if (element.iso_639_1 === 'ru' || name_orig.indexOf('официальный') !== -1 || name_orig.indexOf('русский') !== -1 || name_orig.indexOf('на русском') !== -1) {
                        return;
                    }

                    if (name_orig.indexOf('#shorts') !== -1 || name_orig.indexOf('[shorts]') !== -1 || name_orig.indexOf('(shorts)') !== -1 || name_orig.indexOf('tiktok') !== -1 || name_orig.indexOf('vertical') !== -1) {
                        return;
                    }

                    items.push({
                        title: Lampa.Utils.shortText(element.name, 50),
                        id: element.key,
                        code: element.iso_639_1,
                        time: new Date(element.published_at).getTime(),
                        url: "https://www.youtube.com/watch?v=" + element.key,
                        img: "https://img.youtube.com/vi/" + element.key + "/default.jpg",
                        name_orig: name_orig,
                        type: (element.type || "").toLowerCase()
                    });
                });

                items.sort(function(a, b) {
                    return a.time > b.time ? -1 : a.time < b.time ? 1 : 0;
                });

                var uk_lang = items.filter(function(n) {
                    return n.code === "uk" || 
                           n.name_orig.indexOf("українською") !== -1 || 
                           n.name_orig.indexOf("український") !== -1 || 
                           n.name_orig.indexOf("укр трейлер") !== -1;
                });

                var en_lang = items.filter(function(n) {
                    return n.code === "en" && uk_lang.indexOf(n) === -1;
                });

                if (uk_lang.length) {
                    var best_uk = uk_lang.find(function(n) {
                        return n.name_orig.indexOf("офіційний трейлер") !== -1 || 
                               n.name_orig.indexOf("українською") !== -1 || 
                               n.name_orig.indexOf("український") !== -1;
                    });
                    
                    if (!best_uk) {
                        best_uk = uk_lang.find(function(n) {
                            return n.name_orig.indexOf("трейлер") !== -1 || n.type === "trailer";
                        });
                    }
                    
                    if (best_uk) return best_uk;
                    return uk_lang[0];
                }

                if (en_lang.length) {
                    var best_en = en_lang.find(function(n) {
                        return n.name_orig.indexOf("official trailer") !== -1;
                    });
                    
                    if (!best_en) {
                        best_en = en_lang.find(function(n) {
                            return n.name_orig.indexOf("trailer") !== -1 || n.type === "trailer";
                        });
                    }
                    
                    if (best_en) return best_en;
                    return en_lang[0];
                }

                if (items.length) {
                    return items[0];
                }
            }
        }

        function processFullCard(e) {
            var render = e.object.activity.render();
            var isHorizontal = window.innerWidth > window.innerHeight;
            var bgSelectors = isHorizontal 
                ? ".full-start__background, .m-full-start__background" 
                : ".full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img";
            var bg = render.find(bgSelectors);
            var component = e.object.activity.component;

            if (isHorizontal) {
                bg.addClass("cardify__background");
                if (render.find('.cardify-effects-overlay').length === 0) {
                    bg.last().after('<div class="cardify-effects-overlay"></div>');
                }
            }

            var trailerBtn = render.find('.view--trailer, .button--trailer');
            if (trailerBtn.length) {
                trailerBtn.find('span').text('Трейлеры'); 

                if (render.find('.view--imdb_trailer').length === 0) {
                    var imdbBtn = trailerBtn.clone();
                    imdbBtn.removeClass('view--trailer button--trailer').addClass('view--imdb_trailer');
                    imdbBtn.find('span').text('IMDB Trailer');
                    imdbBtn.find('svg').replaceWith('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>');
                    
                    imdbBtn.on('hover:enter click', function() {
                        var imdb_id = e.data.imdb_id || (e.data.external_ids ? e.data.external_ids.imdb_id : null) || (e.data.movie ? e.data.movie.imdb_id : null) || (e.data.tv ? e.data.tv.imdb_id : null) || (e.object && e.object.card ? e.object.card.imdb_id : null);
                        
                        if (!imdb_id) {
                            Lampa.Noty.show('IMDB ID не найден');
                            return;
                        }

                        if (window.cardifyBgTrailer && window.cardifyBgTrailer.state) {
                            window.cardifyBgTrailer.state.dispatch('hide');
                        }

                        var use_proxy = Lampa.Storage.field("cardify_trailer_proxy") !== false;
                        var api_url = "https://api.balloonerismm.workers.dev/movie/" + imdb_id;
                        if (use_proxy) api_url = "https://cors.lampa.stream/" + api_url;

                        Lampa.Noty.show('Загрузка IMDB трейлера...');
                        
                        $.ajax({
                            url: api_url,
                            type: 'GET',
                            dataType: 'json',
                            success: function(data) {
                                if (data && data.trailer && data.trailer.playback) {
                                    var p = {};
                                    for (var k in data.trailer.playback) {
                                        p[k.toLowerCase().replace('p', '')] = data.trailer.playback[k];
                                    }
                                    
                                    var btnQuality = Lampa.Storage.field("cardify_button_imdb_quality") || "auto";
                                    var order = ['1080', '720', '480', 'sd', 'auto'];
                                    var startIndex = order.indexOf(btnQuality);
                                    if (startIndex === -1) startIndex = 0;

                                    var video_url = null;
                                    for (var i = startIndex; i < order.length; i++) {
                                        if (p[order[i]]) { video_url = p[order[i]]; break; }
                                    }
                                    if (!video_url) {
                                        for (var i = 0; i < order.length; i++) {
                                            if (p[order[i]]) { video_url = p[order[i]]; break; }
                                        }
                                    }
                                    if (!video_url) {
                                        var keys = Object.keys(p);
                                        if (keys.length > 0) video_url = p[keys[0]];
                                    }

                                    if (video_url) {
                                        var final_url = use_proxy ? "https://cors.lampa.stream/" + video_url : video_url;
                                        var title = e.data.title || e.data.name || 'Трейлер';
                                        
                                        var video = {
                                            title: title + " - IMDB Trailer",
                                            url: final_url
                                        };
                                        
                                        Lampa.Player.play(video);
                                        Lampa.Player.playlist([video]);
                                    } else {
                                        Lampa.Noty.show('Не удалось найти ссылку на видео');
                                    }
                                } else {
                                    Lampa.Noty.show('Трейлер отсутствует в базе IMDB');
                                }
                            },
                            error: function() {
                                Lampa.Noty.show('Ошибка загрузки трейлера');
                            }
                        });
                    });

                    trailerBtn.after(imdbBtn);
                }
            }

            var details = render.find(".full-start-new__details");
            if (details.length && isHorizontal) {
                var nextEpisodeSpan = null;
                details.children("span").each(function() {
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
                    if (prevSplit.length && nextSplit.length) {
                        nextSplit.remove();
                    } else {
                        prevSplit.remove();
                        nextSplit.remove();
                    }
                    nextEpisodeSpan.css("width", "100%");
                    details.append(nextEpisodeSpan);
                }
            }

            if (!Lampa.Storage.field("cardify_show_status") && isHorizontal) {
                render.find(".full-start__status").css("opacity", "0");
            }

            if (!Lampa.Storage.field("cardify_show_pg") && isHorizontal) {
                render.find(".full-start__pg").css("opacity", "0");
            }

            loadOriginalPoster(e, render);

            var titleEl = render.find('.full-start-new__title')[0];
            if (titleEl && typeof IntersectionObserver !== 'undefined' && isHorizontal) {
                var observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        var $overlay = render.find('.cardify-effects-overlay');
                        if (entry.isIntersecting) {
                            $overlay.removeClass('cardify-scrolled');
                        } else {
                            $overlay.addClass('cardify-scrolled');
                        }
                    });
                }, { threshold: 0 }); 

                observer.observe(titleEl);

                var stopObserver = function(a) {
                    if (a.type == 'destroy' && a.object.activity === e.object.activity) {
                        observer.disconnect();
                        Lampa.Listener.remove('activity', stopObserver);
                    }
                };
                Lampa.Listener.follow('activity', stopObserver);
            }

            if (component && component.rows && component.items && component.scroll && component.emit) {
                var add = component.rows.slice(component.items.length);
                if (add.length) {
                    component.fragment = document.createDocumentFragment();
                    add.forEach(function(row) {
                        component.emit("createAndAppend", row);
                    });
                    component.scroll.append(component.fragment);
                    if (Lampa.Layer) Lampa.Layer.visible(component.scroll.render());
                }
            }
        }

        function loadOriginalPoster(e, render) {
            var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280';
            var isHorizontal = window.innerWidth > window.innerHeight;
            var bgSelectors = isHorizontal 
                ? "img.full-start__background, img.m-full-start__background" 
                : ".full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img";
            var bgImg = render.find(bgSelectors);

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
                var tempImg = new Image();
                tempImg.onload = function() {
                    bgImg.attr("src", targetUrl);
                    
                    if (!isHorizontal) {
                        bgImg.css({
                            'object-fit': 'cover',
                            '-webkit-mask-image': 'none',
                            'mask-image': 'none'
                        });
                        var parent = bgImg.parent();
                        if (parent.css('position') === 'static') parent.css('position', 'relative');
                        parent.css({
                            '-webkit-mask-image': '-webkit-linear-gradient(top, white 50%, rgba(255,255,255,0) 100%)',
                            'mask-image': 'linear-gradient(to bottom, white 50%, rgba(255,255,255,0) 100%)'
                        });
                    }
                };
                tempImg.src = targetUrl;
            }
        }

        Lampa.Listener.follow("full", function(e) {
            if (e.type === "complite") {
                processFullCard(e);

                var fixOpacity = function() {
                    var isHorizontalNow = window.innerWidth > window.innerHeight;
                    var bgSelectors = isHorizontalNow 
                        ? ".full-start__background, .m-full-start__background" 
                        : ".full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img";
                    var $render = e.object.activity.render();
                    var $bg = $render.find(bgSelectors);
                    if ($bg.length) {
                        $bg.stop(true, true).css("opacity", "1");
                    }
                };
                fixOpacity();
                setTimeout(fixOpacity, 300);
                setTimeout(fixOpacity, 1000); 

                var isRunTrailers = Lampa.Storage.field("cardify_run_trailers");
                var isBgTrailers = Lampa.Storage.field("cardify_trailers_bg");
                var run_slideshow = Lampa.Storage.field("cardify_run_slideshow");
                var trailer_source = Lampa.Storage.field("cardify_trailer_source") || "tmdb";
                var trailer_quality = Lampa.Storage.field("cardify_trailer_quality") || "auto";
                var use_proxy = Lampa.Storage.field("cardify_trailer_proxy") !== false; 

                var processSlideshow = function() {
                    if (run_slideshow && !isBgTrailers) {
                        var movie_data = e.data.movie || e.data.tv || (e.object && e.object.card);
                        
                        if (movie_data && movie_data.id) {
                            var item_id = movie_data.id;
                            var media_type = 'movie';
                            
                            if (e.object && e.object.method === 'tv') {
                                media_type = 'tv';
                            } else if (e.data && e.data.tv && !e.data.movie) {
                                media_type = 'tv';
                            } else if (movie_data.name && !movie_data.title) {
                                media_type = 'tv';
                            }
                            
                            var current_lang = Lampa.Storage.field('tmdb_lang') || 'uk';
                            var include_languages = current_lang + ',xx,null,en';
                            
                            Lampa.Api.sources.tmdb.get(
                                media_type + '/' + item_id + '/images?include_image_language=' + include_languages,
                                {},
                                function(images_data) {
                                    if (images_data && images_data.backdrops && images_data.backdrops.length > 0) {
                                        var lang_backdrops = [];
                                        var no_lang_backdrops = [];
                                        var other_backdrops = [];
                                        
                                        images_data.backdrops.forEach(function(backdrop) {
                                            var lang = backdrop.iso_639_1;
                                            if (lang === current_lang) {
                                                lang_backdrops.push(backdrop);
                                            } else if (!lang || lang === 'xx' || lang === 'null') {
                                                no_lang_backdrops.push(backdrop);
                                            } else {
                                                other_backdrops.push(backdrop);
                                            }
                                        });
                                        
                                        var final_backdrops = [].concat(lang_backdrops);
                                        
                                        if (final_backdrops.length < 5 && no_lang_backdrops.length > 0) {
                                            var needed = 5 - final_backdrops.length;
                                            final_backdrops = final_backdrops.concat(no_lang_backdrops.slice(0, needed));
                                        }
                                        
                                        if (final_backdrops.length < 5 && other_backdrops.length > 0) {
                                            var needed2 = 5 - final_backdrops.length;
                                            other_backdrops.sort(function(a, b) {
                                                return (b.vote_average || 0) - (a.vote_average || 0);
                                            });
                                            final_backdrops = final_backdrops.concat(other_backdrops.slice(0, needed2));
                                        }
                                        
                                        final_backdrops = final_backdrops.slice(0, 15);
                                        
                                        if (final_backdrops.length > 1) {
                                            if (window.cardifyRotationTimer) {
                                                clearInterval(window.cardifyRotationTimer);
                                            }
                                            
                                            var current_index = 0;
                                            var is_active = true;
                                            window.cardifyCurrentItemId = item_id;
                                            
                                            var quality = Lampa.Storage.field('cardify_slideshow_quality') || 'w1280';
                                            var duration = parseInt(Lampa.Storage.field('cardify_slideshow_duration')) || 8000;
                                            
                                            window.cardifyRotationTimer = setInterval(function() {
                                                if (!is_active || window.cardifyCurrentItemId !== item_id) {
                                                    clearInterval(window.cardifyRotationTimer);
                                                    return;
                                                }
                                                
                                                current_index = (current_index + 1) % final_backdrops.length;
                                                var backdrop_url = Lampa.TMDB.image('t/p/' + quality + final_backdrops[current_index].file_path);
                                                
                                                var $render = e.object.activity.render();
                                                var isHorizontalNow = window.innerWidth > window.innerHeight;
                                                var bgSelectors = isHorizontalNow 
                                                    ? '.full-start__background, .m-full-start__background' 
                                                    : '.full-start__background, .m-full-start__background, .m-full-start__poster img, img.full-start__poster, .full-start-new__poster img';
                                                    
                                                var $currentBg = $render.find(bgSelectors).last();
                                                if ($currentBg.length === 0) return;
                                                
                                                var img = new Image();
                                                img.onload = function() {
                                                    if (!is_active || window.cardifyCurrentItemId !== item_id) return;
                                                    
                                                    var $newBg = $currentBg.clone();
                                                    $newBg.attr('src', backdrop_url);
                                                    
                                                    if (!isHorizontalNow) {
                                                        var $parent = $currentBg.parent();
                                                        if ($parent.css('position') === 'static') {
                                                            $parent.css('position', 'relative');
                                                        }
                                                        
                                                        $parent.css({
                                                            '-webkit-mask-image': '-webkit-linear-gradient(top, white 50%, rgba(255,255,255,0) 100%)',
                                                            'mask-image': 'linear-gradient(to bottom, white 50%, rgba(255,255,255,0) 100%)'
                                                        });
                                                        
                                                        $currentBg.css({
                                                            '-webkit-mask-image': 'none',
                                                            'mask-image': 'none'
                                                        });
                                                        
                                                        $newBg.css({
                                                            'position': 'absolute',
                                                            'top': '0',
                                                            'left': '0',
                                                            'width': '100%',
                                                            'height': '100%',
                                                            'object-fit': 'cover',
                                                            'opacity': '0',
                                                            'transition': 'opacity 1.5s ease-in-out',
                                                            'z-index': 2,
                                                            '-webkit-mask-image': 'none',
                                                            'mask-image': 'none',
                                                            'border-radius': $currentBg.css('border-radius') || '0'
                                                        });
                                                        
                                                        $currentBg.after($newBg);
                                                        $newBg[0].offsetHeight; 
                                                        $newBg.css('opacity', '1');
                                                        
                                                        setTimeout(function() {
                                                            if (!is_active || window.cardifyCurrentItemId !== item_id) return;
                                                            $currentBg.attr('src', backdrop_url);
                                                            $newBg.remove();
                                                        }, 1550);
                                                        
                                                    } else {
                                                        $newBg.css({
                                                            'opacity': '0',
                                                            'transition': 'opacity 1.5s ease-in-out',
                                                            'position': $currentBg.css('position') === 'static' ? 'absolute' : $currentBg.css('position'),
                                                            'top': $currentBg.css('top'),
                                                            'left': $currentBg.css('left'),
                                                            'width': $currentBg.css('width'),
                                                            'height': $currentBg.css('height'),
                                                            'z-index': $currentBg.css('z-index'),
                                                            'object-fit': $currentBg.css('object-fit')
                                                        });
                                                        
                                                        var $overlay = $render.find('.cardify-effects-overlay');
                                                        if ($overlay.length) {
                                                            $overlay.before($newBg);
                                                        } else {
                                                            $currentBg.after($newBg);
                                                        }
                                                        
                                                        $newBg[0].offsetHeight; 
                                                        
                                                        $newBg.css('opacity', '1');
                                                        $currentBg.css({
                                                            'transition': 'opacity 1.5s ease-in-out',
                                                            'opacity': '0'
                                                        });
                                                        
                                                        setTimeout(function() {
                                                            if (!is_active || window.cardifyCurrentItemId !== item_id) return;
                                                            $currentBg.remove();
                                                            var bgToRemove = $render.find(bgSelectors).not($newBg);
                                                            bgToRemove.remove();
                                                        }, 1550);
                                                    }
                                                };
                                                img.src = backdrop_url;
                                                
                                            }, duration);
                                            
                                            var stop_rotation = function(a) {    
                                                if (a.type == 'destroy' && a.object.activity === e.object.activity) {    
                                                    is_active = false;
                                                    if (window.cardifyRotationTimer) {
                                                        clearInterval(window.cardifyRotationTimer);
                                                    }
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
                };

                var finalizeTrailer = function(tr) {
                    if (tr && Lampa.Manifest.app_digital >= 220) {
                        if (Lampa.Activity.active().activity === e.object.activity) {
                            new Trailer(e.object, tr, isBgTrailers);
                        } else {
                            var follow = function(a) {
                                if (
                                    a.type == "start" &&
                                    a.object.activity === e.object.activity &&
                                    !e.object.activity.trailer_ready
                                ) {
                                    Lampa.Listener.remove("activity", follow);
                                    new Trailer(e.object, tr, isBgTrailers);
                                }
                            };
                            Lampa.Listener.follow("activity", follow);
                        }
                    } else {
                        isBgTrailers = false;
                    }
                    processSlideshow(); 
                };

                if (isRunTrailers || isBgTrailers) {
                    if (trailer_source === 'imdb') {
                        var imdb_id = e.data.imdb_id || (e.data.external_ids ? e.data.external_ids.imdb_id : null) || (e.data.movie ? e.data.movie.imdb_id : null) || (e.data.tv ? e.data.tv.imdb_id : null) || (e.object && e.object.card ? e.object.card.imdb_id : null);
                        
                        if (imdb_id) {
                            var api_url = "https://api.balloonerismm.workers.dev/movie/" + imdb_id;
                            if (use_proxy) api_url = "https://cors.lampa.stream/" + api_url;

                            $.ajax({
                                url: api_url,
                                type: 'GET',
                                dataType: 'json',
                                success: function(data) {
                                    var tr = null;
                                    if (data && data.trailer && data.trailer.playback) {
                                        var p = {};
                                        for (var k in data.trailer.playback) {
                                            p[k.toLowerCase().replace('p', '')] = data.trailer.playback[k];
                                        }
                                        var order = ['1080', '720', '480', 'sd', 'auto'];
                                        var startIndex = order.indexOf(trailer_quality);
                                        if (startIndex === -1) startIndex = 0;
                                        
                                        var video_url = null;
                                        for (var i = startIndex; i < order.length; i++) {
                                            if (p[order[i]]) { video_url = p[order[i]]; break; }
                                        }
                                        if (!video_url) {
                                            for (var i = 0; i < order.length; i++) {
                                                if (p[order[i]]) { video_url = p[order[i]]; break; }
                                            }
                                        }
                                        if (!video_url) {
                                            var keys = Object.keys(p);
                                            if (keys.length > 0) video_url = p[keys[0]];
                                        }

                                        if (video_url) {
                                            tr = {
                                                type: 'imdb_video',
                                                url: use_proxy ? "https://cors.lampa.stream/" + video_url : video_url,
                                                id: imdb_id,
                                                startTime: 10
                                            };
                                        }
                                    }
                                    
                                    if (tr) {
                                        finalizeTrailer(tr);
                                    } else {
                                        isBgTrailers = false;
                                        processSlideshow();
                                    }
                                },
                                error: function() {
                                    isBgTrailers = false;
                                    processSlideshow();
                                }
                            });
                        } else {
                            isBgTrailers = false;
                            processSlideshow();
                        }
                    } else {
                        var tmdb_tr = getVideo(e.data);
                        if (tmdb_tr) {
                            finalizeTrailer(tmdb_tr);
                        } else {
                            isBgTrailers = false;
                            processSlideshow();
                        }
                    }
                } else {
                    processSlideshow();
                }
            }
        });
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow("app", function(e) {
            if (e.type === "ready") startPlugin();
        });
    }
})();