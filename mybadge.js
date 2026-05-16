(function () {
    'use strict';

    /* ══════════════════════════════════════════════
       StreamBadges RU  —  v4.0
       Бейджи на всех источниках Lampa:
       онлайн (prestige/list/scroll) + торренты
    ══════════════════════════════════════════════ */

    var ATTR    = 'data-sbru';
    var _timer  = null;
    var _itvl   = null;   // периодический сканер пока открыт онлайн-список

    /* ═══════════ CSS ═══════════ */
    var CSS = [
        '.sbru-row{display:flex;flex-wrap:wrap;gap:3px 5px;margin-top:6px;align-items:center}',
        '.sbru-b{display:inline-block;padding:1px 7px;border-radius:4px;',
        'font-size:11px;font-weight:700;line-height:18px;white-space:nowrap;vertical-align:middle}',
        /* source */
        '.sbru-src{background:rgba(255,255,255,.13);color:#ddeeff}',
        /* quality */
        '.sbru-q{background:rgba(255,255,255,.13);color:#d0e8ff}',
        /* HDR/codec/release */
        '.sbru-tech{background:rgba(140,120,255,.20);color:#c8bcff}',
        /* audio type */
        '.sbru-aud{background:rgba(255,255,255,.10);color:#c8c8c8}',
        /* "Язык группы" — розово-красный */
        '.sbru-lang{background:#6e1535;color:#ffb0c8;border:1px solid #a03060}',
        /* warning: может не играть */
        '.sbru-nop{background:#6e0f28;color:#ffa0b0;border:1px solid #aa2050}',
        /* риск */
        '.sbru-risk{background:#6e2500;color:#ffb070;border:1px solid #aa4000}',
        /* VIP */
        '.sbru-vip{background:#604000;color:#ffd050;border:1px solid #9a6800}',
        /* рейтинг */
        '.sbru-rat{background:rgba(210,155,0,.22);color:#f0c030;border:1px solid rgba(210,155,0,.38)}',
        /* сиды */
        '.sbru-sd{background:rgba(0,170,55,.17);color:#55e085;border:1px solid rgba(0,170,55,.32)}',
        /* пиры */
        '.sbru-pr{background:rgba(70,130,240,.14);color:#88b4ff;border:1px solid rgba(70,130,240,.28)}',
        /* размер */
        '.sbru-sz{background:rgba(0,155,55,.24);color:#80ffaa;border:1px solid rgba(0,155,55,.40)}',
        /* camrip */
        '.sbru-cam{background:#500000;color:#ff8888;border:1px solid #800000}'
    ].join('');

    function injectCSS() {
        if (document.getElementById('sbru-css')) return;
        var s = document.createElement('style');
        s.id = 'sbru-css';
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    /* ═══════════ Badge helpers ═══════════ */
    function b(cls, txt) {
        return '<span class="sbru-b ' + cls + '">' + txt + '</span>';
    }

    /* ═══════════ Parsers ═══════════ */
    function pSrc(info) {
        // "дата • source / quality / ..." — берём слово после •
        var m = info.match(/[•·]\s*([^/\n\r•·,]+)/);
        if (m) {
            var s = m[1].trim().split(/\s+/)[0].replace(/[^\w\d\-_.]/g, '');
            if (s.length > 1 && s.length < 24) return s;
        }
        return '';
    }

    function pQ(t) {
        if (/\b(2160p|4k|UHD)\b/i.test(t)) return '2160p';
        if (/\b1080p\b/i.test(t))           return '1080p';
        if (/\b720p\b/i.test(t))            return '720p';
        if (/\b480p\b/i.test(t))            return '480p';
        if (/\b360p\b/i.test(t))            return '360p';
        return '';
    }

    function pHDR(t) {
        if (/dolby\s*vision|\bDV\b/i.test(t)) return 'Dolby Vision';
        if (/HDR10\+/i.test(t))               return 'HDR10+';
        if (/\bHDR10\b/i.test(t))             return 'HDR10';
        if (/\bHDR\b/i.test(t))               return 'HDR';
        return '';
    }

    function pCodec(t) {
        if (/\bAV1\b/i.test(t))           return 'AV1';
        if (/H\.265|HEVC|\bx265\b/i.test(t)) return 'H.265';
        if (/H\.264|AVC|\bx264\b/i.test(t))  return 'H.264';
        return '';
    }

    function pRelease(t) {
        if (/\bCAM(Rip)?\b|\bTS\b|\bTC\b|\bTeleSync\b|\bTeleCine\b/i.test(t)) return 'CAM';
        if (/WEB-?DL\b/i.test(t))      return 'WEB-DL';
        if (/WEB-?Rip\b/i.test(t))     return 'WEBRip';
        if (/Blu-?[Rr]ay|BDRip|BD-?Remux/i.test(t)) return 'Blu-ray';
        if (/\bHDRip\b|\bHDTV\b/i.test(t)) return 'HDRip';
        if (/\bDVD/i.test(t))           return 'DVDRip';
        return '';
    }

    function pAtmos(t) { return /dolby\s*atmos|TrueHD\s*Atmos/i.test(t) ? 'Atmos' : ''; }

    function pAudio(title) {
        var out = [];
        if (/дубл/i.test(title))                out.push('Дубляж');
        if (/субтитр/i.test(title))             out.push('Субтитры');
        if (/оригинал|original/i.test(title))   out.push('Оригинал');
        if (/многоголос/i.test(title))          out.push('Многоголос');
        if (/одноголос/i.test(title))           out.push('Одноголос');
        return out;
    }

    function pSize(t) {
        var m = t.match(/([\d]+[.,][\d]+|\d{2,})\s*(GB|MB|ГБ|МБ)\b/i);
        if (!m) return '';
        var n = m[1].replace(',', '.');
        var u = { gb:'ГБ', mb:'МБ', гб:'ГБ', мб:'МБ' }[m[2].toLowerCase()] || m[2];
        return n + ' ' + u;
    }

    /* ═══════════ Card rating ═══════════ */
    function cardRating() {
        try {
            var act = Lampa.Activity.active();
            if (!act) return '';
            var c = act.card || act.movie || act.item || act.data || {};
            var v = c.vote_average || c.imdb ||
                    (c.rating && (c.rating.imdb || c.rating.vote_average)) || 0;
            v = parseFloat(v);
            return (!isNaN(v) && v > 0) ? v.toFixed(1) : '';
        } catch (e) { return ''; }
    }

    /* ═══════════ Build badge HTML from text + extra data ═══════════ */
    function buildHTML(title, info, extra) {
        extra = extra || {};
        var full = (title + ' ' + info).replace(/\s+/g, ' ');
        var out  = '';

        // 1. источник
        var src = pSrc(info) || extra.sourceName || '';
        if (src) out += b('sbru-src', src);

        // 2. качество
        var q = pQ(full) || extra.quality || '';
        if (q) out += b('sbru-q', q);

        // 3. HDR
        var hdr = pHDR(full);
        if (hdr) out += b('sbru-tech', hdr);

        // 4. кодек
        var codec = pCodec(full);
        if (codec) out += b('sbru-tech', codec);

        // 5. Atmos
        var atmos = pAtmos(full);
        if (atmos) out += b('sbru-tech', atmos);

        // 6. тип релиза
        var rel = pRelease(full);
        if (rel === 'CAM') {
            out += b('sbru-cam', 'CAMRip');
            out += b('sbru-nop', 'Может не играть');
        } else if (rel) {
            out += b('sbru-tech', rel);
        }

        // 7. аудио
        pAudio(title).forEach(function (a) { out += b('sbru-aud', a); });

        // 8. "Язык группы" (аналог "Мова на групі")
        if (/русск/i.test(title + info)) out += b('sbru-lang', 'Язык группы');

        // 9. VIP
        if (extra.vip || /\bvip\b/i.test(full)) out += b('sbru-vip', 'VIP');

        // 10. риск / не играет (торренты)
        var seedN = parseInt(extra.seeds, 10);
        if (!isNaN(seedN)) {
            if (seedN === 0)       out += b('sbru-nop',  'Может не играть');
            else if (seedN < 5)    out += b('sbru-risk', 'Риск');
        }

        // 11. рейтинг
        var rat = extra.rating || cardRating();
        if (rat) {
            var rv = parseFloat(rat);
            if (!isNaN(rv) && rv > 0) out += b('sbru-rat', '★ ' + rv.toFixed(1));
        }

        // 12. сиды / пиры
        if (!isNaN(seedN) && seedN >= 0) out += b('sbru-sd', '↑ ' + seedN);
        var peerN = parseInt(extra.peers, 10);
        if (!isNaN(peerN) && peerN >= 0) out += b('sbru-pr', '↓ ' + peerN);

        // 13. размер
        var sz = pSize(full) || extra.size || '';
        if (sz) out += b('sbru-sz', sz);

        return out;
    }

    /* ═══════════ Inject row into DOM element ═══════════ */
    function injectRow(el, html, infoEl, titleEl) {
        var old = el.querySelector('.sbru-row');
        if (old) old.remove();

        var row = document.createElement('div');
        row.className = 'sbru-row';
        row.innerHTML = html;

        var anchor = infoEl || titleEl;
        if (anchor && anchor.parentNode) {
            // insert right after the anchor inside same parent
            var parent = anchor.parentNode;
            var next   = anchor.nextSibling;
            while (next && next.classList && next.classList.contains('sbru-row')) {
                next = next.nextSibling;
            }
            if (next) parent.insertBefore(row, next);
            else      parent.appendChild(row);
        } else {
            el.appendChild(row);
        }
    }

    /* ═══════════ Process single DOM element ═══════════ */
    function processEl(el) {
        if (el.getAttribute(ATTR)) return;

        // --- find title / info child elements ---
        var titleEl = el.querySelector(
            '.online-prestige__title,.online-item__title,.torrent-item__title,' +
            '[class*="__title"],[class*="-title"],[class*="__name"],[class*="-name"]'
        );
        var infoEl = el.querySelector(
            '.online-prestige__info,.online-item__info,.torrent-item__info,' +
            '[class*="__info"],[class*="-info"],[class*="__sub"],[class*="-sub"],' +
            '[class*="__meta"],[class*="-meta"],[class*="__desc"],[class*="-desc"]'
        );

        // Collect clean text (exclude already-injected badge rows)
        var clone = el.cloneNode(true);
        clone.querySelectorAll('.sbru-row').forEach(function(r){ r.remove(); });
        var rawText = (clone.textContent || '').replace(/\s+/g,' ').trim();

        // Must have at least some recognisable stream data
        var looksLikeStream = (
            /\b(2160p|1080p|720p|480p|360p|4k|UHD)\b/i.test(rawText) ||
            /([\d]+[.,][\d]+|\d{2,})\s*(GB|MB|ГБ|МБ)\b/i.test(rawText) ||
            /\b(HDR|WEB-DL|WEBRip|Blu-ray|CAMRip)\b/i.test(rawText) ||
            /дубл|субтитр|оригинал/i.test(rawText)
        );
        if (!looksLikeStream) { el.setAttribute(ATTR, 'skip'); return; }

        var title = titleEl ? titleEl.textContent.trim() : rawText.slice(0, 100);
        var info  = infoEl  ? infoEl.textContent.trim()  : rawText;

        // extra numeric data
        var extra = {
            seeds:  el.dataset.seeds || el.dataset.seed  || '',
            peers:  el.dataset.peers || el.dataset.peer  || el.dataset.leech || '',
            rating: el.dataset.rating|| el.dataset.imdb  || el.dataset.vote  || '',
            vip:    el.dataset.vip   || ''
        };
        if (!extra.seeds) {
            var se = el.querySelector('[class*="seed"],[data-seed],[data-seeds]');
            if (se) extra.seeds = se.textContent.replace(/\D/g,'');
        }
        if (!extra.peers) {
            var pe = el.querySelector('[class*="peer"],[class*="leech"],[data-peer]');
            if (pe) extra.peers = pe.textContent.replace(/\D/g,'');
        }
        if (!extra.rating) {
            var re = el.querySelector('[class*="vote"],[class*="rating"],[data-vote],[data-rating]');
            if (re) extra.rating = re.textContent.replace(/[^\d.]/g,'');
        }

        var html = buildHTML(title, info, extra);
        if (!html) { el.setAttribute(ATTR, 'skip'); return; }

        el.setAttribute(ATTR, '1');
        injectRow(el, html, infoEl, titleEl);
    }

    /* ═══════════ DOM scanner ═══════════ */

    // Explicit class-based selectors (torrents + known online layouts)
    var CLASS_SEL = [
        '.online-prestige__item',
        '.online-item',
        '.online__item',
        '.torrent-item',
        '.torrent__item',
        '.stream-item',
        '.stream__item',
        '.source-item',
        '.online-source__item',
        '.episodes__item',
        '[class*="prestige__item"]',
        '[class*="torrent__item"]',
        '[class*="online__item"]',
        '[class*="stream__item"]',
        '[class*="scroll__item"]'
    ].join(',');

    // Content-based fallback: any div/li that looks like a stream item
    function scanByContent(root) {
        root = root || document;
        var candidates = root.querySelectorAll('div,li');
        candidates.forEach(function (el) {
            // skip already done, badges, or elements with too many children
            if (el.getAttribute(ATTR))                          return;
            if (el.classList.contains('sbru-row'))              return;
            if (el.classList.contains('sbru-b'))                return;
            if (el.children.length > 15)                        return;

            var txt = (el.textContent || '');
            if (txt.length < 5 || txt.length > 600)             return;

            var hasQ    = /\b(2160p|1080p|720p|480p|360p)\b/i.test(txt);
            var hasSz   = /([\d]+[.,][\d]+|\d{2,})\s*(GB|MB|ГБ|МБ)\b/i.test(txt);
            var hasDub  = /дубл|субтитр|оригинал/i.test(txt);
            var hasMark = /\b(HDR|WEB-DL|WEBRip|Blu-ray|CAMRip|H\.265|H\.264)\b/i.test(txt);

            if (!hasQ && !hasSz && !hasDub && !hasMark)         return;

            // avoid scanning a parent that contains child items already processed
            if (el.querySelector('[' + ATTR + '="1"]'))         return;

            processEl(el);
        });
    }

    function scanAll() {
        // 1) Class-based
        try {
            document.querySelectorAll(CLASS_SEL).forEach(processEl);
        } catch(e) {}

        // 2) Content-based fallback for online sources
        scanByContent();
    }

    function scheduleScan(delay) {
        clearTimeout(_timer);
        _timer = setTimeout(scanAll, delay || 120);
    }

    /* ═══════════ Periodic scanner (while online panel open) ═══════════ */
    function startInterval() {
        stopInterval();
        var tick = 0;
        _itvl = setInterval(function () {
            tick++;
            scanAll();
            if (tick > 30) stopInterval(); // stop after ~30s
        }, 600);
    }
    function stopInterval() {
        if (_itvl) { clearInterval(_itvl); _itvl = null; }
    }

    /* ═══════════ Patch Lampa.Template.get ═══════════ */
    function patchTemplate() {
        if (!window.Lampa || !Lampa.Template || Lampa.Template._sbru) return;
        Lampa.Template._sbru = true;

        var _orig = Lampa.Template.get.bind(Lampa.Template);
        Lampa.Template.get = function (name, data) {
            var result = _orig(name, data);
            // Trigger a scan shortly after any online/prestige/torrent template render
            if (/online|prestige|torrent|stream|source/i.test(name)) {
                scheduleScan(80);
            }
            return result;
        };
    }

    /* ═══════════ Patch Lampa.Reguest / Lampa.Parse ═══════════ */
    function patchPlugins() {
        // Some online source plugins store themselves in window
        var keys = Object.keys(window);
        keys.forEach(function (k) {
            try {
                var obj = window[k];
                if (!obj || typeof obj !== 'object' || obj._sbru) return;
                var proto = obj.prototype || obj;
                if (!proto) return;
                ['render','build','display','show','append','add']
                    .forEach(function (m) {
                        if (typeof proto[m] !== 'function') return;
                        var orig = proto[m];
                        proto[m] = function () {
                            var r = orig.apply(this, arguments);
                            scheduleScan(150);
                            return r;
                        };
                    });
                obj._sbru = true;
            } catch (e) {}
        });
    }

    /* ═══════════ MutationObserver ═══════════ */
    function startObserver() {
        var obs = new MutationObserver(function (muts) {
            var added = false;
            for (var i = 0; i < muts.length; i++) {
                if (muts[i].addedNodes.length) { added = true; break; }
            }
            if (added) scheduleScan(120);
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    /* ═══════════ Lampa event hooks ═══════════ */
    function hookEvents() {
        if (!window.Lampa || !Lampa.Listener) return;

        var ONLINE_EVS  = ['online','online_videos','online_links','online_serial',
                           'player_links','kinoplay','rezka','collaps'];
        var TORR_EVS    = ['torrent','torrent_parser','torrent_list','torrent_serial'];

        var triggerTypes = {
            complite:1, ready:1, list:1, result:1,
            render:1, update:1, append:1, build:1, show:1
        };

        function onStreamEvent(e) {
            if (triggerTypes[e.type]) {
                scheduleScan(100);
                startInterval();
            }
        }

        ONLINE_EVS.concat(TORR_EVS).forEach(function (ev) {
            Lampa.Listener.follow(ev, onStreamEvent);
        });

        // Activity open → reset + rescan
        ['full','activity','card'].forEach(function (ev) {
            Lampa.Listener.follow(ev, function (e) {
                if (e.type === 'complite' || e.type === 'open' || e.type === 'start') {
                    document.querySelectorAll('[' + ATTR + ']').forEach(function (el) {
                        el.removeAttribute(ATTR);
                        var r = el.querySelector('.sbru-row');
                        if (r) r.remove();
                    });
                    scheduleScan(300);
                    startInterval();
                }
                if (e.type === 'destroy' || e.type === 'close') stopInterval();
            });
        });

        Lampa.Listener.follow('player', function (e) {
            if (e.type === 'qualities' || e.type === 'links') scheduleScan(100);
        });
    }

    /* ═══════════ Init ═══════════ */
    function init() {
        injectCSS();
        hookEvents();
        patchTemplate();
        startObserver();
        scanAll();
        startInterval();

        // Delayed patch attempts
        [500, 1500, 3500].forEach(function (d) {
            setTimeout(patchTemplate, d);
        });

        console.log('[StreamBadgesRU] v4.0 ready');
    }

    /* ═══════════ Entry point ═══════════ */
    if (window.appready) {
        init();
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    } else {
        var _p = setInterval(function () {
            if (window.Lampa && Lampa.Listener) {
                clearInterval(_p);
                Lampa.Listener.follow('app', function (e) {
                    if (e.type === 'ready') init();
                });
                if (window.appready) init();
            }
        }, 200);
    }

})();
