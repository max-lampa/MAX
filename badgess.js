(function () {
    'use strict';

    var PLUGIN_ID      = 'StreamBadgesRU';
    var PLUGIN_VER     = '2.0.0';
    var BADGE_ATTR     = 'data-sbru';
    var PROCESS_DELAY  = 120;   // ms after mutation before scan
    var _scanTimer     = null;

    /* ─────────────────── CSS ─────────────────── */
    var CSS = [
        '.sbru-wrap{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;align-items:center;pointer-events:none}',
        '.sbru{display:inline-flex;align-items:center;padding:1px 7px;border-radius:4px;',
        'font-size:11px;font-weight:700;line-height:18px;white-space:nowrap;letter-spacing:.3px}',

        /* quality */
        '.sbru-4k{background:#0d5c2e;color:#7dffb3}',
        '.sbru-1080{background:#1e6b3a;color:#d4ffe4}',
        '.sbru-720{background:#1a4a1a;color:#a8ffa8}',
        '.sbru-sd{background:#2e2e2e;color:#aaa}',

        /* hdr/codec */
        '.sbru-dv{background:#4a2a0a;color:#ffcc66}',
        '.sbru-hdr10p{background:#5c3a1e;color:#ffd97d}',
        '.sbru-hdr{background:#4a2e0e;color:#ffc84a}',
        '.sbru-h265{background:#232350;color:#b0b0ff}',
        '.sbru-h264{background:#1c2a50;color:#99aaff}',
        '.sbru-av1{background:#1a4a3a;color:#8affdc}',
        '.sbru-atmos{background:#3a1254;color:#e0aaff}',

        /* source type */
        '.sbru-webdl{background:#0e2e4a;color:#7fcfff}',
        '.sbru-webrip{background:#0a2a44;color:#66b8ff}',
        '.sbru-blu{background:#0e164a;color:#99aaff}',
        '.sbru-hdrip{background:#220e4a;color:#cc99ff}',
        '.sbru-cam{background:#4a0e0e;color:#ff9999}',

        /* audio */
        '.sbru-dub{background:#0e3a0e;color:#88ff88}',
        '.sbru-sub{background:#3a2e0a;color:#ffd780}',
        '.sbru-orig{background:#2a2a2a;color:#c0c0c0}',
        '.sbru-multi{background:#0e2e1a;color:#66ffaa}',
        '.sbru-mono{background:#1e1e1e;color:#999}',

        /* status */
        '.sbru-risk{background:#4a0808;color:#ff8888}',
        '.sbru-noplay{background:#4a0838;color:#ffaadd}',
        '.sbru-vip{background:linear-gradient(135deg,#a07000,#e0a800);color:#fff}',
        '.sbru-cam-warn{background:#5a0a0a;color:#ffbbbb}',

        /* meta */
        '.sbru-rating{background:#2a2a0a;color:#ffe84a}',
        '.sbru-imdb{background:#1a1400;color:#f5c518}',
        '.sbru-kp{background:#1a0800;color:#ff6600}',
        '.sbru-seeds{background:#0a2a0a;color:#55ff55}',
        '.sbru-peers{background:#2a0a0a;color:#ff7070}',
        '.sbru-size{background:#0a1a2e;color:#7ab8ff}',
        '.sbru-source-name{background:#1a3060;color:#aaccff}',
        '.sbru-ep{background:#1e1e3a;color:#aaaaff}'
    ].join('');

    function injectCSS() {
        if (document.getElementById('sbru-css')) return;
        var s = document.createElement('style');
        s.id = 'sbru-css';
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    /* ─────────────────── Badge builder ─────────────────── */
    function b(cls, text) {
        return '<span class="sbru ' + cls + '">' + text + '</span>';
    }

    /* ─────────────────── Parsers ─────────────────── */
    function parseQuality(txt) {
        if (/\b(2160p|4k|uhd)\b/i.test(txt))  return b('sbru-4k', '4K · 2160p');
        if (/\b1080p\b/i.test(txt))            return b('sbru-1080', '1080p');
        if (/\b720p\b/i.test(txt))             return b('sbru-720', '720p');
        if (/\b480p\b/i.test(txt))             return b('sbru-sd', '480p');
        if (/\b360p\b/i.test(txt))             return b('sbru-sd', '360p');
        return '';
    }

    function parseHDR(txt) {
        var out = '';
        if (/dolby\s*vision|\bDV\b/i.test(txt))  out += b('sbru-dv', 'Dolby Vision');
        else if (/HDR10\+/i.test(txt))            out += b('sbru-hdr10p', 'HDR10+');
        else if (/HDR10\b/i.test(txt))            out += b('sbru-hdr', 'HDR10');
        else if (/\bHDR\b/i.test(txt))            out += b('sbru-hdr', 'HDR');
        if (/dolby\s*atmos|TrueHD\s*Atmos/i.test(txt)) out += b('sbru-atmos', 'Atmos');
        return out;
    }

    function parseCodec(txt) {
        if (/\bAV1\b/i.test(txt))              return b('sbru-av1', 'AV1');
        if (/H\.265|HEVC|x265/i.test(txt))     return b('sbru-h265', 'H.265');
        if (/H\.264|AVC|x264/i.test(txt))      return b('sbru-h264', 'H.264');
        return '';
    }

    function parseFileSource(txt) {
        if (/\bCAMRip|\bCAM\b|\bTS\b|\bTC\b|\bTeleSync|\bTeleCine/i.test(txt)) return b('sbru-cam', 'CAMRip');
        if (/WEB-?DL\b/i.test(txt))    return b('sbru-webdl', 'WEB-DL');
        if (/WEB-?Rip\b/i.test(txt))   return b('sbru-webrip', 'WEBRip');
        if (/BD-?Remux|BluRay|Blu-?Ray|BDRip/i.test(txt)) return b('sbru-blu', 'Blu-ray');
        if (/\bHDRip\b|\bHDTV\b/i.test(txt))  return b('sbru-hdrip', 'HDRip');
        if (/\bDVD/i.test(txt))        return b('sbru-hdrip', 'DVDRip');
        return '';
    }

    function parseAudio(txt) {
        var out = '';
        var lo = txt.toLowerCase();
        if (/дублир|дубляж|\bдуб\b|\bdub\b/i.test(lo))      out += b('sbru-dub', 'Дубляж');
        if (/субтитр|\bsub\b/i.test(lo))                     out += b('sbru-sub', 'Субтитры');
        if (/оригинал|\borig\b|\borginal\b/i.test(lo))       out += b('sbru-orig', 'Оригинал');
        if (/многоголос|multi-?audio/i.test(lo))             out += b('sbru-multi', 'Многоголос');
        if (/одноголос/i.test(lo))                           out += b('sbru-mono', 'Одноголос');
        return out;
    }

    function parseSize(txt) {
        var m = txt.match(/([\d.,]+)\s*(GB|MB|ГБ|МБ)\b/i);
        if (!m) return '';
        var unit = { gb:'ГБ', mb:'МБ', гб:'ГБ', мб:'МБ' }[m[2].toLowerCase()] || m[2];
        return b('sbru-size', m[1].replace(',', '.') + ' ' + unit);
    }

    function parseSeeds(val) {
        var n = parseInt(val, 10);
        if (isNaN(n) || n < 0) return { html: '', count: -1 };
        var html = b('sbru-seeds', '↑ ' + n);
        return { html: html, count: n };
    }

    function parsePeers(val) {
        var n = parseInt(val, 10);
        if (isNaN(n) || n < 0) return '';
        return b('sbru-peers', '↓ ' + n);
    }

    function parseRatingVal(val) {
        var n = parseFloat(val);
        if (isNaN(n) || n <= 0) return '';
        return b('sbru-rating', '★ ' + n.toFixed(1));
    }

    /* ─────────────────── Card-level rating (IMDB / KP) ─────────────────── */
    function getCardRatingBadges() {
        var out = '';
        try {
            var act = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
            var card = (act && act.card) ? act.card : null;
            if (!card) return '';

            // IMDB
            var imdb = card.vote_average || card.imdb || (card.rating && card.rating.imdb);
            if (imdb) {
                var iv = parseFloat(imdb);
                if (!isNaN(iv) && iv > 0) out += b('sbru-imdb', 'IMDb ' + iv.toFixed(1));
            }

            // Kinopoisk
            var kp = card.kp || (card.rating && card.rating.kp);
            if (kp) {
                var kv = parseFloat(kp);
                if (!isNaN(kv) && kv > 0) out += b('sbru-kp', 'КП ' + kv.toFixed(1));
            }
        } catch (e) {}
        return out;
    }

    /* ─────────────────── Core: extract + inject badges ─────────────────── */
    function buildBadgeHTML(text, extra) {
        extra = extra || {};
        var out = '';

        out += parseQuality(text);
        out += parseHDR(text);
        out += parseCodec(text);
        out += parseFileSource(text);
        out += parseAudio(text);

        // seeds / risk
        if (extra.seeds !== undefined && extra.seeds !== null && extra.seeds !== '') {
            var sd = parseSeeds(extra.seeds);
            if (sd.count === 0) out += b('sbru-noplay', 'Может не играть');
            else if (sd.count > 0 && sd.count < 5) out += b('sbru-risk', 'Риск');
            if (sd.html) out += sd.html;
        }

        if (extra.peers !== undefined && extra.peers !== null && extra.peers !== '') {
            out += parsePeers(extra.peers);
        }

        // per-item rating (e.g. from torrent data)
        if (extra.rating) out += parseRatingVal(extra.rating);

        out += parseSize(text);

        if (/\bvip\b/i.test(text) || extra.vip) out += b('sbru-vip', '★ VIP');

        // cam warning
        if (/\bCAMRip|\bCAM\b|\bTS\b/i.test(text)) out += b('sbru-cam-warn', 'Плохое качество');

        return out;
    }

    function injectBadges(el, html) {
        var old = el.querySelector('.sbru-wrap');
        if (old) old.remove();
        if (!html) return;
        var wrap = document.createElement('div');
        wrap.className = 'sbru-wrap';
        wrap.innerHTML = html;
        // Find a good injection point inside the item
        var target =
            el.querySelector('.online-prestige__info') ||
            el.querySelector('.online-torrent__info') ||
            el.querySelector('.online-item__info') ||
            el.querySelector('[class*="__info"]') ||
            el.querySelector('[class*="-info"]') ||
            el.querySelector('[class*="subtitle"]') ||
            el.querySelector('[class*="desc"]') ||
            el;
        target.appendChild(wrap);
    }

    /* ─────────────────── DOM scanner ─────────────────── */

    // Selectors for stream-list items across known Lampa online / torrent plugins
    var ITEM_SELECTORS = [
        // Online plugin (prestige layout)
        '.online-prestige__item',
        // Generic online items
        '.online-item',
        '.online__item',
        // Season / serial list rows
        '.season__episodes .episode',
        '.episodes__item',
        // Torrent plugin items
        '.torrent-item',
        '.torrent__item',
        // Source list items (collaps, rezka, etc.)
        '.online-source__item',
        '.source-item',
        // Catch-all: list items inside any .online-* container
        '.online-prestige .online-prestige__item',
        // Stream quality rows inside player overlay
        '.player-panel .stream-item',
        '.stream-item',
        '.stream__item',
        // Lampa v2 selectors
        '[data-source] .item',
        '.scroll__area .item',
    ];

    function scanAll() {
        var ratingBadges = getCardRatingBadges();

        ITEM_SELECTORS.forEach(function (sel) {
            document.querySelectorAll(sel).forEach(function (el) {
                processEl(el, ratingBadges);
            });
        });

        // Also try any element with typical torrent/stream class patterns
        document.querySelectorAll('[class]').forEach(function (el) {
            var cls = el.className || '';
            if (
                /prestige__item|torrent.?item|stream.?item|online.?item|source.?item/i.test(cls) &&
                !el.querySelector('.sbru-wrap')
            ) {
                processEl(el, ratingBadges);
            }
        });
    }

    function processEl(el, ratingBadges) {
        if (el.getAttribute(BADGE_ATTR) === '1') return;

        // Collect all text inside the item (but not nested .sbru-wrap)
        var text = getCleanText(el);
        if (!text || text.length < 4) return;

        // Pull extra data attributes that some plugins set
        var extra = {
            seeds:  el.dataset.seeds  || el.dataset.seed  || '',
            peers:  el.dataset.peers  || el.dataset.peer  || el.dataset.leech || '',
            rating: el.dataset.rating || el.dataset.imdb  || el.dataset.vote  || '',
            vip:    el.dataset.vip    || (/\bvip\b/i.test(el.className) ? '1' : '')
        };

        // Some plugins put seeds in a child span
        var seedEl = el.querySelector('[class*="seed"],[data-seeds],[data-seed]');
        if (seedEl && !extra.seeds) extra.seeds = seedEl.textContent.replace(/\D/g, '');

        var peerEl = el.querySelector('[class*="peer"],[class*="leech"],[data-peers],[data-peer]');
        if (peerEl && !extra.peers) extra.peers = peerEl.textContent.replace(/\D/g, '');

        var ratingEl = el.querySelector('[class*="rating"],[class*="vote"],[data-rating],[data-vote]');
        if (ratingEl && !extra.rating) extra.rating = ratingEl.textContent.replace(/[^\d.]/g, '');

        var html = buildBadgeHTML(text, extra);

        // Append global card rating (IMDb / KP) only once per scan round
        if (ratingBadges) html += ratingBadges;

        if (!html) {
            el.setAttribute(BADGE_ATTR, '1');
            return;
        }

        el.setAttribute(BADGE_ATTR, '1');
        injectBadges(el, html);
    }

    function getCleanText(el) {
        var clone = el.cloneNode(true);
        // Remove injected badges to avoid re-reading our own text
        var old = clone.querySelector('.sbru-wrap');
        if (old) old.remove();
        return (clone.textContent || '').replace(/\s+/g, ' ').trim();
    }

    /* ─────────────────── MutationObserver ─────────────────── */
    function scheduleScan() {
        clearTimeout(_scanTimer);
        _scanTimer = setTimeout(scanAll, PROCESS_DELAY);
    }

    function startObserver() {
        var observer = new MutationObserver(function (mutations) {
            var relevant = mutations.some(function (m) {
                return Array.from(m.addedNodes).some(function (n) {
                    return n.nodeType === 1;
                });
            });
            if (relevant) scheduleScan();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /* ─────────────────── Lampa event hooks ─────────────────── */
    function hookLampaEvents() {
        if (!window.Lampa || !Lampa.Listener) return;

        // Online plugin events
        var onlineEvents = ['online', 'online_videos', 'online_links', 'player_links'];
        onlineEvents.forEach(function (ev) {
            Lampa.Listener.follow(ev, function (e) {
                if (e.type === 'complite' || e.type === 'ready' || e.type === 'list' || e.type === 'result') {
                    scheduleScan();
                }
            });
        });

        // Torrent plugin events
        var torrentEvents = ['torrent', 'torrent_parser', 'torrent_list'];
        torrentEvents.forEach(function (ev) {
            Lampa.Listener.follow(ev, function (e) {
                if (e.type === 'complite' || e.type === 'ready' || e.type === 'list') {
                    // Reset badges so they get re-rendered with fresh seed data
                    document.querySelectorAll('[' + BADGE_ATTR + '="1"]').forEach(function (el) {
                        el.removeAttribute(BADGE_ATTR);
                        var wrap = el.querySelector('.sbru-wrap');
                        if (wrap) wrap.remove();
                    });
                    scheduleScan();
                }
            });
        });

        // Activity / full-card open — reset everything for new content
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                document.querySelectorAll('[' + BADGE_ATTR + ']').forEach(function (el) {
                    el.removeAttribute(BADGE_ATTR);
                    var wrap = el.querySelector('.sbru-wrap');
                    if (wrap) wrap.remove();
                });
                scheduleScan();
            }
        });

        // Player stream/quality selection list
        Lampa.Listener.follow('player', function (e) {
            if (e.type === 'links' || e.type === 'qualities') scheduleScan();
        });
    }

    /* ─────────────────── Patch Lampa.Online render (if available) ─────────────────── */
    function patchLampaOnline() {
        if (!window.Lampa) return;

        // Some Lampa builds expose Lampa.Online
        var onlineModule = Lampa.Online || (Lampa.Component && Lampa.Component.get && Lampa.Component.get('online'));
        if (!onlineModule) return;

        var proto = onlineModule.prototype || onlineModule;
        if (!proto || proto._sbru_patched) return;
        proto._sbru_patched = true;

        // Wrap renderItem / buildItem / renderStream if they exist
        ['renderItem', 'buildItem', 'renderStream', 'buildStream', 'renderLink'].forEach(function (method) {
            if (typeof proto[method] === 'function') {
                var orig = proto[method];
                proto[method] = function () {
                    var result = orig.apply(this, arguments);
                    scheduleScan();
                    return result;
                };
            }
        });
    }

    /* ─────────────────── Retry until Lampa is ready ─────────────────── */
    function tryPatch() {
        patchLampaOnline();
    }

    /* ─────────────────── Init ─────────────────── */
    function init() {
        injectCSS();
        hookLampaEvents();
        startObserver();
        scanAll();

        setTimeout(tryPatch, 800);
        setTimeout(tryPatch, 2500);
        setTimeout(tryPatch, 5000);

        if (window.Lampa && Lampa.Storage) {
            Lampa.Storage.set(PLUGIN_ID + '_version', PLUGIN_VER);
        }

        console.log('[' + PLUGIN_ID + '] v' + PLUGIN_VER + ' — бейджи для всех источников загружены');
    }

    if (window.appready) {
        init();
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    } else {
        var _boot = setInterval(function () {
            if (window.Lampa && Lampa.Listener) {
                clearInterval(_boot);
                Lampa.Listener.follow('app', function (e) {
                    if (e.type === 'ready') init();
                });
                if (window.appready) init();
            }
        }, 300);
    }

})();
