(function () {
    'use strict';

    var PLUGIN_NAME = 'StreamBadgesRU';
    var PLUGIN_VERSION = '1.0.0';

    var CSS_STYLES = `
        .stream-badges-ru {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 5px;
            align-items: center;
        }
        .stream-badge {
            display: inline-flex;
            align-items: center;
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            line-height: 18px;
            white-space: nowrap;
            letter-spacing: 0.3px;
        }
        .badge-source {
            background: #2a7bbf;
            color: #fff;
        }
        .badge-quality {
            background: #1e6b3a;
            color: #fff;
        }
        .badge-quality-4k {
            background: #0d5c2e;
            color: #7dffb3;
        }
        .badge-hdr {
            background: #5c3a1e;
            color: #ffd97d;
        }
        .badge-codec {
            background: #3a3a5c;
            color: #c8c8ff;
        }
        .badge-audio-dub {
            background: #2a5c2a;
            color: #afffaf;
        }
        .badge-audio-sub {
            background: #5c4a1e;
            color: #ffe5a0;
        }
        .badge-audio-orig {
            background: #3a3a3a;
            color: #d0d0d0;
        }
        .badge-vip {
            background: linear-gradient(135deg, #b8860b, #daa520);
            color: #fff;
        }
        .badge-risk {
            background: #8b1a1a;
            color: #ffaaaa;
        }
        .badge-noplay {
            background: #8b1a6b;
            color: #ffaaee;
        }
        .badge-compatible {
            background: #1a4a8b;
            color: #aaccff;
        }
        .badge-rating {
            background: #3a3a1e;
            color: #ffe566;
        }
        .badge-seeds {
            background: #1a3a1a;
            color: #66ff99;
        }
        .badge-peers {
            background: #3a1a1a;
            color: #ff9999;
        }
        .badge-size {
            background: #1e3a5c;
            color: #7fc8ff;
        }
        .badge-camrip {
            background: #5c1e1e;
            color: #ffaaaa;
        }
        .badge-webdl {
            background: #1e3a5c;
            color: #aaddff;
        }
        .badge-bluray {
            background: #1c2a5c;
            color: #99aaff;
        }
        .badge-hdrip {
            background: #2a1e5c;
            color: #ccaaff;
        }
        .badge-av1 {
            background: #1e5c4a;
            color: #aaffee;
        }
        .badge-dolby {
            background: #3a1e5c;
            color: #ddaaff;
        }
        .badge-atmos {
            background: #4a1e5c;
            color: #ffaaee;
        }
    `;

    function injectStyles() {
        if (document.getElementById('stream-badges-ru-style')) return;
        var style = document.createElement('style');
        style.id = 'stream-badges-ru-style';
        style.textContent = CSS_STYLES;
        document.head.appendChild(style);
    }

    function badge(cls, text) {
        return '<span class="stream-badge ' + cls + '">' + text + '</span>';
    }

    function parseQuality(str) {
        if (!str) return '';
        var badges = '';
        if (/2160p|4K|UHD/i.test(str)) badges += badge('badge-quality badge-quality-4k', '4K · 2160p');
        else if (/1080p/i.test(str)) badges += badge('badge-quality', '1080p');
        else if (/720p/i.test(str)) badges += badge('badge-quality', '720p');
        else if (/480p/i.test(str)) badges += badge('badge-quality', '480p');
        else if (/360p/i.test(str)) badges += badge('badge-quality', '360p');
        return badges;
    }

    function parseHDR(str) {
        if (!str) return '';
        var badges = '';
        if (/Dolby Vision|DV/i.test(str)) badges += badge('badge-dolby', 'Dolby Vision');
        else if (/HDR10\+/i.test(str)) badges += badge('badge-hdr', 'HDR10+');
        else if (/HDR10/i.test(str)) badges += badge('badge-hdr', 'HDR10');
        else if (/HDR/i.test(str)) badges += badge('badge-hdr', 'HDR');
        if (/Dolby Atmos|TrueHD Atmos/i.test(str)) badges += badge('badge-atmos', 'Atmos');
        return badges;
    }

    function parseCodec(str) {
        if (!str) return '';
        var badges = '';
        if (/AV1/i.test(str)) badges += badge('badge-av1', 'AV1');
        else if (/H\.265|HEVC|x265/i.test(str)) badges += badge('badge-codec', 'H.265');
        else if (/H\.264|AVC|x264/i.test(str)) badges += badge('badge-codec', 'H.264');
        return badges;
    }

    function parseAudio(str) {
        if (!str) return '';
        var badges = '';
        var lower = str.toLowerCase();
        if (/дублир|дубляж|дублиров|дубл\b|dub\b/i.test(lower)) badges += badge('badge-audio-dub', 'Дубляж');
        if (/субтитр|субт\b|sub\b/i.test(lower)) badges += badge('badge-audio-sub', 'Субтитры');
        if (/оригинал|original|orig\b/i.test(lower)) badges += badge('badge-audio-orig', 'Оригинал');
        if (/многоголос|многог\b|multi/i.test(lower)) badges += badge('badge-audio-dub', 'Многоголос');
        if (/одноголос/i.test(lower)) badges += badge('badge-audio-orig', 'Одноголос');
        return badges;
    }

    function parseSource(str) {
        if (!str) return '';
        var lower = str.toLowerCase();
        if (/camrip|cam\b|ts\b|tc\b|telecine|telesync/i.test(lower)) {
            return badge('badge-camrip', 'CAMRip');
        }
        if (/web-dl|webdl/i.test(lower)) return badge('badge-webdl', 'WEB-DL');
        if (/webrip|web-rip/i.test(lower)) return badge('badge-webdl', 'WEBRip');
        if (/blu-ray|bluray|bdrip|bdremux/i.test(lower)) return badge('badge-bluray', 'Blu-ray');
        if (/hdrip|hdtv/i.test(lower)) return badge('badge-hdrip', 'HDRip');
        if (/dvdrip|dvd/i.test(lower)) return badge('badge-hdrip', 'DVDRip');
        return '';
    }

    function parseSize(str) {
        if (!str) return '';
        var m = str.match(/([\d.,]+)\s*(GB|MB|ГБ|МБ)/i);
        if (m) {
            var unit = m[2].toUpperCase();
            if (unit === 'ГБ') unit = 'ГБ';
            else if (unit === 'МБ') unit = 'МБ';
            else if (unit === 'GB') unit = 'ГБ';
            else if (unit === 'MB') unit = 'МБ';
            return badge('badge-size', m[1] + ' ' + unit);
        }
        return '';
    }

    function parseRating(val) {
        if (!val || val === '0' || val === 0) return '';
        var num = parseFloat(val);
        if (isNaN(num) || num <= 0) return '';
        return badge('badge-rating', '★ ' + num.toFixed(1));
    }

    function parseSeeds(seeds) {
        if (seeds === undefined || seeds === null || seeds === '') return '';
        var n = parseInt(seeds);
        if (isNaN(n) || n < 0) return '';
        return badge('badge-seeds', '↑ ' + n);
    }

    function parsePeers(peers) {
        if (peers === undefined || peers === null || peers === '') return '';
        var n = parseInt(peers);
        if (isNaN(n) || n < 0) return '';
        return badge('badge-peers', '↓ ' + n);
    }

    function riskBadge(seeds) {
        var n = parseInt(seeds);
        if (!isNaN(n) && n < 5) return badge('badge-risk', 'Риск');
        return '';
    }

    function canPlayBadge(item) {
        if (item.quality && (item.quality.toLowerCase().includes('cam') || item.quality.toLowerCase().includes('ts'))) {
            return badge('badge-noplay', 'Может не играть');
        }
        return '';
    }

    function buildBadges(item) {
        var str = [item.title || '', item.quality || '', item.info || '', item.name || ''].join(' ');
        var result = '';

        result += parseQuality(str);
        result += parseHDR(str);
        result += parseCodec(str);
        result += parseSource(str);
        result += parseAudio(str);

        if (item.seeds !== undefined) {
            var seedCount = parseInt(item.seeds);
            if (!isNaN(seedCount) && seedCount < 5 && seedCount >= 0) {
                result += badge('badge-risk', 'Риск');
            }
        }

        result += parseRating(item.rating || item.imdb || item.vote || item.kp || '');
        result += parseSeeds(item.seeds);
        result += parsePeers(item.peers);
        result += parseSize(str);

        if (item.vip) result += badge('badge-vip', '★ VIP');

        return result;
    }

    function hookOnlineStreams() {
        if (!window.Lampa) return;

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var comp = e.object;
                if (comp && comp.activity && comp.activity.type === 'online') {
                    observeStreamItems();
                }
            }
        });

        Lampa.Listener.follow('online', function (e) {
            if (e.type === 'complite' || e.type === 'ready' || e.type === 'list') {
                setTimeout(observeStreamItems, 300);
            }
        });

        Lampa.Listener.follow('torrent', function (e) {
            if (e.type === 'list' || e.type === 'ready') {
                setTimeout(observeTorrentItems, 300);
            }
        });
    }

    function processStreamItem(el) {
        if (el.getAttribute('data-badges-ru') === '1') return;
        el.setAttribute('data-badges-ru', '1');

        var title = '';
        var titleEl = el.querySelector('.online-prestige__title, .stream-title, .torrent-item__title, .online-item__title, [class*="title"]');
        if (titleEl) title = titleEl.textContent || '';

        var info = '';
        var infoEl = el.querySelector('.online-prestige__info, .stream-info, .torrent-item__info, .online-item__info, [class*="info"]');
        if (infoEl) info = infoEl.textContent || '';

        var fullText = title + ' ' + info;

        var item = {
            title: title,
            info: info,
            quality: detectQuality(fullText),
            seeds: detectSeeds(el),
            peers: detectPeers(el),
            rating: detectRating(el),
            vip: /vip/i.test(fullText)
        };

        var html = buildBadges(item);
        if (!html) return;

        var existing = el.querySelector('.stream-badges-ru');
        if (existing) existing.remove();

        var container = document.createElement('div');
        container.className = 'stream-badges-ru';
        container.innerHTML = html;

        var insertTarget = infoEl || titleEl;
        if (insertTarget && insertTarget.parentNode) {
            insertTarget.parentNode.insertBefore(container, insertTarget.nextSibling);
        } else {
            el.appendChild(container);
        }
    }

    function detectQuality(text) {
        var m = text.match(/\b(2160p|4K|UHD|1080p|720p|480p|360p)\b/i);
        return m ? m[1] : '';
    }

    function detectSeeds(el) {
        var seedEl = el.querySelector('[class*="seed"], [data-seeds], .seed-count');
        if (seedEl) return seedEl.textContent.replace(/\D/g, '');
        var m = (el.textContent || '').match(/seeds?[:\s]+(\d+)/i);
        return m ? m[1] : undefined;
    }

    function detectPeers(el) {
        var peerEl = el.querySelector('[class*="peer"], [data-peers], .peer-count');
        if (peerEl) return peerEl.textContent.replace(/\D/g, '');
        return undefined;
    }

    function detectRating(el) {
        var ratingEl = el.querySelector('[class*="rating"], [data-vote], [data-rating]');
        if (ratingEl) {
            var txt = ratingEl.textContent.replace(/[^\d.]/g, '');
            return txt || '';
        }
        var m = (el.textContent || '').match(/★\s*([\d.]+)/);
        return m ? m[1] : '';
    }

    var _observer = null;

    function observeStreamItems() {
        var selectors = [
            '.online-prestige__item',
            '.stream-item',
            '.torrent-item',
            '.online-item',
            '[class*="prestige__item"]',
            '[class*="stream__item"]'
        ];

        selectors.forEach(function (sel) {
            document.querySelectorAll(sel).forEach(function (el) {
                processStreamItem(el);
            });
        });
    }

    function observeTorrentItems() {
        observeStreamItems();
    }

    function startObserver() {
        if (_observer) return;
        _observer = new MutationObserver(function (mutations) {
            var shouldProcess = false;
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) shouldProcess = true;
                });
            });
            if (shouldProcess) {
                clearTimeout(startObserver._timer);
                startObserver._timer = setTimeout(observeStreamItems, 150);
            }
        });
        _observer.observe(document.body, { childList: true, subtree: true });
    }

    function patchOnlinePlugin() {
        if (!window.Lampa) return;

        var originalRender = null;

        function tryPatchLampaOnline() {
            var online = Lampa.Component && Lampa.Component.get ? Lampa.Component.get('online') : null;
            if (!online) return false;

            var proto = online.prototype || online;
            if (proto && proto.buildStream && !proto._badges_patched) {
                proto._badges_patched = true;
                var orig = proto.buildStream.bind ? proto.buildStream : null;
                if (orig) {
                    proto.buildStream = function (stream, index) {
                        var result = orig.call(this, stream, index);
                        return result;
                    };
                }
            }
            return true;
        }

        setTimeout(function () {
            if (!tryPatchLampaOnline()) {
                setTimeout(tryPatchLampaOnline, 2000);
            }
        }, 1000);
    }

    function patchStreamData() {
        if (!window.Lampa) return;

        var origNetwork = Lampa.Network;
        if (!origNetwork) return;
    }

    function addSourceNameBadges() {
        if (!window.Lampa) return;

        Lampa.Listener.follow('online', function (e) {
            if (e.type === 'source' || e.type === 'api_source' || e.type === 'parse') {
                setTimeout(function () {
                    document.querySelectorAll('[class*="source__item"], [class*="source-item"]').forEach(function (el) {
                        if (el.getAttribute('data-src-badge') === '1') return;
                        el.setAttribute('data-src-badge', '1');
                        var name = (el.textContent || '').trim().split('\n')[0].trim();
                        if (name && name.length < 30) {
                            var b = document.createElement('span');
                            b.className = 'stream-badge badge-source';
                            b.style.cssText = 'margin-left:6px;font-size:10px;';
                            b.textContent = name;
                        }
                    });
                }, 400);
            }
        });
    }

    function renderTorrentBadgesFromData(item) {
        if (!item) return '';
        var parts = [];
        var text = (item.title || '') + ' ' + (item.name || '') + ' ' + (item.quality || '') + ' ' + (item.info || '');

        parts.push(parseQuality(text));
        parts.push(parseHDR(text));
        parts.push(parseCodec(text));
        parts.push(parseSource(text));
        parts.push(parseAudio(text));

        var seeds = parseInt(item.seeds);
        if (!isNaN(seeds)) {
            if (seeds < 5) parts.push(badge('badge-risk', 'Риск'));
            if (seeds === 0) parts.push(badge('badge-noplay', 'Может не играть'));
            parts.push(badge('badge-seeds', '↑ ' + seeds));
        }
        var peers = parseInt(item.peers || item.leeches);
        if (!isNaN(peers)) parts.push(badge('badge-peers', '↓ ' + peers));

        var rating = parseFloat(item.imdb || item.vote || item.rating || 0);
        if (rating > 0) parts.push(badge('badge-rating', '★ ' + rating.toFixed(1)));

        parts.push(parseSize(text));

        if (item.vip || /vip/i.test(text)) parts.push(badge('badge-vip', '★ VIP'));

        return parts.filter(Boolean).join('');
    }

    function hookTorrentPlugin() {
        if (!window.Lampa) return;

        Lampa.Listener.follow('torrent_parser', function (e) {
            if (e.type === 'complite' && e.results && e.results.length) {
                e.results.forEach(function (item) {
                    if (!item._badges_html) {
                        item._badges_html = renderTorrentBadgesFromData(item);
                    }
                });
            }
        });
    }

    function init() {
        injectStyles();
        hookOnlineStreams();
        hookTorrentPlugin();
        patchOnlinePlugin();
        addSourceNameBadges();
        startObserver();

        if (window.Lampa && Lampa.Storage) {
            Lampa.Storage.set(PLUGIN_NAME + '_version', PLUGIN_VERSION);
        }

        console.log('[' + PLUGIN_NAME + '] v' + PLUGIN_VERSION + ' — плагин бейджей загружен');
    }

    if (window.appready) {
        init();
    } else {
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') init();
            });
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                var attempts = 0;
                var check = setInterval(function () {
                    attempts++;
                    if (window.Lampa && Lampa.Listener) {
                        clearInterval(check);
                        Lampa.Listener.follow('app', function (e) {
                            if (e.type === 'ready') init();
                        });
                        if (window.appready) init();
                    } else if (attempts > 50) {
                        clearInterval(check);
                        init();
                    }
                }, 200);
            });
        }
    }
})();
