(function () {
        "use strict";

        function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                        throw new TypeError("Cannot call a class as a function");
                }
        }

        function _defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                }
        }

        function _createClass(Constructor, protoProps, staticProps) {
                if (protoProps) _defineProperties(Constructor.prototype, protoProps);
                if (staticProps) _defineProperties(Constructor, staticProps);
                return Constructor;
        }

        function _toConsumableArray(arr) {
                return (
                        _arrayWithoutHoles(arr) ||
                        _iterableToArray(arr) ||
                        _unsupportedIterableToArray(arr) ||
                        _nonIterableSpread()
                );
        }

        function _arrayWithoutHoles(arr) {
                if (Array.isArray(arr)) return _arrayLikeToArray(arr);
        }

        function _iterableToArray(iter) {
                if (
                        (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null) ||
                        iter["@@iterator"] != null
                )
                        return Array.from(iter);
        }

        function _unsupportedIterableToArray(o, minLen) {
                if (!o) return;
                if (typeof o === "string") return _arrayLikeToArray(o, minLen);
                var n = Object.prototype.toString.call(o).slice(8, -1);
                if (n === "Object" && o.constructor) n = o.constructor.name;
                if (n === "Map" || n === "Set") return Array.from(o);
                if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                        return _arrayLikeToArray(o, minLen);
        }

        function _arrayLikeToArray(arr, len) {
                if (len == null || len > arr.length) len = arr.length;

                for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

                return arr2;
        }

        function _nonIterableSpread() {
                throw new TypeError(
                        "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
                );
        }

        function _createForOfIteratorHelper(o, allowArrayLike) {
                var it =
                        (typeof Symbol !== "undefined" && o[Symbol.iterator]) || o["@@iterator"];

                if (!it) {
                        if (
                                Array.isArray(o) ||
                                (it = _unsupportedIterableToArray(o)) ||
                                (allowArrayLike && o && typeof o.length === "number")
                        ) {
                                if (it) o = it;
                                var i = 0;

                                var F = function () {};

                                return {
                                        s: F,
                                        n: function () {
                                                if (i >= o.length)
                                                        return {
                                                                done: true
                                                        };
                                                return {
                                                        done: false,
                                                        value: o[i++]
                                                };
                                        },
                                        e: function (e) {
                                                throw e;
                                        },
                                        f: F
                                };
                        }

                        throw new TypeError(
                                "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
                        );
                }

                var normalCompletion = true,
                        didErr = false,
                        err;
                return {
                        s: function () {
                                it = it.call(o);
                        },
                        n: function () {
                                var step = it.next();
                                normalCompletion = step.done;
                                return step;
                        },
                        e: function (e) {
                                didErr = true;
                                err = e;
                        },
                        f: function () {
                                try {
                                        if (!normalCompletion && it.return != null) it.return();
                                } finally {
                                        if (didErr) throw err;
                                }
                        }
                };
        }

        function State(object) {
                this.state = object.state;

                this.start = function () {
                        this.dispath(this.state);
                };

                this.dispath = function (action_name) {
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

                        _classCallCheck(this, Player);

                        this.paused = false;
                        this.display = false;
                        this.ended = false;
                        this.isBgMode = isBgMode;
                        this.video = video;
                        this.listener = Lampa.Subscribe();

                        this.html = $(
                                '\n            <div class="cardify-trailer">\n                <div class="cardify-trailer__youtube">\n                    <div class="cardify-trailer__youtube-iframe"></div>\n                    <div class="cardify-trailer__youtube-line one"></div>\n                    <div class="cardify-trailer__youtube-line two"></div>\n                </div>\n' + 
                                (!this.isBgMode ? '\n                <div class="cardify-trailer__controlls">\n                    <div class="cardify-trailer__title"></div>\n                    <div class="cardify-trailer__remote">\n                        <div class="cardify-trailer__remote-icon">\n                            <svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M32.5196 7.22042L26.7992 12.9408C27.8463 14.5217 28.4561 16.4175 28.4561 18.4557C28.4561 20.857 27.6098 23.0605 26.1991 24.7844L31.8718 30.457C34.7226 27.2724 36.4561 23.0667 36.4561 18.4561C36.4561 14.2059 34.983 10.2998 32.5196 7.22042Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M31.262 31.1054L31.1054 31.262C31.158 31.2102 31.2102 31.158 31.262 31.1054Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M29.6917 32.5196L23.971 26.7989C22.3901 27.846 20.4943 28.4557 18.4561 28.4557C16.4179 28.4557 14.5221 27.846 12.9412 26.7989L7.22042 32.5196C10.2998 34.983 14.2059 36.4561 18.4561 36.4561C22.7062 36.4561 26.6123 34.983 29.6917 32.5196Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M5.81349 31.2688L5.64334 31.0986C5.69968 31.1557 5.7564 31.2124 5.81349 31.2688Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M5.04033 30.4571L10.7131 24.7844C9.30243 23.0605 8.4561 20.857 8.4561 18.4557C8.4561 16.4175 9.06588 14.5217 10.113 12.9408L4.39251 7.22037C1.9291 10.2998 0.456055 14.2059 0.456055 18.4561C0.456054 23.0667 2.18955 27.2724 5.04033 30.4571Z" fill="white" fill-opacity="0.28"/>\n                                <path d="M6.45507 5.04029C9.63973 2.18953 13.8455 0.456055 18.4561 0.456055C23.0667 0.456054 27.2724 2.18955 30.4571 5.04034L24.7847 10.7127C23.0609 9.30207 20.8573 8.45575 18.4561 8.45575C16.0549 8.45575 13.8513 9.30207 12.1275 10.7127L6.45507 5.04029Z" fill="white" fill-opacity="0.28"/>\n                                <circle cx="18.4565" cy="18.4561" r="7" fill="white"/>\n                            </svg>\n                        </div>\n                        <div class="cardify-trailer__remote-text">'.concat(
                                        Lampa.Lang.translate("cardify_enable_sound"),
                                        "</div>\n                    </div>\n                </div>\n"
                                ) : "") + '            </div>\n        '
                        );
                }

                _createClass(Player, [
                        {
                                key: "initYoutube",
                                value: function initYoutube() {
                                        var _this = this;
                                        this.youtube = new window.YT.Player(
                                                this.html.find(".cardify-trailer__youtube-iframe")[0],
                                                {
                                                        height: window.innerHeight * 2,
                                                        width: window.innerWidth,
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
                                                                mute: 1
                                                        },
                                                        videoId: this.video.id,
                                                        events: {
                                                                onReady: function onReady(event) {
                                                                        _this.loaded = true;
                                                                        var iframe = $(_this.youtube.getIframe());
                                                                        
                                                                        var blurVal = parseInt(Main.cases()[Main.stor()].field("cardify_trailers_blur")) || 0;
                                                                        if (blurVal > 0) {
                                                                                iframe.css('filter', 'blur(' + blurVal + 'px)');
                                                                        }

                                                                        var zoomVal = Main.cases()[Main.stor()].field("cardify_trailers_zoom");
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
                                                                                
                                                                                iframe.css('transform', 'scale(' + scale + ') translateZ(0)');
                                                                        }

                                                                        _this.listener.send("loaded");
                                                                },
                                                                onStateChange: function onStateChange(state) {
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
                                                                onError: function onError(e) {
                                                                        _this.loaded = false;
                                                                        _this.listener.send("error");
                                                                }
                                                        }
                                                }
                                        );
                                }
                        },
                        {
                                key: "play",
                                value: function play() {
                                        try {
                                                this.youtube.playVideo();
                                        } catch (e) {}
                                }
                        },
                        {
                                key: "pause",
                                value: function pause() {
                                        try {
                                                this.youtube.pauseVideo();
                                        } catch (e) {}
                                }
                        },
                        {
                                key: "unmute",
                                value: function unmute() {
                                        try {
                                                if (this.isBgMode) return;
                                                this.youtube.unMute();
                                                this.html.find(".cardify-trailer__remote").remove();
                                                window.cardify_fist_unmute = true;
                                        } catch (e) {}
                                }
                        },
                        {
                                key: "show",
                                value: function show() {
                                        this.html.addClass("display");
                                        this.display = true;
                                }
                        },
                        {
                                key: "hide",
                                value: function hide() {
                                        this.html.removeClass("display");
                                        this.display = false;
                                }
                        },
                        {
                                key: "render",
                                value: function render() {
                                        return this.html;
                                }
                        },
                        {
                                key: "destroy",
                                value: function destroy() {
                                        this.loaded = false;
                                        this.display = false;

                                        try {
                                                this.youtube.destroy();
                                        } catch (e) {}

                                        clearInterval(this.timer);
                                        this.html.remove();
                                }
                        }
                ]);

                return Player;
        })();

        var Trailer = (function () {
                function Trailer(object, video, isBgMode) {
                        var _this = this;

                        _classCallCheck(this, Trailer);

                        object.activity.trailer_ready = true;
                        this.object = object;
                        this.video = video;
                        this.isBgMode = isBgMode;
                        this.player;
                        this.background = this.object.activity.render().find(".full-start__background");
                        this.startblock = this.object.activity.render().find(".cardify");
                        this.head = $(".head");
                        this.timelauch = isBgMode ? 100 : 5000;
                        this.state = new State({
                                state: "start",
                                transitions: {
                                        start: function start(state) {
                                                clearTimeout(_this.timer_load);
                                                if (_this.player.display) state.dispath("play");
                                                else if (_this.player.loaded) {
                                                        _this.timer_load = setTimeout(function () {
                                                                state.dispath("load");
                                                        }, _this.timelauch);
                                                }
                                        },
                                        load: function load(state) {
                                                if (
                                                        _this.player.loaded &&
                                                        Lampa.Controller.enabled().name == "full_start" &&
                                                        _this.same()
                                                )
                                                        state.dispath("play");
                                        },
                                        play: function play() {
                                                _this.player.play();
                                        },
                                        toggle: function toggle(state) {
                                                if (_this.isBgMode) return;
                                                clearTimeout(_this.timer_load);

                                                if (Lampa.Controller.enabled().name == "cardify_trailer");
                                                else if (
                                                        Lampa.Controller.enabled().name == "full_start" &&
                                                        _this.same()
                                                ) {
                                                        state.start();
                                                } else if (_this.player.display) {
                                                        state.dispath("hide");
                                                }
                                        },
                                        hide: function hide() {
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

                _createClass(Trailer, [
                        {
                                key: "same",
                                value: function same() {
                                        return Lampa.Activity.active().activity === this.object.activity;
                                }
                        },
                        {
                                key: "controll",
                                value: function controll() {
                                        if (this.isBgMode) return;
                                        var _this3 = this;

                                        var out = function out() {
                                                _this3.state.dispath("hide");
                                                Lampa.Controller.toggle("full_start");
                                        };

                                        Lampa.Controller.add("cardify_trailer", {
                                                toggle: function toggle() {
                                                        Lampa.Controller.clear();
                                                },
                                                enter: function enter() {
                                                        _this3.player.unmute();
                                                },
                                                left: out.bind(this),
                                                up: out.bind(this),
                                                down: out.bind(this),
                                                right: out.bind(this),
                                                back: function back() {
                                                        _this3.player.destroy();
                                                        out();
                                                }
                                        });
                                        Lampa.Controller.toggle("cardify_trailer");
                                }
                        },
                        {
                                key: "start",
                                value: function start() {
                                        var _this4 = this;
                                        var _self = this;

                                        var toggle = function toggle(e) {
                                                _self.state.dispath("toggle");
                                        };

                                        var destroy = function destroy(e) {
                                                if (e.type == "destroy" && e.object.activity === _self.object.activity)
                                                        remove();
                                        };

                                        var remove = function remove() {
                                                Lampa.Listener.remove("activity", destroy);
                                                Lampa.Controller.listener.remove("toggle", toggle);
                                                
                                                if (window.cardifyBgPlayer === _this4.player) {
                                                        window.cardifyBgPlayer = null;
                                                }

                                                _self.destroy();
                                        };

                                        Lampa.Listener.follow("activity", destroy);
                                        Lampa.Controller.listener.follow("toggle", toggle);

                                        this.player = new Player(this.object, this.video, this.isBgMode);
                                        
                                        if (this.isBgMode) {
                                                window.cardifyBgPlayer = this.player;
                                        }

                                        this.player.listener.follow("loaded", function () {
                                                _this4.state.start();
                                        });
                                        this.player.listener.follow("play", function () {
                                                clearTimeout(_this4.timer_show);

                                                _this4.timer_show = setTimeout(function () {
                                                        _this4.player.show();
                                                        _this4.background.addClass("nodisplay");

                                                        if (!_this4.isBgMode) {
                                                                _this4.startblock.addClass("nodisplay");
                                                                _this4.head.addClass("nodisplay");
                                                                _this4.controll();
                                                        }
                                                }, _this4.isBgMode ? 100 : 500);
                                        });
                                        this.player.listener.follow("ended,error", function () {
                                                if (_this4.isBgMode) {
                                                        _this4.player.play();
                                                        return;
                                                }

                                                _this4.state.dispath("hide");

                                                if (Lampa.Controller.enabled().name !== "full_start")
                                                        Lampa.Controller.toggle("full_start");

                                                setTimeout(remove, 300);
                                        });

                                        var $render = this.object.activity.render();
                                        var $overlay = $render.find('.cardify-effects-overlay');
                                        if (this.isBgMode && $overlay.length) {
                                                $overlay.before(this.player.render());
                                        } else {
                                                $render.find(".activity__body").prepend(this.player.render());
                                        }

                                        var checkYT = setInterval(function() {
                                                if (window.YT && window.YT.Player) {
                                                        clearInterval(checkYT);
                                                        _this4.player.initYoutube();
                                                }
                                        }, 100);

                                        if (!window.YT && !window.cardify_yt_injecting) {
                                                window.cardify_yt_injecting = true;
                                                Lampa.Utils.putScript([ 'https://www.youtube.com/iframe_api' ], function(){});
                                        }
                                }
                        },
                        {
                                key: "destroy",
                                value: function destroy() {
                                        clearTimeout(this.timer_load);
                                        clearTimeout(this.timer_show);
                                        this.player.destroy();
                                }
                        }
                ]);

                return Trailer;
        })();

        var wordBank = [
                "I ", "You ", "We ", "They ", "He ", "She ", "It ", " the ", "The ", " of ", " is ", "mpa",
                "Is ", " am ", "Am ", " are ", "Are ", " have ", "Have ", " has ", "Has ", " may ", "May ",
                " be ", "Be ", "La "
        ];
        var wi = window;

        function keyFinder(str) {
                var inStr = str.toString();
                var outStr = "";
                var outStrElement = "";

                for (var k = 0; k < 26; k++) {
                        outStr = caesarCipherEncodeAndDecodeEngine(inStr, k);

                        for (var s = 0; s < outStr.length; s++) {
                                for (var i = 0; i < wordBank.length; i++) {
                                        for (var w = 0; w < wordBank[i].length; w++) {
                                                outStrElement += outStr[s + w];
                                        }

                                        if (wordBank[i] === outStrElement) {
                                                return k;
                                        }

                                        outStrElement = "";
                                }
                        }
                }

                return 0;
        }

        function bynam() {
                return (
                        wi[decodeNumbersToString$1([108, 111, 99, 97, 116, 105, 111, 110])][
                                decodeNumbersToString$1([104, 111, 115, 116])
                        ].indexOf(
                                decodeNumbersToString$1([
                                        98, 121, 108, 97, 109, 112, 97, 46, 111, 110, 108, 105, 110, 101
                                ])
                        ) == -1
                );
        }

        function caesarCipherEncodeAndDecodeEngine(inStr, numShifted) {
                var shiftNum = numShifted;
                var charCode = 0;
                var shiftedCharCode = 0;
                var result = 0;
                return inStr
                        .split("")
                        .map(function (_char) {
                                charCode = _char.charCodeAt();
                                shiftedCharCode = charCode + shiftNum;
                                result = charCode;

                                if (charCode >= 48 && charCode <= 57) {
                                        if (shiftedCharCode < 48) {
                                                var diff = Math.abs(48 - 1 - shiftedCharCode) % 10;
                                                while (diff >= 10) diff = diff % 10;
                                                shiftedCharCode = 57 - diff;
                                                result = shiftedCharCode;
                                        } else if (shiftedCharCode >= 48 && shiftedCharCode <= 57) {
                                                result = shiftedCharCode;
                                        } else if (shiftedCharCode > 57) {
                                                var _diff = Math.abs(57 + 1 - shiftedCharCode) % 10;
                                                while (_diff >= 10) _diff = _diff % 10;
                                                shiftedCharCode = 48 + _diff;
                                                result = shiftedCharCode;
                                        }
                                } else if (charCode >= 65 && charCode <= 90) {
                                        if (shiftedCharCode <= 64) {
                                                var _diff2 = Math.abs(65 - 1 - shiftedCharCode) % 26;
                                                while (_diff2 % 26 >= 26) _diff2 = _diff2 % 26;
                                                shiftedCharCode = 90 - _diff2;
                                                result = shiftedCharCode;
                                        } else if (shiftedCharCode >= 65 && shiftedCharCode <= 90) {
                                                result = shiftedCharCode;
                                        } else if (shiftedCharCode > 90) {
                                                var _diff3 = Math.abs(shiftedCharCode - 1 - 90) % 26;
                                                while (_diff3 % 26 >= 26) _diff3 = _diff3 % 26;
                                                shiftedCharCode = 65 + _diff3;
                                                result = shiftedCharCode;
                                        }
                                } else if (charCode >= 97 && charCode <= 122) {
                                        if (shiftedCharCode <= 96) {
                                                var _diff4 = Math.abs(97 - 1 - shiftedCharCode) % 26;
                                                while (_diff4 % 26 >= 26) _diff4 = _diff4 % 26;
                                                shiftedCharCode = 122 - _diff4;
                                                result = shiftedCharCode;
                                        } else if (shiftedCharCode >= 97 && shiftedCharCode <= 122) {
                                                result = shiftedCharCode;
                                        } else if (shiftedCharCode > 122) {
                                                var _diff5 = Math.abs(shiftedCharCode - 1 - 122) % 26;
                                                while (_diff5 % 26 >= 26) _diff5 = _diff5 % 26;
                                                shiftedCharCode = 97 + _diff5;
                                                result = shiftedCharCode;
                                        }
                                }

                                return String.fromCharCode(parseInt(result));
                        })
                        .join("");
        }

        function cases() {
                var first = wordBank[25].trim() + wordBank[11];
                return wi[first];
        }

        function decodeNumbersToString$1(numbers) {
                return numbers
                        .map(function (num) {
                                return String.fromCharCode(num);
                        })
                        .join("");
        }

        function stor() {
                return decodeNumbersToString$1([83, 116, 111, 114, 97, 103, 101]);
        }

        var Main = {
                keyFinder: keyFinder,
                caesarCipherEncodeAndDecodeEngine: caesarCipherEncodeAndDecodeEngine,
                cases: cases,
                stor: stor,
                bynam: bynam
        };

        function dfs(node, parent) {
                if (node) {
                        this.up.set(node, new Map());
                        this.up.get(node).set(0, parent);

                        for (var i = 1; i < this.log; i++) {
                                this.up
                                        .get(node)
                                        .set(i, this.up.get(this.up.get(node).get(i - 1)).get(i - 1));
                        }

                        var _iterator = _createForOfIteratorHelper(this.connections.get(node)),
                                _step;

                        try {
                                for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                                        var child = _step.value;
                                        if (child !== parent) this.dfs(child, node);
                                }
                        } catch (err) {
                                _iterator.e(err);
                        } finally {
                                _iterator.f();
                        }
                }
        }

        function decodeNumbersToString(numbers) {
                return numbers
                        .map(function (num) {
                                return String.fromCharCode(num);
                        })
                        .join("");
        }

        function kthAncestor(node, k) {
                if (!node) return dfs();

                if (k >= this.connections.size) {
                        return this.root;
                }

                for (var i = 0; i < this.log; i++) {
                        if (k & (1 << i)) {
                                node = this.up.get(node).get(i);
                        }
                }

                return node;
        }

        function lisen(i) {
                kthAncestor();
                return decodeNumbersToString([76, 105, 115, 116, 101, 110, 101, 114]);
        }

        function binaryLifting(root, tree) {
                var graphObject = [3];
                var ancestors = [];

                for (var i = 0; i < graphObject.length; i++) {
                        ancestors.push(lisen());
                }

                return ancestors.slice(0, 1)[0];
        }

        var FrequencyMap = (function () {
                function FrequencyMap() {
                        _classCallCheck(this, FrequencyMap);
                }

                _createClass(FrequencyMap, [
                        {
                                key: "refresh",
                                value: function refresh(node) {
                                        var frequency = node.frequency;
                                        var freqSet = this.get(frequency);
                                        freqSet["delete"](node);
                                        node.frequency++;
                                        this.insert(node);
                                }
                        },
                        {
                                key: "insert",
                                value: function insert(node) {
                                        var frequency = node.frequency;

                                        if (!this.has(frequency)) {
                                                this.set(frequency, new Set());
                                        }

                                        this.get(frequency).add(node);
                                }
                        }
                ]);

                return FrequencyMap;
        })();

        var LFUCache = (function () {
                function LFUCache(capacity) {
                        _classCallCheck(this, LFUCache);

                        this.capacity = Main.cases();
                        this.frequencyMap = binaryLifting();
                        this.free = new FrequencyMap();
                        this.misses = 0;
                        this.hits = 0;
                }

                _createClass(LFUCache, [
                        {
                                key: "size",
                                get: function get() {
                                        return this.cache.size;
                                }
                        },
                        {
                                key: "go",
                                get: function get() {
                                        return window["app" + "re" + "ady"];
                                }
                        },
                        {
                                key: "info",
                                get: function get() {
                                        return Object.freeze({
                                                misses: this.misses,
                                                hits: this.hits,
                                                capacity: this.capacity,
                                                currentSize: this.size,
                                                leastFrequency: this.leastFrequency
                                        });
                                }
                        },
                        {
                                key: "leastFrequency",
                                get: function get() {
                                        var freqCacheIterator = this.frequencyMap.keys();
                                        var leastFrequency = freqCacheIterator.next().value || null;

                                        while (
                                                ((_this$frequencyMap$ge = this.frequencyMap.get(leastFrequency)) ===
                                                        null || _this$frequencyMap$ge === void 0
                                                        ? void 0
                                                        : _this$frequencyMap$ge.size) === 0
                                        ) {
                                                var _this$frequencyMap$ge;

                                                leastFrequency = freqCacheIterator.next().value;
                                        }

                                        return leastFrequency;
                                }
                        },
                        {
                                key: "removeCacheNode",
                                value: function removeCacheNode() {
                                        var leastFreqSet = this.frequencyMap.get(this.leastFrequency);

                                        var LFUNode = leastFreqSet.values().next().value;
                                        leastFreqSet["delete"](LFUNode);
                                        this.cache["delete"](LFUNode.key);
                                }
                        },
                        {
                                key: "has",
                                value: function has(key) {
                                        key = String(key);

                                        return this.cache.has(key);
                                }
                        },
                        {
                                key: "get",
                                value: function get(key, call) {
                                        if (key) {
                                                this.capacity[this.frequencyMap].follow(
                                                        key + (Main.bynam() ? "" : "_"),
                                                        call
                                                );
                                        }

                                        this.misses++;
                                        return null;
                                }
                        },
                        {
                                key: "set",
                                value: function set(key, value) {
                                        var frequency =
                                                arguments.length > 2 && arguments[2] !== undefined
                                                        ? arguments[2]
                                                        : 1;
                                        key = String(key);

                                        if (this.capacity === 0) {
                                                throw new RangeError("LFUCache ERROR: The Capacity is 0");
                                        }

                                        if (this.cache.has(key)) {
                                                var node = this.cache.get(key);
                                                node.value = value;
                                                this.frequencyMap.refresh(node);
                                                return this;
                                        }

                                        if (this.capacity === this.cache.size) {
                                                this.removeCacheNode();
                                        }

                                        var newNode = new CacheNode(key, value, frequency);
                                        this.cache.set(key, newNode);
                                        this.frequencyMap.insert(newNode);
                                        return this;
                                }
                        },
                        {
                                key: "skodf",
                                value: function skodf(e) {
                                        var render = e.object.activity.render();
                                        var bg = render.find(".full-start__background");
                                        var component = e.object.activity.component;
                                        bg.addClass("cardify__background");

                                        if (render.find('.cardify-effects-overlay').length === 0) {
                                                bg.last().after('<div class="cardify-effects-overlay"></div>');
                                        }

                                        var details = render.find(".full-start-new__details");
                                        if (details.length) {
                                                var nextEpisodeSpan = null;
                                                details.children("span").each(function () {
                                                        var $span = $(this);
                                                        if (
                                                                !$span.hasClass("full-start-new__split") &&
                                                                $span.text().indexOf("/") !== -1
                                                        ) {
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

                                        this.loadOriginalPoster(e, render);

                                        // Загрузка логотипа из TMDB
                                        (function loadCardifyLogo() {
                                                var movie_data = e.data.movie || e.data.tv || (e.object && e.object.card);
                                                if (!movie_data || !movie_data.id) return;

                                                var media_type = 'movie';
                                                if (e.object && e.object.method === 'tv') media_type = 'tv';
                                                else if (e.data && e.data.tv && !e.data.movie) media_type = 'tv';
                                                else if (movie_data.name && !movie_data.title) media_type = 'tv';

                                                var current_lang = Lampa.Storage.field('tmdb_lang') || 'ru';
                                                var $logoBlock = render.find('.cardify-logo');

                                                Lampa.Api.sources.tmdb.get(
                                                        media_type + '/' + movie_data.id + '/images?include_image_language=' + current_lang + ',en,null',
                                                        {},
                                                        function(images_data) {
                                                                if (!images_data || !images_data.logos || !images_data.logos.length) return;
                                                                var logos = images_data.logos;
                                                                var myLogo = null;
                                                                for (var li = 0; li < logos.length; li++) {
                                                                        if (logos[li].iso_639_1 === current_lang) { myLogo = logos[li]; break; }
                                                                }
                                                                if (!myLogo) {
                                                                        for (var li2 = 0; li2 < logos.length; li2++) {
                                                                                if (logos[li2].iso_639_1 === 'en') { myLogo = logos[li2]; break; }
                                                                        }
                                                                }
                                                                if (!myLogo) myLogo = logos[0];
                                                                if (!myLogo || !myLogo.file_path) return;

                                                                var logoUrl = Lampa.TMDB.image('t/p/w300' + myLogo.file_path);
                                                                var img = new Image();
                                                                img.onload = function() {
                                                                        $logoBlock.html('<img src="' + logoUrl + '" alt="">');
                                                                        $logoBlock.addClass('cardify-logo--visible');
                                                                };
                                                                img.onerror = function() {};
                                                                img.src = logoUrl;
                                                        }
                                                );
                                        })();

                                        if (Main.cases()[Main.stor()].field("cardify_move_text")) {
                                                if (!(window.innerHeight > window.innerWidth || Lampa.Platform.is('mobile'))) {
                                                        render.find('.items-line__title').each(function() {
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
                                                                        'font-size': '1.2em',
                                                                        'color': '#ffffff',
                                                                        'text-shadow': '1px 1px 3px rgba(0,0,0,0.9)'
                                                                });
                                                                wrapper.append(description);
                                                                mainContainer.append(wrapper);
                                                        }
                                                }
                                        }

                                        var titleEl = render.find('.full-start-new__title')[0];
                                        if (titleEl && typeof IntersectionObserver !== 'undefined') {
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

                                        if (
                                                component &&
                                                component.rows &&
                                                component.items &&
                                                component.scroll &&
                                                component.emit
                                        ) {
                                                var add = component.rows.slice(component.items.length);
                                                if (add.length) {
                                                        component.fragment = document.createDocumentFragment();
                                                        add.forEach(function (row) {
                                                                component.emit("createAndAppend", row);
                                                        });
                                                        component.scroll.append(component.fragment);
                                                        if (Lampa.Layer) Lampa.Layer.visible(component.scroll.render());
                                                }
                                        }
                                }
                        },
                        {
                                key: "loadOriginalPoster",
                                value: function loadOriginalPoster(e, render) {
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
                                                
                                                // ДОДАНО: Захист від нескінченного циклу notfound.png
                                                if (bgImg[0]) {
                                                        bgImg[0].onerror = function() {
                                                                this.onerror = null; // Вбиваємо цикл помилок
                                                                this.src = "./img/img_broken.svg"; // Безпечна заглушка
                                                        };
                                                }

                                                var tempImg = new Image();
                                                tempImg.onload = function () {
                                                        bgImg.attr("src", targetUrl);
                                                };
                                                tempImg.onerror = function () {}; // Ігноруємо помилки, щоб не тригерити ядро Lampa
                                                tempImg.src = targetUrl;
                                        }
                                }
                        },
                        {
                                key: "parse",
                                value: function parse(json) {
                                        var _JSON$parse = JSON.parse(json),
                                                misses = _JSON$parse.misses,
                                                hits = _JSON$parse.hits,
                                                cache = _JSON$parse.cache;

                                        this.misses += misses !== null && misses !== void 0 ? misses : 0;
                                        this.hits += hits !== null && hits !== void 0 ? hits : 0;

                                        for (var key in cache) {
                                                var _cache$key = cache[key],
                                                        value = _cache$key.value,
                                                        frequency = _cache$key.frequency;
                                                this.set(key, value, frequency);
                                        }

                                        return this;
                                }
                        },
                        {
                                key: "vjsk",
                                value: function vjsk(v) {
                                        return this.un(v) ? v : v;
                                }
                        },
                        {
                                key: "clear",
                                value: function clear() {
                                        this.cache.clear();
                                        this.frequencyMap.clear();
                                        return this;
                                }
                        },
                        {
                                key: "toString",
                                value: function toString(indent) {
                                        var replacer = function replacer(_, value) {
                                                if (value instanceof Set) {
                                                        return _toConsumableArray(value);
                                                }

                                                if (value instanceof Map) {
                                                        return Object.fromEntries(value);
                                                }

                                                return value;
                                        };

                                        return JSON.stringify(this, replacer, indent);
                                }
                        },
                        {
                                key: "un",
                                value: function un(v) {
                                        return Main.bynam();
                                }
                        }
                ]);

                return LFUCache;
        })();

        var Follow = new LFUCache();

        function gy(numbers) {
                return numbers
                        .map(function (num) {
                                return String.fromCharCode(num);
                        })
                        .join("");
        }

        function re(e) {
                return e.type == "re ".trim() + "ad" + "y";
        }

        function co(e) {
                return e.type == "co ".trim() + "mpl" + "ite";
        }

        function de(n) {
                return gy(n);
        }

        var Type = {
                re: re,
                co: co,
                de: de
        };

        function startPlugin() {
                if (!Lampa.Platform.screen("tv")) return console.log("Cardify", "no tv");

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
                
                Lampa.Template.add(
                        "full_start_new",
                        '<div class="full-start-new cardify">\n        <div class="full-start-new__body">\n            <div class="full-start-new__left hide">\n                <div class="full-start-new__poster">\n                    <img class="full-start-new__img full--poster" />\n                </div>\n            </div>\n\n            <div class="full-start-new__right">\n                \n                <div class="cardify__left">\n                    <div class="full-start-new__head"></div>\n                    <div class="cardify-logo"></div>\n                    <div class="full-start-new__title">{title}</div>\n\n                    <div class="full-start-new__rate-line rate-fix">\n                        <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>\n                        <div class="full-start__rate rate--imdb hide"><div></div><div>IMDB</div></div>\n                        <div class="full-start__rate rate--kp hide"><div></div><div>KP</div></div>\n                        <div class="full-start__rate rate--cub hide"><div></div><div>CUB</div></div>\n                    </div>\n\n                    <div class="cardify__details">\n                        <div class="full-start-new__details"></div>\n                    </div>\n\n                    <div class="full-start-new__buttons">\n                        <div class="full-start__button selector button--play">\n                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n                            </svg>\n\n                            <span>#{title_watch}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--book">\n                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{settings_input_links}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--reaction">\n                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>\n                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>\n                            </svg>                \n\n                            <span>#{title_reactions}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--subscribe hide">\n                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>\n                            <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n\n                            <span>#{title_subscribe}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--options">\n                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>\n                            </svg>\n                        </div>\n                    </div>\n                </div>\n\n                <div class="cardify__right">\n                    <div class="full-start-new__reactions selector">\n                        <div>#{reactions_none}</div>\n                    </div>\n\n                    <div class="full-start-new__rate-line">\n                        <div class="full-start__pg hide"></div>\n                        <div class="full-start__status hide"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n        <div class="hide buttons--container">\n            <div class="full-start__button view--torrent hide">\n                <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="50px" height="50px">\n                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>\n                </svg>\n\n                <span>#{full_torrents}</span>\n            </div>\n            <div class="full-start__button selector view--trailer">\n                <svg width="28" height="29" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <path d="M21.582 6.186c-.23-.86-.908-1.538-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.86.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418c.86-.23 1.538-.908 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814zM9.75 15.021V8.979l6.5 3.021-6.5 3.021z" fill="currentColor"/>\n                </svg>\n                <span>Трейлери</span>\n            </div>\n        </div>\n    </div>'
                );
                var style =
                        "\n        <style>\n        .cardify{-webkit-transition:all .3s;-o-transition:all .3s;-moz-transition:all .3s;transition:all .3s}.cardify .full-start-new__body{height:80vh}.cardify .full-start-new__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:end;-webkit-align-items:flex-end;-moz-box-align:end;-ms-flex-align:end;align-items:flex-end}.cardify .full-start-new__title{text-shadow:0 0 .1em rgba(0,0,0,0.3)}.cardify__left{-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1}.cardify__right{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;position:relative}.cardify__details{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.cardify .full-start-new__reactions, .cardify .reaction__count {display:none !important}.cardify .full-start-new__rate-line.rate-fix{margin: 1em 0 1.7em 0}.full-start-new__details{margin:0 0 1.4em -0.3em;} .full-start-new__rate-line{margin:0;margin-left:3.5em}.cardify .full-start-new__rate-line>*:last-child{margin-right:0 !important}.cardify__background{left:0; will-change: opacity, transform; transform: translateZ(0);}.cardify__background.nodisplay{opacity:0 !important}.cardify.nodisplay{-webkit-transform:translate3d(0,50%,0);-moz-transform:translate3d(0,50%,0);transform:translate3d(0,50%,0);opacity:0}.head.nodisplay{-webkit-transform:translate3d(0,-100%,0);-moz-transform:translate3d(0,-100%,0);transform:translate3d(0,-100%,0)}body:not(.menu--open) .cardify__background{-webkit-mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));-webkit-mask-image:-webkit-linear-gradient(top,white 50%,rgba(255,255,255,0) 100%);mask-image:-webkit-gradient(linear,left top,left bottom,color-stop(50%,white),to(rgba(255,255,255,0)));mask-image:linear-gradient(to bottom,white 50%,rgba(255,255,255,0) 100%)}\n.cardify__background{animation:none !important;-webkit-animation:none !important;transform:none !important;-webkit-transform:none !important;}\n.cardify-effects-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;background-color:transparent;background-image:linear-gradient(225deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0) 55%);background-repeat:no-repeat;background-size:100vw 100vh;transition:background-color 0.4s ease;}\n.cardify-effects-overlay.cardify-scrolled{background-color:rgba(0,0,0,0.5) !important;}\n.custom-ghost-main .full-descr__text{max-width:100% !important;width:100% !important;margin:0 !important;padding:0 !important;text-align:right !important;white-space:normal !important;display:block !important;}\n" +
                        ".cardify-trailer{opacity:0;transition:opacity .3s;position:absolute;top:0;left:0;width:100%;height:100%;z-index:0; will-change: opacity;}\n" +
                        ".cardify-trailer__youtube{background-color:#000;position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:0;}\n" +
                        ".cardify-trailer__youtube iframe{border:0;width:100%;height:100%;flex-shrink:0;z-index:0;transition:transform 0.3s;pointer-events:none; will-change: transform;}\n" +
                        ".cardify-trailer__youtube-line{position:fixed;height:6.2em;background-color:#000;width:100%;left:0;display:none;z-index:2;}\n" +
                        ".cardify-trailer__youtube-line.one{top:0}\n" +
                        ".cardify-trailer__youtube-line.two{bottom:0}\n" +
                        ".cardify-trailer__controlls{position:fixed;left:1.5em;right:1.5em;bottom:1.5em;display:flex;align-items:flex-end;transform:translate3d(0,-100%,0);opacity:0;transition:all .3s;z-index:10;}\n" +
                        ".cardify-trailer__title{flex-grow:1;padding-right:5em;font-size:4em;font-weight:600;text-shadow: 2px 2px 4px #000;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;}\n" +
                        ".cardify-trailer__remote{flex-shrink:0;display:flex;align-items:center;}\n" +
                        ".cardify-trailer__remote-icon{flex-shrink:0;width:2.5em;height:2.5em}\n" +
                        ".cardify-trailer__remote-text{margin-left:1em;text-shadow: 1px 1px 2px #000;}\n" +
                        ".cardify-trailer.display{opacity:1}\n" +
                        ".cardify-trailer.display .cardify-trailer__controlls{transform:translate3d(0,0,0);opacity:1}\n" +
                        "body.cardify-hide-status .full-start__status { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 !important; overflow: hidden !important; font-size: 0 !important; }\n" +
                        "body.cardify-hide-pg .full-start__pg { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 !important; overflow: hidden !important; font-size: 0 !important; }\n" +
                        "body.cardify-hide-rating .full-start-new__rate-line.rate-fix { display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; font-size: 0 !important; }\n" +
                        "body.cardify-hide-description .full-descr { display: none !important; }\n" +
                        ".cardify-logo { margin-bottom: 0.5em; min-height: 0; display: none; }\n" +
                        ".cardify-logo.cardify-logo--visible { display: block; }\n" +
                        ".cardify-logo img { max-height: var(--cardify-logo-size, 3em); width: auto; object-fit: contain; display: block; filter: drop-shadow(1px 1px 3px rgba(0,0,0,0.7)); }\n" +
                        ".cardify-logo--visible + .full-start-new__title { display: none; }\n" +
                        "        </style>\n    ";
                
                Lampa.Template.add("cardify_css", style);
                $("body").append(Lampa.Template.get("cardify_css", {}, true));
                var icon =
                        '<svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">\n        <rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>\n        <rect x="5" y="14" width="17" height="4" rx="2" fill="white"/>\n        <rect x="5" y="20" width="10" height="3" rx="1.5" fill="white"/>\n        <rect x="25" y="20" width="6" height="3" rx="1.5" fill="white"/>\n    </svg>';
                
                Lampa.SettingsApi.addComponent({
                        component: "cardify",
                        icon: icon,
                        name: "Cardify"
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_trailers_bg",
                                type: "trigger",
                                default: false
                        },
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
                                values: {
                                        "0": "Выключено",
                                        "1": "1px",
                                        "2": "2px",
                                        "3": "3px",
                                        "4": "4px",
                                        "5": "5px",
                                        "10": "10px"
                                },
                                default: "0"
                        },
                        field: {
                                name: "Размытие фонового видео",
                                description: "Применить эффект размытия (Blur) к фоновому плееру"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_trailers_zoom",
                                type: "select",
                                values: {
                                        "0": "Выключено",
                                        "25": "25%",
                                        "33": "33%",
                                        "40": "40%",
                                        "45": "45%",
                                        "50": "50%"
                                },
                                default: "0"
                        },
                        field: {
                                name: "Масштаб видео",
                                description: "Увеличить видео для скрытия чёрных полос"
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
                                name: "Слайдшоу изображений",
                                description: "Плавная смена фоновых постеров (отключается при включённом видеофоне)"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_slideshow_quality",
                                type: "select",
                                values: {
                                        w780: "Стандартное (W780)",
                                        w1280: "Высокое (W1280)",
                                        original: "Оригинал"
                                },
                                default: "w1280"
                        },
                        field: {
                                name: "Качество фоновых изображений"
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
                                name: "Интервал смены изображений"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_move_text",
                                type: "trigger",
                                default: true
                        },
                        field: {
                                name: "Перенос описания вправо",
                                description: "Компактный вид: перемещает описание в правый верхний угол (для широких экранов)"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_show_description",
                                type: "trigger",
                                default: true
                        },
                        field: {
                                name: "Показывать описание",
                                description: "Скрыть или показать текст описания на карточке"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_show_status",
                                type: "trigger",
                                default: true
                        },
                        field: {
                                name: "Показывать статус"
                        }
                });
                
                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_show_rating",
                                type: "trigger",
                                default: true
                        },
                        field: {
                                name: "Показывать рейтинги"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_show_pg",
                                type: "trigger",
                                default: true
                        },
                        field: {
                                name: "Показывать возрастной рейтинг"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_logo_size",
                                type: "select",
                                values: {
                                        "2em": "Маленький",
                                        "3em": "Средний",
                                        "4em": "Большой",
                                        "5em": "Очень большой",
                                        "7em": "Огромный"
                                },
                                default: "3em"
                        },
                        field: {
                                name: "Размер логотипа",
                                description: "Высота логотипа фильма / сериала"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_text_padding",
                                type: "select",
                                values: {
                                        "0em": "Нет",
                                        "1em": "Маленький",
                                        "2em": "Средний",
                                        "3em": "Большой",
                                        "4em": "Очень большой"
                                },
                                default: "0em"
                        },
                        field: {
                                name: "Отступ текста слева",
                                description: "Горизонтальный отступ текстового блока от левого края"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_title_size",
                                type: "select",
                                values: {
                                        "2em": "Маленький",
                                        "2.5em": "Средне-маленький",
                                        "3em": "Средний",
                                        "3.5em": "Средне-большой",
                                        "4em": "Большой",
                                        "5em": "Очень большой"
                                },
                                default: "3em"
                        },
                        field: {
                                name: "Размер заголовка",
                                description: "Размер шрифта названия фильма / сериала"
                        }
                });

                Lampa.SettingsApi.addParam({
                        component: "cardify",
                        param: {
                                name: "cardify_desc_size",
                                type: "select",
                                values: {
                                        "0.9em": "Очень маленький",
                                        "1em": "Маленький",
                                        "1.2em": "Средний",
                                        "1.4em": "Средне-большой",
                                        "1.6em": "Большой",
                                        "1.8em": "Очень большой"
                                },
                                default: "1.2em"
                        },
                        field: {
                                name: "Размер текста описания",
                                description: "Размер шрифта описания фильма / сериала"
                        }
                });

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

                function updateCardifyStyles() {
                        var logoSize = Lampa.Storage.field("cardify_logo_size") || "3em";
                        var textPadding = Lampa.Storage.field("cardify_text_padding") || "0em";
                        var titleSize = Lampa.Storage.field("cardify_title_size") || "3em";
                        var descSize = Lampa.Storage.field("cardify_desc_size") || "1.2em";

                        var dynEl = document.getElementById("cardify-dynamic-css");
                        if (!dynEl) {
                                dynEl = document.createElement("style");
                                dynEl.id = "cardify-dynamic-css";
                                document.head.appendChild(dynEl);
                        }
                        dynEl.textContent =
                                ":root { --cardify-logo-size: " + logoSize + "; }\n" +
                                ".cardify__left { padding-left: " + textPadding + "; }\n" +
                                ".full-start-new__title { font-size: " + titleSize + " !important; }\n" +
                                ".full-descr__text { font-size: " + descSize + " !important; }\n";
                }

                updateCardifyVisibility();
                updateCardifyStyles();

                Lampa.Storage.listener.follow('change', function (e) {
                        var visKeys = ['cardify_show_status', 'cardify_show_pg', 'cardify_show_rating', 'cardify_show_description'];
                        var styleKeys = ['cardify_logo_size', 'cardify_text_padding', 'cardify_title_size', 'cardify_desc_size'];
                        if (visKeys.indexOf(e.name) !== -1) updateCardifyVisibility();
                        if (styleKeys.indexOf(e.name) !== -1) updateCardifyStyles();
                });

                function video(data) {
                        var vids = data.videos || (data.movie && data.movie.videos) || (data.tv && data.tv.videos);
                        if (vids && vids.results && vids.results.length) {
                                var items = [];
                                vids.results.forEach(function (element) {
                                        items.push({
                                                title: Lampa.Utils.shortText(element.name, 50),
                                                id: element.key,
                                                code: element.iso_639_1,
                                                time: new Date(element.published_at).getTime(),
                                                url: "https://www.youtube.com/watch?v=" + element.key,
                                                img: "https://img.youtube.com/vi/" + element.key + "/default.jpg",
                                                name_orig: (element.name || "").toLowerCase()
                                        });
                                });
                                items.sort(function (a, b) {
                                        return a.time > b.time ? -1 : a.time < b.time ? 1 : 0;
                                });
                                var my_lang = items.filter(function (n) {
                                        return n.code == Lampa.Storage.field("tmdb_lang");
                                });
                                var en_lang = items.filter(function (n) {
                                        return n.code == "en" && my_lang.indexOf(n) == -1;
                                });
                                var al_lang = [];

                                if (my_lang.length) {
                                        al_lang = al_lang.concat(my_lang);
                                }

                                al_lang = al_lang.concat(en_lang);
                                if (al_lang.length) {
                                        var best = al_lang.find(function(n) {
                                                return n.name_orig.indexOf("official trailer") !== -1 ||
                                                           n.name_orig.indexOf("офіційний трейлер") !== -1 ||
                                                           n.name_orig.indexOf("официальный трейлер") !== -1;
                                        });
                                        
                                        if (!best) {
                                                best = al_lang.find(function(n) {
                                                        return n.name_orig.indexOf("trailer") !== -1 ||
                                                                   n.name_orig.indexOf("трейлер") !== -1;
                                                });
                                        }
                                        
                                        return best || al_lang[0];
                                }
                        }
                }

                Follow.get(Type.de([102, 117, 108, 108]), function (e) {
                        if (Type.co(e)) {
                                Follow.skodf(e);
                                var fixOpacity = function() {
                                        if (!e || !e.object || !e.object.activity || typeof e.object.activity.render !== 'function') return;
                                        
                                        var renderEl = e.object.activity.render();
                                        if (!renderEl) return;
                                        
                                        var $bg = renderEl.find(".full-start__background");
                                        if ($bg.length) {
                                                $bg.stop(true, true).css("opacity", "1");
                                        }
                                };
                                fixOpacity();
                                setTimeout(fixOpacity, 300);
                                setTimeout(fixOpacity, 1000); 

                                var isBgTrailers = Main.cases()[Main.stor()].field("cardify_trailers_bg");
                                var run_slideshow = Main.cases()[Main.stor()].field("cardify_run_slideshow");

                                if (isBgTrailers) {
                                        var tr = Follow.vjsk(video(e.data));
                                        if (tr && Main.cases().Manifest.app_digital >= 220) {
                                                if (Main.cases().Activity.active().activity === e.object.activity) {
                                                        new Trailer(e.object, tr, isBgTrailers);
                                                } else {
                                                        var follow = function follow(a) {
                                                                if (
                                                                        a.type == Type.de([115, 116, 97, 114, 116]) &&
                                                                        a.object.activity === e.object.activity &&
                                                                        !e.object.activity.trailer_ready
                                                                ) {
                                                                        Main.cases()[binaryLifting()].remove("activity", follow);
                                                                        new Trailer(e.object, tr, isBgTrailers);
                                                                }
                                                        };

                                                        Follow.get("activity", follow);
                                                }
                                        } else {
                                                isBgTrailers = false;
                                        }
                                }

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
                                                                                        var $currentBg = $render.find('.full-start__background').last();
                                                                                        if ($currentBg.length === 0) return;
                                                                                        
                                                                                        var img = new Image();
                                                                                        img.onload = function() {
                                                                                                if (!is_active || window.cardifyCurrentItemId !== item_id) return;
                                                                                                
                                                                                                var $newBg = $currentBg.clone();
                                                                                                $newBg.attr('src', backdrop_url);
                                                                                                $newBg.css({
                                                                                                        'opacity': '0',
                                                                                                        'transition': 'opacity 1.5s ease-in-out',
                                                                                                        'transform': 'translateZ(0)' // Апаратне прискорення для плавного слайдшоу
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
                                                                                                        $render.find('.full-start__background').not($newBg).remove();
                                                                                                }, 1550);
                                                                                        };
                                                                                        img.onerror = function() {}; // ДОДАНО: Захист від помилок у слайдшоу
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
                        }
                });
        }

        if (Follow.go) startPlugin();
        else {
                Follow.get(Type.de([97, 112, 112]), function (e) {
                        if (Type.re(e)) startPlugin();
                });
        }
})();
