(function () {
    'use strict';

    // Polyfills for TV Compatibility
    if (typeof AbortController === 'undefined') {
        window.AbortController = function () {
            this.signal = {
                aborted: false,
                addEventListener: function (event, callback) {
                    if (event === 'abort') this._onabort = callback;
                }
            };
            this.abort = function () {
                this.signal.aborted = true;
                if (typeof this.signal._onabort === 'function') this.signal._onabort();
            };
        };
    }

    if (!window.performance || !window.performance.now) {
        window.performance = { now: function () { return new Date().getTime(); } };
    }

    // --- CONFIGURATION ---
    var ENABLE_LOGGING = true;
    var JACRED_PROTOCOL = 'https://';
    var JACRED_URL = Lampa.Storage.get('jacred.xyz') || 'jacred.xyz';
    var PROXY_LIST = [
        'http://api.allorigins.win/raw?url=',
        'http://cors.bwa.workers.dev/'
    ];
    var PROXY_TIMEOUT = 10000;

    var SURS_QUALITY = {
        log: function (msg) {
            if (ENABLE_LOGGING) console.log("[SURS_UA_ULTRA] " + msg);
        }
    };

    // Іконки
    var UA_FLAG_EMOJI = '<span style="margin-right: 4px; font-size: 1.2em; vertical-align: middle;">🇺🇦</span>';
    var PROJECTOR_EMOJI = '<span style="margin: 0 4px; font-size: 1.1em; vertical-align: middle;">📽️</span>';

    // --- STYLES ---
    var style = document.createElement('style');
    style.textContent = [
        '.full-start__status.surs_quality {',
        '    padding: 0.1em 0.3em;',
        '    font-weight: bold;',
        '    margin-left: 0.8em;',
        '    display: inline-flex;',
        '    align-items: center;',
        '    background: transparent !important;',
        '    text-shadow: none !important;',
        '    color: inherit !important;',
        '}',
        '.surs_quality span { white-space: nowrap; color: inherit !important; }',
        '.surs_quality .seeds_info { margin-left: 3px; font-size: 0.8em; opacity: 0.8; font-weight: normal; color: inherit !important; }'
    ].join('\n');
    document.head.appendChild(style);

    // --- ANALYTICS LOGIC ---

    function parseQualityFromText(text) {
        if (!text) return 0;
        var t = text.toLowerCase();
        
        // 1. Екранки
        if (/\b(ts|tc|telesync|camrip|cam|hdtc|dvdscr)\b/i.test(t)) return -1;

        // 2. Висока якість
        if (/\b(2160p|4k|uhd|ultra hd)\b/i.test(t)) return 2160;
        if (/\b(1080p|fhd|full hd|1080i|bdremux|remux)\b/i.test(t)) return 1080;
        if (/\b(720p|hd|720i)\b/i.test(t)) return 720;
        
        // 3. Старі формати та SD
        if (/\b(bdrip|brrip|bluray|blu-ray)\b/i.test(t)) return 1079;
        if (/\b(dvdrip|dvd|dvdr|dvd9|dvd5)\b/i.test(t)) return 481;
        if (/\b(480p|360p|sd|hdtv|webrip|web-dl|rip|mkv|avi)\b/i.test(t)) return 480;
        
        return 0;
    }

    function getQualityStyle(qVal) {
        if (qVal === -1) return { text: 'CAM', css: 'q_cam_text' };
        if (qVal >= 2160) return { text: '4K', css: 'q_4k_text' };
        if (qVal >= 1080) return { text: '1080p', css: 'q_1080_text' };
        if (qVal === 1079) return { text: 'BD', css: 'q_1080_text' };
        if (qVal >= 720) return { text: '720p', css: 'q_720_text' };
        if (qVal === 481) return { text: 'DVD', css: 'q_sd_text' };
        if (qVal > 0) return { text: 'SD', css: 'q_sd_text' };
        return { text: '??', css: 'q_sd_text' };
    }

    function fetchWithProxy(url, callback) {
        var currentProxy = 0;
        var called = false;

        function tryNext() {
            if (currentProxy >= PROXY_LIST.length) {
                if (!called) { called = true; callback(new Error('Fail')); }
                return;
            }
            var pUrl = PROXY_LIST[currentProxy] + encodeURIComponent(url);
            var controller = new AbortController();
            var tid = setTimeout(function() { controller.abort(); }, PROXY_TIMEOUT);

            fetch(pUrl, { signal: controller.signal }).then(function(r) { return r.text(); }).then(function(d) {
                clearTimeout(tid);
                if (!called) { called = true; callback(null, d); }
            }).catch(function() {
                clearTimeout(tid);
                currentProxy++;
                tryNext();
            });
        }
        fetch(url).then(function(r) { return r.text(); }).then(function(d) {
            if (!called) { called = true; callback(null, d); }
        }).catch(function() { tryNext(); });
    }

    function searchUaDual(card, callback) {
        var year = (card.release_date || '').substring(0, 4);
        var title = card.original_title || card.title;
        if (!title || !year) return callback(null);

        var url = JACRED_PROTOCOL + JACRED_URL + '/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;

        fetchWithProxy(url, function(err, data) {
            if (err || !data) return callback(null);
            try {
                var json = JSON.parse(data);
                if (!Array.isArray(json)) return callback(null);

                var uaRegex = /(?:^|[\s\.\-\/\(\[])(ukr|ua|ukrainian|укр|україн|toloka|mazepa|hurtom|uafilm|бабай|гуртом)(?:$|[\s\.\-\/\)\]])/i;
                var uaList = [];

                json.forEach(function(item) {
                    var fullInfo = (item.title + " " + (item.details || "") + " " + (item.tracker || "")).toLowerCase();
                    if (uaRegex.test(fullInfo)) {
                        uaList.push({
                            val: parseQualityFromText(item.title),
                            seeds: parseInt(item.seeders || item.seeds || 0),
                            title: item.title
                        });
                    }
                });

                if (uaList.length > 0) {
                    var bestQual = uaList.slice().sort(function(a,b){ return b.val - a.val; })[0];
                    var mostPop = uaList.slice().sort(function(a,b){ return b.seeds - a.seeds; })[0];

                    callback({ best: bestQual, popular: mostPop, hasUa: true });
                } else {
                    callback({ hasUa: false });
                }
            } catch(e) { callback(null); }
        });
    }

    // --- UI ---

    function createHtml(item) {
        var meta = getQualityStyle(item.val);
        return '<span class="' + meta.css + '">' + meta.text + '</span>';
    }

    function injectUI(data, render) {
        if (!render) return;
        var rateLine = $('.full-start-new__rate-line', render);
        $('.surs_quality', render).remove();

        if (!data || !data.hasUa) {
            rateLine.append('<div class="full-start__status surs_quality" style="opacity: 0.6">UA 🚫</div>');
            return;
        }

        var container = $('<div class="full-start__status surs_quality"></div>');
        var html = UA_FLAG_EMOJI + createHtml(data.best);

        if (data.popular) {
            html += PROJECTOR_EMOJI;
            html += createHtml(data.popular);
            if (data.popular.seeds > 0) {
                html += '<span class="seeds_info">(' + data.popular.seeds + ')</span>';
            }
        }

        container.html(html);
        rateLine.append(container);
    }

    function startProcess(movie, render) {
        if (!movie || movie.number_of_seasons || movie.first_air_date) return;

        $('.surs_quality', render).remove();
        var ph = $('<div class="full-start__status surs_quality" style="opacity:0.5">...</div>');
        $('.full-start-new__rate-line', render).append(ph);

        searchUaDual(movie, function(result) {
            ph.remove();
            injectUI(result, render);
        });
    }

    function init() {
        if (window.sursQualityUA_Ultimate) return;
        window.sursQualityUA_Ultimate = true;

        SURS_QUALITY.log("Ultimate UA Quality (Projector & Emoji Edition) Loaded");

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                startProcess(e.data.movie, e.object.activity.render());
            }
        });
    }

    var waitLampa = setInterval(function() {
        if (typeof Lampa !== 'undefined' && Lampa.Listener) {
            clearInterval(waitLampa);
            init();
        }
    }, 500);

})();