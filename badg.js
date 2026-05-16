(function () {
    'use strict';

    /* ══════════════════════════════════════════════
       StreamBadges RU  —  v3.0
       Бейджи на источниках Lampa (онлайн + торренты)
       Визуально точно как в украинском модуле,
       все подписи на русском языке.
    ══════════════════════════════════════════════ */

    var ATTR = 'data-sbru-done';

    /* ────────── CSS ────────── */
    var CSS = '\
.sbru-row{display:flex;flex-wrap:wrap;gap:3px 4px;margin-top:5px;align-items:center;line-height:1}\
.sbru-badge{display:inline-block;padding:2px 7px;border-radius:4px;font-size:11px;\
font-weight:600;white-space:nowrap;line-height:16px;vertical-align:middle;cursor:default}\
/* source name – тёмно-серый */\
.sbru-source{background:rgba(255,255,255,.12);color:#e0e0e0}\
/* quality – серо-синий */\
.sbru-q{background:rgba(255,255,255,.12);color:#d8e8ff}\
/* HDR / codec – серо-фиолетовый */\
.sbru-tech{background:rgba(160,140,255,.18);color:#c8c0ff}\
/* аудио/субтитры – нейтральный */\
.sbru-audio{background:rgba(255,255,255,.10);color:#ccc}\
/* "Язык группы" – розово-красный (как "Мова на групі") */\
.sbru-lang{background:#7a1f3a;color:#ffb0c8;border:1px solid #a03060}\
/* "Может не играть" – малиновый */\
.sbru-noplay{background:#7a1030;color:#ffa0b0;border:1px solid #b02050}\
/* "Риск" – красно-оранжевый */\
.sbru-risk{background:#7a2800;color:#ffb080;border:1px solid #a04000}\
/* VIP – золотой */\
.sbru-vip{background:#6a4800;color:#ffd060;border:1px solid #a07000}\
/* рейтинг – золотисто-жёлтый */\
.sbru-rating{background:rgba(220,160,0,.20);color:#f0c030;border:1px solid rgba(220,160,0,.35)}\
/* сиды – зелёный */\
.sbru-seeds{background:rgba(0,180,60,.15);color:#60e090;border:1px solid rgba(0,180,60,.3)}\
/* пиры – серо-синий */\
.sbru-peers{background:rgba(80,140,255,.12);color:#90b8ff;border:1px solid rgba(80,140,255,.25)}\
/* размер – зелёный насыщенный */\
.sbru-size{background:rgba(0,160,60,.22);color:#80ffaa;border:1px solid rgba(0,160,60,.35)}\
/* CAMRip предупреждение */\
.sbru-cam{background:#5a0000;color:#ff8888;border:1px solid #800000}\
';

    function injectCSS() {
        if (document.getElementById('sbru-css')) return;
        var s = document.createElement('style');
        s.id   = 'sbru-css';
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    /* ────────── Builder ────────── */
    function badge(cls, txt) {
        return '<span class="sbru-badge ' + cls + '">' + txt + '</span>';
    }

    /* ────────── Парсеры ────────── */

    // Извлекаем источник (первое слово/имя после "•" или в начале info)
    function extractSource(info) {
        // формат: "дата • source / 2160p / ..."
        var m = info.match(/•\s*([^/\n\r•]+)/);
        if (m) return m[1].trim().split('/')[0].trim();
        // иначе первый токен
        m = info.match(/^([A-Za-zА-Яа-яёЁ0-9_\-\.]+)/);
        return m ? m[1].trim() : '';
    }

    function extractQuality(txt) {
        var m = txt.match(/\b(2160p|4k|uhd)\b/i);
        if (m) return '2160p';
        m = txt.match(/\b(1080p)\b/i);
        if (m) return '1080p';
        m = txt.match(/\b(720p)\b/i);
        if (m) return '720p';
        m = txt.match(/\b(480p)\b/i);
        if (m) return '480p';
        m = txt.match(/\b(360p)\b/i);
        if (m) return '360p';
        return '';
    }

    function extractHDR(txt) {
        if (/dolby\s*vision|\bDV\b/i.test(txt))  return 'Dolby Vision';
        if (/HDR10\+/i.test(txt))                return 'HDR10+';
        if (/\bHDR10\b/i.test(txt))              return 'HDR10';
        if (/\bHDR\b/i.test(txt))                return 'HDR';
        return '';
    }

    function extractCodec(txt) {
        if (/\bAV1\b/i.test(txt))             return 'AV1';
        if (/H\.265|HEVC|x265/i.test(txt))    return 'H.265';
        if (/H\.264|AVC|x264/i.test(txt))     return 'H.264';
        return '';
    }

    function extractSize(txt) {
        var m = txt.match(/([\d]+[.,][\d]+|\d+)\s*(GB|MB|ГБ|МБ)\b/i);
        if (!m) return '';
        var n    = m[1].replace(',', '.');
        var unit = m[2].replace(/gb/i,'ГБ').replace(/mb/i,'МБ');
        return n + ' ' + unit;
    }

    // Аудио из заголовка потока
    function extractAudio(title) {
        var lo = title.toLowerCase();
        var out = [];
        if (/дубл/i.test(lo))                 out.push('Дубляж');
        if (/субтитр/i.test(lo))              out.push('Субтитры');
        if (/оригинал|original/i.test(lo))    out.push('Оригинал');
        if (/многоголос/i.test(lo))           out.push('Многоголос');
        if (/одноголос/i.test(lo))            out.push('Одноголос');
        return out;
    }

    // Язык из заголовка
    function extractLang(title) {
        var langs = [
            'Русский','Украинский','Английский','Немецкий','Французский',
            'Испанский','Итальянский','Польский','Турецкий','Казахский'
        ];
        var found = [];
        langs.forEach(function(l) {
            if (title.indexOf(l) !== -1) found.push(l);
        });
        return found;
    }

    function isRussianLang(title) {
        return /русск/i.test(title);
    }

    /* ────────── Сборка строки бейджей для элемента ────────── */
    function buildBadges(title, info, seeds, peers, itemRating, isVip, isCam) {
        var full = (title + ' ' + info).replace(/\s+/g,' ');
        var row  = '';

        // 1. Название источника
        var src = extractSource(info);
        if (src && src.length > 1 && src.length < 25) {
            row += badge('sbru-source', src);
        }

        // 2. Качество
        var q = extractQuality(full);
        if (q) row += badge('sbru-q', q);

        // 3. HDR / Codec
        var hdr = extractHDR(full);
        if (hdr) row += badge('sbru-tech', hdr);
        var codec = extractCodec(full);
        if (codec) row += badge('sbru-tech', codec);

        // 4. Тип релиза
        if (isCam) {
            row += badge('sbru-cam', 'CAMRip');
            row += badge('sbru-noplay', 'Может не играть');
        } else if (/WEB-?DL\b/i.test(full)) {
            row += badge('sbru-tech', 'WEB-DL');
        } else if (/WEB-?Rip\b/i.test(full)) {
            row += badge('sbru-tech', 'WEBRip');
        } else if (/Blu-?[Rr]ay|BD-?Remux|BDRip/i.test(full)) {
            row += badge('sbru-tech', 'Blu-ray');
        } else if (/\bHDRip\b|\bHDTV\b/i.test(full)) {
            row += badge('sbru-tech', 'HDRip');
        }

        // 5. Аудио дорожки
        var audios = extractAudio(title);
        audios.forEach(function(a) { row += badge('sbru-audio', a); });

        // 6. "Язык группы" — если в заголовке есть русский язык
        //    (аналог украинского "Мова на групі")
        if (isRussianLang(title)) {
            row += badge('sbru-lang', 'Язык группы');
        }

        // 7. VIP
        if (isVip) row += badge('sbru-vip', 'VIP');

        // 8. Риск (мало сидов)
        var seedN = parseInt(seeds, 10);
        if (!isNaN(seedN)) {
            if (seedN === 0) row += badge('sbru-noplay', 'Может не играть');
            else if (seedN < 5) row += badge('sbru-risk', 'Риск');
        }

        // 9. Рейтинг
        var cardRating = getCardRating();
        if (cardRating) row += badge('sbru-rating', '★ ' + cardRating);
        else if (itemRating) {
            var rv = parseFloat(itemRating);
            if (!isNaN(rv) && rv > 0) row += badge('sbru-rating', '★ ' + rv.toFixed(1));
        }

        // 10. Сиды / пиры
        if (!isNaN(seedN) && seedN >= 0) row += badge('sbru-seeds', '↑ ' + seedN);
        var peerN = parseInt(peers, 10);
        if (!isNaN(peerN) && peerN >= 0) row += badge('sbru-peers', '↓ ' + peerN);

        // 11. Размер файла
        var sz = extractSize(full);
        if (sz) row += badge('sbru-size', sz);

        return row;
    }

    /* ────────── Рейтинг из активной карточки ────────── */
    function getCardRating() {
        try {
            var act = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
            if (!act) return '';
            var card = act.card || act.movie || act.item || act.data || {};
            var imdb = card.vote_average || card.imdb ||
                       (card.rating && (card.rating.imdb || card.rating.vote_average)) || '';
            if (imdb) {
                var v = parseFloat(imdb);
                if (!isNaN(v) && v > 0) return v.toFixed(1);
            }
        } catch (e) {}
        return '';
    }

    /* ────────── DOM: обработка элемента ────────── */
    function processElement(el) {
        if (el.getAttribute(ATTR)) return;

        // Собираем текст без наших же бейджей
        var tmpClone = el.cloneNode(true);
        var oldRow = tmpClone.querySelector('.sbru-row');
        if (oldRow) oldRow.remove();
        var rawText = (tmpClone.textContent || '').replace(/\s+/g,' ').trim();
        if (rawText.length < 3) return;

        // Ищем блоки заголовка и подзаголовка
        var titleEl = el.querySelector(
            '.online-prestige__title, .online-item__title, .torrent-item__title,' +
            ' [class*="__title"], [class*="-title"]'
        );
        var infoEl  = el.querySelector(
            '.online-prestige__info, .online-item__info, .torrent-item__info,' +
            ' [class*="__info"], [class*="-info"], [class*="__sub"], [class*="-sub"]'
        );

        var title = titleEl ? (titleEl.textContent || '') : rawText.substring(0, 80);
        var info  = infoEl  ? (infoEl.textContent  || '') : rawText;

        // Данные-атрибуты (некоторые плагины их проставляют)
        var seeds  = el.dataset.seeds  || el.dataset.seed  || '';
        var peers  = el.dataset.peers  || el.dataset.peer  || el.dataset.leech || '';
        var rating = el.dataset.rating || el.dataset.imdb  || el.dataset.vote  || '';
        var isVip  = !!(el.dataset.vip || /\bvip\b/i.test(el.className));

        // Ищем числа сидов/пиров в дочерних элементах
        if (!seeds) {
            var sEl = el.querySelector('[class*="seed"],[data-seed],[data-seeds]');
            if (sEl) seeds = sEl.textContent.replace(/\D/g,'');
        }
        if (!peers) {
            var pEl = el.querySelector('[class*="peer"],[class*="leech"],[data-peer],[data-peers]');
            if (pEl) peers = pEl.textContent.replace(/\D/g,'');
        }
        if (!rating) {
            var rEl = el.querySelector('[class*="vote"],[class*="rating"],[data-vote],[data-rating]');
            if (rEl) rating = rEl.textContent.replace(/[^\d.]/g,'');
        }

        var isCam = /\bCAMRip|\bCAM\b|\bTS\b|\bTC\b|\bTeleSync|\bTeleCine/i.test(rawText);

        var html = buildBadges(title, info, seeds, peers, rating, isVip, isCam);
        if (!html) {
            el.setAttribute(ATTR, '1');
            return;
        }

        // Удаляем старую строку бейджей если была
        var existingRow = el.querySelector('.sbru-row');
        if (existingRow) existingRow.remove();

        // Вставляем после info-блока или в конец
        var insertAfter = infoEl || titleEl;
        var row = document.createElement('div');
        row.className = 'sbru-row';
        row.innerHTML = html;

        if (insertAfter && insertAfter.parentNode === el) {
            var next = insertAfter.nextSibling;
            if (next) el.insertBefore(row, next);
            else el.appendChild(row);
        } else {
            el.appendChild(row);
        }

        el.setAttribute(ATTR, '1');
    }

    /* ────────── Сканирование DOM ────────── */
    var SELECTORS = [
        '.online-prestige__item',
        '.online-prestige .online-prestige__item',
        '.online-item',
        '.online__item',
        '.torrent-item',
        '.torrent__item',
        '.stream-item',
        '.stream__item',
        '.source-item',
        '.online-source__item',
        '.episodes__item',
        '.episode-item',
        '[class*="prestige__item"]',
        '[class*="torrent__item"]',
        '[class*="online__item"]',
        '[class*="stream__item"]'
    ];

    function scanAll() {
        SELECTORS.forEach(function (sel) {
            try {
                document.querySelectorAll(sel).forEach(processElement);
            } catch(e) {}
        });
    }

    /* ────────── MutationObserver ────────── */
    var _timer = null;
    function scheduleScan() {
        clearTimeout(_timer);
        _timer = setTimeout(scanAll, 100);
    }

    function startObserver() {
        var obs = new MutationObserver(function (muts) {
            var hasNew = muts.some(function (m) {
                return m.addedNodes.length > 0;
            });
            if (hasNew) scheduleScan();
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    /* ────────── Lampa event hooks ────────── */
    function hookEvents() {
        if (!window.Lampa || !Lampa.Listener) return;

        var EVS_ONLINE   = ['online','online_videos','online_links','player_links','online_serial'];
        var EVS_TORRENT  = ['torrent','torrent_parser','torrent_list','torrent_serial'];
        var EVS_ACTIVITY = ['full','activity'];

        function onEvent(e) {
            var t = e.type;
            if (t==='complite'||t==='ready'||t==='list'||t==='result'||t==='render'||t==='update') {
                scheduleScan();
            }
        }

        EVS_ONLINE.concat(EVS_TORRENT).forEach(function(ev) {
            Lampa.Listener.follow(ev, onEvent);
        });

        EVS_ACTIVITY.forEach(function(ev) {
            Lampa.Listener.follow(ev, function(e) {
                if (e.type === 'complite' || e.type === 'open' || e.type === 'start') {
                    // Сброс при открытии новой карточки
                    document.querySelectorAll('[' + ATTR + ']').forEach(function(el) {
                        el.removeAttribute(ATTR);
                        var r = el.querySelector('.sbru-row');
                        if (r) r.remove();
                    });
                    scheduleScan();
                }
            });
        });

        // Хук на player для качеств
        Lampa.Listener.follow('player', function(e) {
            if (e.type==='qualities'||e.type==='links'||e.type==='complete') scheduleScan();
        });
    }

    /* ────────── Patch Lampa.Online render methods ────────── */
    function patchOnline() {
        if (!window.Lampa) return;

        // Пробуем достучаться до внутреннего компонента online
        var targets = [];
        if (Lampa.Online)            targets.push(Lampa.Online);
        if (Lampa.Reguest)           targets.push(Lampa.Reguest);
        if (Lampa.Component && Lampa.Component.get) {
            try { targets.push(Lampa.Component.get('online')); } catch(e){}
        }

        var METHODS = ['renderItem','buildItem','renderStream','buildStream',
                       'renderLink','buildLink','render','append'];

        targets.forEach(function(mod) {
            if (!mod) return;
            var proto = mod.prototype || mod;
            if (!proto || proto._sbru) return;
            proto._sbru = true;
            METHODS.forEach(function(m) {
                if (typeof proto[m] === 'function') {
                    var orig = proto[m];
                    proto[m] = function() {
                        var r = orig.apply(this, arguments);
                        scheduleScan();
                        return r;
                    };
                }
            });
        });
    }

    /* ────────── Init ────────── */
    function init() {
        injectCSS();
        hookEvents();
        startObserver();
        patchOnline();
        scanAll();

        // Повторные попытки патча (компоненты могут грузиться позже)
        [1000, 3000, 6000].forEach(function(delay) {
            setTimeout(patchOnline, delay);
        });

        console.log('[StreamBadgesRU] v3.0 — запущен');
    }

    /* ────────── Точка входа ────────── */
    if (window.appready) {
        init();
    } else if (window.Lampa && window.Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    } else {
        var _poll = setInterval(function() {
            if (window.Lampa && Lampa.Listener) {
                clearInterval(_poll);
                Lampa.Listener.follow('app', function(e) {
                    if (e.type === 'ready') init();
                });
                if (window.appready) init();
            }
        }, 200);
    }

})();
