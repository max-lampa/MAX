(function () {
    // Netflix Premium Style by Maks TV
    'use strict';

    var isExoticOS = /Vidaa|Web0S|Tizen|SmartTV|Metrological|NetCast/i.test(navigator.userAgent);

    /* ================================================================
     *  Netflix Premium Style v9.0  —  Multi-screen, Custom UI
     *
     *  ✦ Logo Engine    → Lampa.TMDB.api() + Lampa.TMDB.key()
     *  ✦ Quality Engine → Реальные данные релизов TMDB (без сторонних API)
     *  ✦ Badges         → БЕЗ blur / backdrop-filter (чистая заливка)
     *  ✦ Posters        → Авто-апгрейд разрешения + плавное появление
     *  ✦ LEFT MENU      → НЕ ТРОГАЕТСЯ ВООБЩЕ (ни CSS, ни настроек)
     *  ✦ GPU            → translate3d / scale3d (60fps)
     *  ✦ Multi-screen   → Phones, Tablets, TV, 4K
     * ================================================================ */

    // ─────────────────────────────────────────────────────────────────
    //  SECTION 1 — HELPERS
    // ─────────────────────────────────────────────────────────────────

    var FADE_OUT_TEXT = 300;
    var MORPH_HEIGHT = 400;
    var FADE_IN_IMG = 400;
    var SAFE_DELAY = 200;

    function storeGet(name, def) {
        try {
            if (window.Lampa && Lampa.Storage) return Lampa.Storage.get(name, def);
        } catch (e) { /* ignore */ }
        return def;
    }

    function storeSet(name, value) {
        try {
            if (window.Lampa && Lampa.Storage) Lampa.Storage.set(name, value);
        } catch (e) { /* ignore */ }
    }

    function storeBool(name, def) {
        var v = storeGet(name, def);
        if (v === true || v === 'true' || v === 1 || v === '1') return true;
        if (v === false || v === 'false' || v === 0 || v === '0') return false;
        return !!def;
    }

    function uiLang() {
        var l = storeGet('language', 'uk') || 'uk';
        if (l === 'ua') l = 'uk';
        return l;
    }

    function sizeWeight(size) {
        if (!size) return 0;
        if (size === 'original') return 99999;
        var m = /^w(\d+)$/.exec(size);
        return m ? parseInt(m[1], 10) : 0;
    }


    // ─────────────────────────────────────────────────────────────────
    //  SECTION 2 — LOGO ENGINE  (без хардкода API-ключей)
    // ─────────────────────────────────────────────────────────────────

    var LogoEngine = {
        _cachePrefix: 'nfx_logo_v7_',

        _key: function (type, id, lang) {
            return this._cachePrefix + type + '_' + id + '_' + lang;
        },

        _getCached: function (key) {
            try {
                var s = sessionStorage.getItem(key);
                if (s) return s;
            } catch (e) { /* ignore */ }
            return storeGet(key, null);
        },

        _setCached: function (key, value) {
            var v = value || 'none';
            try { sessionStorage.setItem(key, v); } catch (e) { /* ignore */ }
            storeSet(key, v);
        },

        _pickBest: function (logos, targetLang) {
            if (!logos || !logos.length) return null;

            var sorted = logos.slice().sort(function (a, b) {
                var aS = (a.file_path || '').toLowerCase().indexOf('.svg') > -1;
                var bS = (b.file_path || '').toLowerCase().indexOf('.svg') > -1;
                return aS === bS ? 0 : (aS ? 1 : -1);
            });

            for (var i = 0; i < sorted.length; i++) {
                if (sorted[i].iso_639_1 === targetLang && sorted[i].file_path) return sorted[i].file_path;
            }

            if (targetLang === 'uk' || targetLang === 'ua') {
                for (var r = 0; r < sorted.length; r++) {
                    if (sorted[r].iso_639_1 === 'ru' && sorted[r].file_path) return sorted[r].file_path;
                }
            }

            for (var j = 0; j < sorted.length; j++) {
                if (sorted[j].iso_639_1 === 'en' && sorted[j].file_path) return sorted[j].file_path;
            }

            return sorted[0] && sorted[0].file_path ? sorted[0].file_path : null;
        },

        _getLang: function () {
            var manual = storeGet('nfx_logo_lang', 'auto');
            if (manual && manual !== 'auto') return manual;
            var u = storeGet('logo_lang', '');
            return u || uiLang() || 'uk';
        },

        resolve: function (movie, done) {
            if (!movie || !movie.id || !window.Lampa || !Lampa.TMDB || !window.$) { done(null); return; }

            var type = (movie.name || movie.first_air_date) ? 'tv' : 'movie';
            var lang = this._getLang();
            var cacheKey = this._key(type, movie.id, lang);

            var cached = this._getCached(cacheKey);
            if (cached === 'none') { done(null); return; }
            if (cached) { done(cached); return; }

            var url = Lampa.TMDB.api(
                type + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key() +
                '&include_image_language=' + lang + ',ru,en,null'
            );

            var self = this;
            var size = storeGet('logo_size', 'original') || 'original';

            $.get(url, function (data_api) {
                var path = self._pickBest(data_api && data_api.logos, lang);
                if (path) {
                    var imgUrl = Lampa.TMDB.image('/t/p/' + size + path.replace('.svg', '.png'));
                    self._setCached(cacheKey, imgUrl);
                    done(imgUrl);
                } else {
                    self._setCached(cacheKey, 'none');
                    done(null);
                }
            }).fail(function () {
                done(null);
            });
        }
    };


    // ─────────────────────────────────────────────────────────────────
    //  SECTION 3 — QUALITY ENGINE
    //  Метки качества из реальных данных релизов TMDB.
    //  Никаких сторонних плагинов, парсеров и левых сервисов.
    //
    //  TMDB release types: 1 premiere · 2 limited · 3 theatrical
    //                      4 digital  · 5 physical · 6 TV
    //  → physical = BLURAY   → digital = WEB-DL   → TV = HDTV
    //  → только кино-прокат  = CAMRIP / TS
    //  → ещё не вышло        = СКОРО  (фейковых меток нет никогда)
    // ─────────────────────────────────────────────────────────────────

    var QualityEngine = {
        prefix: 'nfx_q_v9_',
        ttl: 7 * 24 * 60 * 60 * 1000,

        posters: {},   // имя файла постера → meta
        titles: {},    // название в lowercase → meta | 'none'
        pending: {},   // ключ кэша → [callbacks]
        queue: [],
        active: 0,
        limit: 2,

        mode: function () {
            var m = storeGet('nfx_quality_badge', 'full');
            if (m !== 'off' && m !== 'fast' && m !== 'full') m = 'full';
            return m;
        },

        enabled: function () {
            return this.mode() !== 'off';
        },

        soonText: function () {
            var l = uiLang();
            if (l === 'ru') return 'СКОРО';
            if (l === 'uk') return 'НЕЗАБАРОМ';
            return 'SOON';
        },

        // ── кэш ────────────────────────────────────────────────────
        _read: function (key) {
            var raw = null;
            try { raw = sessionStorage.getItem(this.prefix + key); } catch (e) { /* ignore */ }
            if (!raw) raw = storeGet(this.prefix + key, null);
            if (!raw) return null;
            try {
                var obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
                if (!obj || !obj.t) return null;
                if (Date.now() - obj.t > this.ttl) return null;
                return obj;
            } catch (e) {
                return null;
            }
        },

        _write: function (key, value) {
            var raw = JSON.stringify({ v: value || 'none', t: Date.now() });
            try { sessionStorage.setItem(this.prefix + key, raw); } catch (e) { /* ignore */ }
            storeSet(this.prefix + key, raw);
        },

        // ── индекс постеров/названий из событий Lampa ───────────────
        metaOf: function (data) {
            if (!data || !data.id) return null;
            var isTv = data.media_type === 'tv' ||
                       (!!data.name && !data.title) ||
                       !!data.first_air_date ||
                       !!data.number_of_seasons;
            return {
                id: data.id,
                type: isTv ? 'tv' : 'movie',
                date: data.release_date || data.first_air_date || ''
            };
        },

        posterFile: function (path) {
            if (!path || typeof path !== 'string') return '';
            var m = path.match(/\/?([A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp))(?:\?|$)/);
            return m ? m[1] : '';
        },

        indexOne: function (data) {
            var meta = this.metaOf(data);
            if (!meta) return;
            var file = this.posterFile(data.poster_path || data.poster || data.img || '');
            if (file && !this.posters[file]) this.posters[file] = meta;
            var title = (data.title || data.name || '').trim().toLowerCase();
            if (title && !this.titles[title]) this.titles[title] = meta;
        },

        index: function (json) {
            if (!json) return;
            var buckets = [json.results, json.items, json.movies, json.data, json.list];
            for (var b = 0; b < buckets.length; b++) {
                var arr = buckets[b];
                if (arr && arr.length) {
                    for (var i = 0; i < arr.length; i++) this.indexOne(arr[i]);
                }
            }
            if (json.id) this.indexOne(json);
        },

        // ── троттлинг запросов (щадим слабые ТВ и TMDB) ────────────
        enqueue: function (job) {
            this.queue.push(job);
            this.pump();
        },

        pump: function () {
            var self = this;
            while (this.active < this.limit && this.queue.length) {
                var job = this.queue.shift();
                this.active++;
                (function (run) {
                    var finished = false;
                    var release = function () {
                        if (finished) return;
                        finished = true;
                        self.active--;
                        setTimeout(function () { self.pump(); }, 60);
                    };
                    try { run(release); } catch (e) { release(); }
                })(job);
            }
        },

        get: function (url, done) {
            if (!window.Lampa || !Lampa.TMDB || !window.$) { done(null); return; }
            var self = this;
            this.enqueue(function (release) {
                $.ajax({ url: url, dataType: 'json', timeout: 12000 })
                    .done(function (json) {
                        try { self.index(json); } catch (e) { /* ignore */ }
                        release();
                        done(json);
                    })
                    .fail(function () {
                        release();
                        done(null);
                    });
            });
        },

        // ── построение метки ───────────────────────────────────────
        _fromReleaseDates: function (json) {
            if (!json || !json.results || !json.results.length) return null;

            var now = Date.now();
            var best = 0;
            var rank = { 5: 6, 4: 5, 6: 4, 3: 2, 2: 2, 1: 1 };
            var future = false;

            for (var c = 0; c < json.results.length; c++) {
                var country = json.results[c];
                var list = country && country.release_dates;
                if (!list || !list.length) continue;

                for (var d = 0; d < list.length; d++) {
                    var rec = list[d];
                    if (!rec || !rec.release_date) continue;
                    var ts = Date.parse(rec.release_date);
                    if (isNaN(ts)) continue;
                    if (ts > now) { future = true; continue; }
                    var r = rank[rec.type] || 0;
                    if (r > best) best = r;
                }
            }

            if (best >= 6) return { text: 'BLURAY', kind: 'bluray' };
            if (best === 5) return { text: 'WEB-DL', kind: 'web' };
            if (best === 4) return { text: 'HDTV', kind: 'hdtv' };
            if (best === 2) return { text: 'CAMRIP', kind: 'cam' };
            if (best === 1) return { text: 'TS', kind: 'cam' };
            if (future) return { text: this.soonText(), kind: 'soon' };
            return null;
        },

        _fromDate: function (dateStr) {
            if (!dateStr) return null;
            var ts = Date.parse(dateStr);
            if (isNaN(ts)) return null;
            if (ts > Date.now()) return { text: this.soonText(), kind: 'soon' };
            return { text: 'WEB-DL', kind: 'web' };
        },

        _pack: function (label) {
            return label ? label.kind + '|' + label.text : 'none';
        },

        _unpack: function (packed) {
            if (!packed || packed === 'none') return null;
            var parts = String(packed).split('|');
            if (parts.length < 2) return null;
            return { kind: parts[0], text: parts.slice(1).join('|') };
        },

        resolve: function (meta, done) {
            if (!meta || !meta.id) { done(null); return; }

            var key = meta.type + '_' + meta.id;
            var cached = this._read(key);
            if (cached) { done(this._unpack(cached.v)); return; }

            if (this.pending[key]) { this.pending[key].push(done); return; }
            this.pending[key] = [done];

            var self = this;
            var finish = function (label) {
                self._write(key, self._pack(label));
                var waiters = self.pending[key] || [];
                delete self.pending[key];
                for (var i = 0; i < waiters.length; i++) {
                    try { waiters[i](label); } catch (e) { /* ignore */ }
                }
            };

            if (!window.Lampa || !Lampa.TMDB) { finish(this._fromDate(meta.date)); return; }

            if (meta.type === 'tv') {
                if (meta.date) { finish(this._fromDate(meta.date)); return; }
                this.get(Lampa.TMDB.api('tv/' + meta.id + '?api_key=' + Lampa.TMDB.key()), function (json) {
                    finish(self._fromDate(json && (json.first_air_date || json.last_air_date)));
                });
                return;
            }

            this.get(Lampa.TMDB.api('movie/' + meta.id + '/release_dates?api_key=' + Lampa.TMDB.key()), function (json) {
                var label = self._fromReleaseDates(json);
                if (!label && meta.date) label = self._fromDate(meta.date);
                finish(label);
            });
        },

        // ── поиск id по названию карточки (режим "Полностью") ──────
        resolveByTitle: function (title, done) {
            var clean = (title || '').trim();
            if (!clean || !window.Lampa || !Lampa.TMDB) { done(null); return; }

            var low = clean.toLowerCase();
            if (this.titles[low] === 'none') { done(null); return; }
            if (this.titles[low]) { done(this.titles[low]); return; }

            var self = this;
            var key = 'search_' + low;
            var cached = this._read(key);
            if (cached) {
                if (cached.v === 'none') { this.titles[low] = 'none'; done(null); return; }
                var parts = String(cached.v).split('|');
                if (parts.length >= 3) {
                    var meta = { id: parts[0], type: parts[1], date: parts[2] };
                    this.titles[low] = meta;
                    done(meta);
                    return;
                }
            }

            var url = Lampa.TMDB.api(
                'search/multi?api_key=' + Lampa.TMDB.key() +
                '&language=' + uiLang() +
                '&query=' + encodeURIComponent(clean)
            );

            this.get(url, function (json) {
                var found = null;
                var list = (json && json.results) || [];
                for (var i = 0; i < list.length; i++) {
                    var it = list[i];
                    if (!it || (it.media_type && it.media_type !== 'movie' && it.media_type !== 'tv')) continue;
                    var name = (it.title || it.name || '').trim().toLowerCase();
                    if (name === low) { found = self.metaOf(it); break; }
                    if (!found) found = self.metaOf(it);
                }
                if (found) {
                    self.titles[low] = found;
                    self._write(key, found.id + '|' + found.type + '|' + (found.date || ''));
                } else {
                    self.titles[low] = 'none';
                    self._write(key, 'none');
                }
                done(found);
            });
        }
    };


    // ─────────────────────────────────────────────────────────────────
    //  SECTION 4 — HERO PROCESSOR  (логотип + метка качества)
    // ─────────────────────────────────────────────────────────────────

    function applyLogoStyles(img) {
        var logoH = storeGet('nfx_logo_height', '200px');
        img.style.display = 'block';
        img.style.maxWidth = '100%';
        img.style.maxHeight = logoH;
        img.style.width = 'auto';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'left bottom';
        img.style.boxSizing = 'border-box';
        img.style.paddingBottom = '0.2em';
        img.style.filter = 'drop-shadow(0 4px 20px rgba(0,0,0,0.85))';
    }

    /**
     * Плавная анимация логотипа:
     *  1. Гасим текст  2. Меняем на <img>  3. Морфим высоту  4. Проявляем лого
     */
    function startLogoAnimation(imgUrl, titleElem, domTitle) {
        if (!titleElem || !titleElem.length || !domTitle) return;

        var img = new Image();
        img.src = imgUrl;

        var startTextHeight = domTitle.getBoundingClientRect().height;

        applyLogoStyles(img);
        img.style.opacity = '0';

        img.onload = function () {
            setTimeout(function () {
                if (!domTitle.parentNode) return;
                startTextHeight = domTitle.getBoundingClientRect().height;

                // 1) Гасим текст
                titleElem.css({
                    transition: 'opacity ' + (FADE_OUT_TEXT / 1000) + 's ease',
                    opacity: '0'
                });

                setTimeout(function () {
                    if (!domTitle.parentNode) return;

                    // 2) Подмена
                    titleElem.empty().append(img);
                    titleElem.css({ opacity: '1', transition: 'none' });

                    var targetHeight = domTitle.getBoundingClientRect().height;

                    domTitle.style.height = startTextHeight + 'px';
                    domTitle.style.display = 'block';
                    domTitle.style.overflow = 'hidden';
                    domTitle.style.boxSizing = 'border-box';

                    void domTitle.offsetHeight;

                    // 3) Морф высоты
                    domTitle.style.transition = 'height ' + (MORPH_HEIGHT / 1000) + 's cubic-bezier(0.4, 0, 0.2, 1)';

                    requestAnimationFrame(function () {
                        domTitle.style.height = targetHeight + 'px';

                        // 4) Проявление
                        setTimeout(function () {
                            img.style.transition = 'opacity ' + (FADE_IN_IMG / 1000) + 's ease';
                            img.style.opacity = '1';
                        }, Math.max(0, MORPH_HEIGHT - 100));

                        // Очистка
                        setTimeout(function () {
                            domTitle.style.height = '';
                            domTitle.style.overflow = '';
                            domTitle.style.transition = 'none';
                            applyLogoStyles(img);
                        }, MORPH_HEIGHT + FADE_IN_IMG + 50);
                    });
                }, FADE_OUT_TEXT);

            }, SAFE_DELAY);
        };

        img.onerror = function () {
            titleElem.css({ opacity: '1', transition: 'none' });
        };
    }

    /** Метка качества в строке деталей на странице карточки. */
    function paintHeroQuality(render, movie) {
        if (!QualityEngine.enabled() || !storeBool('nfx_hero_quality', true)) return;
        if (!render || !render.length || !movie || !window.$) return;

        var meta = QualityEngine.metaOf(movie);
        if (!meta) return;

        QualityEngine.resolve(meta, function (label) {
            if (!label) return;
            try {
                var host = render.find('.full-start-new__details, .full-start__details').first();
                if (!host.length) host = render.find('.full-start-new__rate-line, .full-start__rate-line').first();
                if (!host.length) return;

                var chip = host.find('.nfx-hero-quality');
                if (!chip.length) {
                    chip = $('<span class="nfx-hero-quality"></span>');
                    host.prepend(chip);
                }
                chip.attr('data-q', label.kind).text(label.text);
            } catch (e) { /* ignore */ }
        });
    }

    function initHeroProcessor() {
        if (window.__nfx_hero_bound) return;
        window.__nfx_hero_bound = true;

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;

            var movie = e.data && e.data.movie;
            if (!movie) return;

            QualityEngine.indexOne(movie);

            var type = (movie.name || movie.first_air_date) ? 'tv' : 'movie';
            var render = e.object.activity.render();
            var titleElem = render.find('.full-start-new__title');
            var domTitle = titleElem[0];

            paintHeroQuality(render, movie);

            if (!titleElem.length) return;

            titleElem.css({ opacity: '1', transition: 'none' });

            // ── Фон героя для мобильных (CSS-переменная) ──
            var bgUrl = '';
            if (movie.backdrop_path) {
                bgUrl = Lampa.TMDB.image('t/p/original' + movie.backdrop_path);
            } else if (movie.poster_path) {
                bgUrl = Lampa.TMDB.image('t/p/w780' + movie.poster_path);
            } else if (movie.img) {
                bgUrl = movie.img;
            } else {
                var fallbackImg = render.find('.full-start-new__left img, .full-start__left img');
                if (fallbackImg.length) bgUrl = fallbackImg.attr('src');
            }

            if (bgUrl && render[0]) {
                render[0].style.setProperty('--nfx-mobile-bg', 'url(' + bgUrl + ')');
            }

            var lang = LogoEngine._getLang();
            var cacheKey = LogoEngine._key(type, movie.id, lang);
            var cached = LogoEngine._getCached(cacheKey);

            if (cached && cached !== 'none') {
                var cachedImg = new Image();
                cachedImg.src = cached;
                if (cachedImg.complete) {
                    applyLogoStyles(cachedImg);
                    titleElem.empty().append(cachedImg);
                    titleElem.css({ opacity: '1', transition: 'none' });
                } else {
                    startLogoAnimation(cached, titleElem, domTitle);
                }
                return;
            }

            if (cached === 'none') return;

            LogoEngine.resolve(movie, function (logoUrl) {
                if (logoUrl) startLogoAnimation(logoUrl, titleElem, domTitle);
            });
        });
    }


    // ─────────────────────────────────────────────────────────────────
    //  SECTION 5 — CARD PROCESSOR
    //  края · цвет рейтинга · качество · hi-res постеры · TOP · fade-in
    // ─────────────────────────────────────────────────────────────────

    var CardProcessor = {
        io: null,

        posterSize: function () {
            var size = storeGet('nfx_poster_quality', 'w500');
            if (size === 'native') return null;
            if (isExoticOS && sizeWeight(size) > sizeWeight('w500')) return 'w500'; // защита памяти ТВ
            return size;
        },

        /** Привязка данных карточки из событий Lampa к DOM-узлу. */
        bindItem: function (item) {
            if (!item) return;

            var data = null;
            if (item.card_data) data = item.card_data;
            else if (item.data) data = item.data;
            else if (item.id) data = item;

            var node = null;
            try {
                if (typeof item.render === 'function') {
                    var r = item.render();
                    node = r && (r[0] || r);
                } else if (item.jquery) {
                    node = item[0];
                } else if (item.nodeType === 1) {
                    node = item;
                }
            } catch (e) { /* ignore */ }

            if (data) QualityEngine.indexOne(data);
            if (!data || !data.id || !node || !node.querySelector) return;

            var meta = QualityEngine.metaOf(data);
            if (!meta) return;

            var card = (node.classList && node.classList.contains('card')) ? node : node.querySelector('.card');
            if (card) card.__nfx_meta = meta;
        },

        metaFor: function (card) {
            if (card.__nfx_meta) return card.__nfx_meta;
            var img = card.querySelector('.card__img');
            var file = QualityEngine.posterFile(img ? (img.getAttribute('src') || '') : '');
            if (file && QualityEngine.posters[file]) {
                card.__nfx_meta = QualityEngine.posters[file];
                return card.__nfx_meta;
            }
            return null;
        },

        titleFor: function (card) {
            var t = card.querySelector('.card__title');
            return t ? (t.textContent || t.innerText || '').trim() : '';
        },

        // ── метка качества ─────────────────────────────────────────
        paintBadge: function (card, label) {
            if (!label || !card.parentNode) return;
            var view = card.querySelector('.card__view');
            if (!view) return;

            var badge = view.querySelector('.nfx-quality');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'card__quality nfx-quality';
                view.appendChild(badge);
            }
            badge.setAttribute('data-q', label.kind);
            badge.textContent = label.text;
            requestAnimationFrame(function () { badge.classList.add('nfx-in'); });
        },

        clearBadge: function (card) {
            var badge = card.querySelector('.nfx-quality');
            if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
        },

        resolveQuality: function (card) {
            var self = this;
            if (!QualityEngine.enabled() || !card.parentNode) return;

            var meta = this.metaFor(card);
            if (meta) {
                QualityEngine.resolve(meta, function (label) { self.paintBadge(card, label); });
                return;
            }

            if (QualityEngine.mode() !== 'full') return;

            var title = this.titleFor(card);
            if (!title) return;

            QualityEngine.resolveByTitle(title, function (found) {
                if (!found || !card.parentNode) return;
                card.__nfx_meta = found;
                QualityEngine.resolve(found, function (label) { self.paintBadge(card, label); });
            });
        },

        watch: function (card) {
            var self = this;
            if (!QualityEngine.enabled()) return;

            if (!window.IntersectionObserver) {
                this.resolveQuality(card);
                return;
            }

            if (!this.io) {
                this.io = new IntersectionObserver(function (entries) {
                    for (var i = 0; i < entries.length; i++) {
                        if (!entries[i].isIntersecting) continue;
                        var el = entries[i].target;
                        self.io.unobserve(el);
                        self.resolveQuality(el);
                    }
                }, { rootMargin: '300px' });
            }

            this.io.observe(card);
        },

        // ── апгрейд разрешения постера ─────────────────────────────
        upgradePoster: function (img) {
            var size = this.posterSize();
            if (!size) return;

            var src = img.getAttribute('src') || '';
            if (!src || src.indexOf('/t/p/') === -1) return;
            if (img.__nfx_size === size) return;

            var m = src.match(/\/t\/p\/(w\d+|original)\//);
            if (!m) { img.__nfx_size = size; return; }
            if (sizeWeight(size) <= sizeWeight(m[1])) { img.__nfx_size = size; return; }

            var next = src.replace('/t/p/' + m[1] + '/', '/t/p/' + size + '/');
            var pre = new Image();
            pre.onload = function () {
                img.__nfx_size = size;
                if (img.parentNode) img.setAttribute('src', next);
            };
            pre.onerror = function () { img.__nfx_size = size; };
            pre.src = next;
        },

        // ── плавное появление постера (без блюра, только opacity) ──
        fadePoster: function (card, img) {
            if (!storeBool('nfx_poster_fade', true) || isExoticOS) return;
            if (img.__nfx_fade) return;
            img.__nfx_fade = true;

            if (img.complete && img.naturalWidth) return;

            var view = card.querySelector('.card__view');
            img.classList.add('nfx-fade');
            if (view) view.classList.add('nfx-load');

            var done = function () {
                img.classList.remove('nfx-fade');
                if (view) view.classList.remove('nfx-load');
            };
            img.addEventListener('load', done);
            img.addEventListener('error', done);
        },

        // ── бейдж TOP по рейтингу, который уже есть в DOM ──────────
        topBadge: function (card) {
            var view = card.querySelector('.card__view');
            if (!view) return;

            var has = view.querySelector('.nfx-top');

            if (!storeBool('nfx_top_badge', true)) {
                if (has && has.parentNode) has.parentNode.removeChild(has);
                return;
            }

            var vote = card.querySelector('.card__vote');
            var val = vote ? parseFloat((vote.textContent || vote.innerText || '').replace(',', '.').trim()) : NaN;

            if (isNaN(val) || val < 8) {
                if (has && has.parentNode) has.parentNode.removeChild(has);
                return;
            }
            if (has) return;

            var badge = document.createElement('div');
            badge.className = 'nfx-top';
            badge.textContent = 'TOP';
            view.appendChild(badge);
        },

        colorizeRating: function (card) {
            var el = card.querySelector('.card__vote');
            if (!el || el.getAttribute('data-nfx-colored')) return;

            var val = parseFloat((el.textContent || el.innerText || '').replace(',', '.').trim());
            if (isNaN(val)) return;

            var color;
            if (val >= 7.5) color = '#2ecc71';
            else if (val >= 6.5) color = '#f1c40f';
            else if (val >= 5.0) color = '#e67e22';
            else color = 'var(--nfx-accent)';

            el.style.setProperty('background', color, 'important');
            el.setAttribute('data-nfx-colored', '1');
        },

        processCard: function (card) {
            var img = card.querySelector('.card__img');
            var src = img ? (img.getAttribute('src') || '') : '';
            var key = QualityEngine.posterFile(src) || src;

            // Lampa переиспользует узлы карточек — сбрасываем всё при смене постера
            if (card.__nfx_key !== key) {
                card.__nfx_key = key;
                card.__nfx_meta = null;
                card.__nfx_watched = false;
                this.clearBadge(card);
            }

            if (img && !img.__nfx_seen) {
                img.__nfx_seen = true;
                this.fadePoster(card, img);
                this.upgradePoster(img);
            }

            if (!card.__nfx_decorated) {
                card.__nfx_decorated = true;
                this.colorizeRating(card);
                this.topBadge(card);
            }

            if (!card.__nfx_watched && QualityEngine.enabled()) {
                card.__nfx_watched = true;
                this.watch(card);
            }
        },

        tagEdges: function () {
            var rows = document.querySelectorAll('.scroll__body');
            for (var r = 0; r < rows.length; r++) {
                var cards = rows[r].querySelectorAll('.card');
                if (!cards.length) continue;
                for (var c = 0; c < cards.length; c++) {
                    cards[c].removeAttribute('data-nfx-edge');
                    cards[c].removeAttribute('data-nfx-single');
                }
                if (cards.length === 1) {
                    cards[0].setAttribute('data-nfx-single', 'true');
                } else {
                    cards[0].setAttribute('data-nfx-edge', 'first');
                    cards[cards.length - 1].setAttribute('data-nfx-edge', 'last');
                }
            }
        },

        scan: function () {
            var cards = document.querySelectorAll('.card');
            for (var i = 0; i < cards.length; i++) {
                try { this.processCard(cards[i]); } catch (e) { /* ignore */ }
            }
        },

        scanAdded: function (root) {
            if (!root || root.nodeType !== 1) return;
            var cards = [];
            if (root.matches && root.matches('.card')) cards.push(root);
            if (root.querySelectorAll) {
                var nested = root.querySelectorAll('.card');
                for (var i = 0; i < nested.length; i++) cards.push(nested[i]);
            }
            for (var j = 0; j < cards.length; j++) {
                try { this.processCard(cards[j]); } catch (e) { /* ignore */ }
            }
        },

        refresh: function () {
            // настройки изменились → пересчитываем всё
            var cards = document.querySelectorAll('.card');
            for (var i = 0; i < cards.length; i++) {
                cards[i].__nfx_key = null;
                if (!QualityEngine.enabled()) this.clearBadge(cards[i]);
            }
            this.tagEdges();
            this.scan();
        }
    };

    function initCardProcessor() {
        if (window.__nfx_cards_bound) return;
        window.__nfx_cards_bound = true;

        // ── Гасим авто-фокусное масштабирование до действий юзера ──
        function enableInteraction() {
            document.body.classList.add('nfx-user-interacted');
            document.removeEventListener('keydown', enableInteraction);
            document.removeEventListener('pointerdown', enableInteraction);
            document.removeEventListener('mousedown', enableInteraction);
        }
        document.addEventListener('keydown', enableInteraction, { once: true });
        document.addEventListener('pointerdown', enableInteraction, { once: true });
        document.addEventListener('mousedown', enableInteraction, { once: true });

        // ── Данные карточек прямо из событий Lampa (без догадок) ──
        if (window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('line', function (e) {
                try {
                    var list = [];
                    if (e.cards && e.cards.length) list = list.concat(Array.prototype.slice.call(e.cards));
                    if (e.items && e.items.length) list = list.concat(Array.prototype.slice.call(e.items));
                    if (e.card) list.push(e.card);
                    if (e.element) list.push(e.element);

                    for (var i = 0; i < list.length; i++) CardProcessor.bindItem(list[i]);
                    if (e.data) QualityEngine.index(e.data);
                } catch (err) { /* ignore */ }
            });

            Lampa.Listener.follow('activity', function (e) {
                try {
                    if (e.component && e.object && e.object.card) QualityEngine.indexOne(e.object.card);
                } catch (err) { /* ignore */ }
            });
        }

        var timer = null;
        var edgeTimer = null;
        var pendingRoots = [];
        var delay = isExoticOS ? 180 : 120;

        var obs = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    if (added[j].nodeType === 1) pendingRoots.push(added[j]);
                }
            }
            clearTimeout(timer);
            timer = setTimeout(function () {
                var roots = pendingRoots.splice(0, pendingRoots.length);
                for (var i = 0; i < roots.length; i++) CardProcessor.scanAdded(roots[i]);
            }, delay);
            clearTimeout(edgeTimer);
            edgeTimer = setTimeout(function () { CardProcessor.tagEdges(); }, 240);
        });
        obs.observe(document.body, { childList: true, subtree: true });

        CardProcessor.tagEdges();
        CardProcessor.scan();
    }


    // ─────────────────────────────────────────────────────────────────
    //  SECTION 6 — CSS  (левое меню не затрагивается вообще)
    // ─────────────────────────────────────────────────────────────────

    function applyBodyFlags() {
        var b = document.body;
        if (!b) return;
        if (storeBool('nfx_hero_zoom', true) && !isExoticOS) b.classList.add('nfx-zoom');
        else b.classList.remove('nfx-zoom');
    }

    function injectCSS() {
        var old = document.getElementById('nfx-premium-v9');
        if (old) old.remove();

        var accent = storeGet('nfx_accent_color', '#e50914');
        var fontFam = storeGet('nfx_font_family', 'Montserrat');
        var scale = storeGet('nfx_card_scale', '1.35');
        var shift = storeGet('nfx_edge_shift', '20px');
        var cardRad = storeGet('nfx_card_radius', '8px');
        var qualityStyle = storeGet('nfx_quality_style', 'compact');
        var qualityPad = qualityStyle === 'wide' ? '3px 10px' : (qualityStyle === 'pill' ? '2px 8px' : '1px 5px');
        var qualityRadius = qualityStyle === 'pill' ? '999px' : '3px';
        var qualityFont = qualityStyle === 'wide' ? '0.68em' : '0.58em';

        function getBorderColor(val) {
            if (val === 'accent') return 'var(--nfx-accent)';
            if (val === 'white') return '#ffffff';
            if (val === 'black') return '#000000';
            return 'transparent';
        }

        var bFocus = getBorderColor(storeGet('nfx_card_border_focus', 'accent'));
        var bIdle = getBorderColor(storeGet('nfx_card_border_idle', 'transparent'));

        function hexToRgb(h) {
            var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
            return r ? parseInt(r[1], 16) + ',' + parseInt(r[2], 16) + ',' + parseInt(r[3], 16) : '229, 9, 20';
        }

        var ratingSet = storeGet('nfx_rating_set', 'no_kp');
        var ratingCSS = '';

        if (ratingSet === 'no_kp') {
            ratingCSS = '.rate--kp { display: none !important; }';
        } else if (ratingSet === 'west') {
            ratingCSS = '.rate--kp, .rate--cub, .rate--rotten { display: none !important; }';
        } else if (ratingSet === 'tmdb') {
            ratingCSS = '.rate--kp, .rate--imdb, .rate--cub, .rate--rotten { display: none !important; }';
        } else if (ratingSet === 'none') {
            ratingCSS = '.full-start-new__rate-line, .full-start__rate-line { display: none !important; }';
        }

        var accentRgb = hexToRgb(accent);
        var fontImport = '@import url("https://fonts.googleapis.com/css2?family=' + fontFam.replace(/ /g, '+') + ':wght@400;500;600;700;800;900&display=swap");';

        var css = `
/* ================================================================
   Netflix Premium Style v9.0 — UI Customization
   ВАЖНО: левое меню (.menu / .menu__*) здесь НЕ стилизуется.
   ================================================================ */

${fontImport}

:root {
    --nfx-bg: #0a0d12;
    --nfx-accent: ${accent};
    --nfx-accent-rgb: ${accentRgb};
    --nfx-accent-gl: rgba(${accentRgb}, 0.5);
    --nfx-accent-bg: rgba(${accentRgb}, 0.7);
    --nfx-text: #f0f0f0;
    --nfx-font: '${fontFam}', 'Helvetica Neue', Arial, sans-serif;
    --nfx-card-scale: ${scale};
    --nfx-shift: 25%;
    --nfx-edge-nudge: ${shift};
    --nfx-duration: 420ms;
    --nfx-ease: cubic-bezier(0.4, 0, 0.2, 1);
    --nfx-radius: ${cardRad};
    --nfx-card-border-focus: ${bFocus};
    --nfx-card-border-idle: ${bIdle};
    --nfx-shadow-text: 0 2px 10px rgba(0,0,0,0.8);
}

body {
    background-color: var(--nfx-bg) !important;
    font-family: var(--nfx-font) !important;
    color: var(--nfx-text) !important;
}


/* ================================================================
   1) OVERFLOW — чтобы увеличенные карточки не обрезались
   ================================================================ */

.items-line__body,
.items-cards,
.scroll,
.scroll--horizontal,
.scroll__content,
.scroll__body {
    overflow: visible !important;
}

.items-line {
    overflow: visible !important;
    position: relative !important;
    z-index: 1 !important;
    padding: 45px 0 !important;
}

.items-line:has(.card.focus),
.items-line:has(.card.hover),
.items-line:has(.card:hover) {
    z-index: 50 !important;
}

.items-line__title {
    font-family: var(--nfx-font) !important;
    font-weight: 700 !important;
    font-size: 1.3em !important;
    color: var(--nfx-text) !important;
    text-shadow: var(--nfx-shadow-text) !important;
    padding-left: 4% !important;
}


/* ================================================================
   2) CARD BASE — GPU, чистый вид (без призрачных масок)
   ================================================================ */

.card {
    position: relative !important;
    transition: transform 260ms var(--nfx-ease), z-index 0s !important;
    z-index: 1 !important;
    will-change: transform !important;
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;
    transform: translate3d(0, 0, 0) !important;
    transform-origin: center center !important;
}

.card__view {
    border-radius: var(--nfx-radius) !important;
    overflow: visible !important;
    position: relative !important;
    background: #16181d !important;
    border: 2px solid var(--nfx-card-border-idle) !important;
    transition: border-color var(--nfx-duration) var(--nfx-ease) !important;
}

/* Слой свечения на GPU */
.card__view::before {
    content: "" !important;
    display: block !important;
    position: absolute !important;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: inherit !important;
    box-shadow: 0 0 12px var(--nfx-accent-gl), 0 12px 24px rgba(0,0,0,0.45) !important;
    opacity: 0 !important;
    z-index: -1 !important;
    pointer-events: none !important;
    transition: opacity var(--nfx-duration) var(--nfx-ease) !important;
    will-change: opacity !important;
}

/* ── УБИВАЕМ ВСЕ МАСКИ / ОВЕРЛЕИ ── */
.card__view::after {
    display: none !important;
    content: none !important;
    background: none !important;
    background-image: none !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
    pointer-events: none !important;
}

.card__view-shadow,
.card .card__overlay,
.card .card__gradient,
.card .card__mask,
.card .card__blackout {
    display: none !important;
    background: none !important;
    background-image: none !important;
    opacity: 0 !important;
}

/* Никакого затемнения и блюра на постерах */
.card .card__img,
.card.focus .card__img,
.card.hover .card__img,
.card:hover .card__img {
    filter: none !important;
    -webkit-filter: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

.card__img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: var(--nfx-radius) !important;
    display: block !important;
    image-rendering: -webkit-optimize-contrast !important;
    transition: opacity 320ms ease !important;
}

/* Плавное появление постера — только прозрачность, без блюра */
.card__img.nfx-fade { opacity: 0 !important; }

@keyframes nfxPulse {
    0%   { background-color: #16181d; }
    50%  { background-color: #21252e; }
    100% { background-color: #16181d; }
}

.card__view.nfx-load {
    animation: nfxPulse 1.3s ease-in-out infinite !important;
}

.card__title {
    font-family: var(--nfx-font) !important;
    font-size: 0.85em !important;
    font-weight: 600 !important;
    color: var(--nfx-text) !important;
    padding: 4px 2px 0px !important;
    line-height: 1.1 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5) !important;
}

/* ── МЕТКА КАЧЕСТВА — снизу слева, БЕЗ БЛЮРА (чистая заливка) ── */
.card__quality {
    display: block !important;
    position: absolute !important;
    bottom: 6px !important;
    left: 6px !important;
    top: auto !important;
    right: auto !important;
    z-index: 20 !important;
    background: #2ecc71 !important;
    background-image: none !important;
    color: #fff !important;
    padding: ${qualityPad} !important;
    border-radius: ${qualityRadius} !important;
    font-size: ${qualityFont} !important;
    font-weight: 700 !important;
    font-family: var(--nfx-font) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.03em !important;
    line-height: 1.4 !important;
    pointer-events: none !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
    text-shadow: none !important;
    filter: none !important;
    -webkit-filter: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    max-width: 80% !important;
    overflow: hidden !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
}

/* Пустую нативную метку не показываем */
.card__quality:empty { display: none !important; }

.nfx-quality {
    opacity: 0;
    transition: opacity 260ms ease !important;
}
.nfx-quality.nfx-in { opacity: 1; }

.card__quality[data-q="bluray"] { background: #3498db !important; }
.card__quality[data-q="web"]    { background: #2ecc71 !important; }
.card__quality[data-q="hdtv"]   { background: #9b59b6 !important; }
.card__quality[data-q="cam"]    { background: #e67e22 !important; }
.card__quality[data-q="soon"]   { background: #5a606a !important; }

/* ── БЕЙДЖ TOP — сверху слева, золото, рейтинг 8+ ── */
.nfx-top {
    position: absolute !important;
    top: 6px !important;
    left: 6px !important;
    z-index: 21 !important;
    background: #f5c518 !important;
    color: #111 !important;
    padding: 1px 6px !important;
    border-radius: 4px !important;
    font-family: var(--nfx-font) !important;
    font-size: 0.62em !important;
    font-weight: 900 !important;
    letter-spacing: 0.06em !important;
    line-height: 1.5 !important;
    pointer-events: none !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

/* ── РЕЙТИНГ — снизу справа, цвет ставит JS ── */
.card__vote {
    display: block !important;
    position: absolute !important;
    bottom: 6px !important;
    right: 6px !important;
    top: auto !important;
    left: auto !important;
    z-index: 20 !important;
    background: rgba(120, 120, 120, 0.6) !important;
    color: #fff !important;
    padding: 2px 8px !important;
    border-radius: 10px 0 10px 0 !important;
    font-size: 0.75em !important;
    font-weight: 800 !important;
    font-family: var(--nfx-font) !important;
    line-height: 1.4 !important;
    pointer-events: none !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

.card__age { display: none !important; }


/* ================================================================
   3) CARD FOCUS — чистый постер + свечение акцентом
   ================================================================ */

body:not(.nfx-user-interacted) .card.focus,
body:not(.nfx-user-interacted) .card.hover {
    transform: translate3d(0, 0, 0) !important;
    z-index: 1 !important;
}

body:not(.nfx-user-interacted) .card.focus .card__view,
body:not(.nfx-user-interacted) .card.hover .card__view {
    border-color: var(--nfx-card-border-idle) !important;
}

body:not(.nfx-user-interacted) .card.focus .card__view::before,
body:not(.nfx-user-interacted) .card.hover .card__view::before {
    opacity: 0 !important;
}

body:not(.nfx-user-interacted) .card.focus ~ .card,
body:not(.nfx-user-interacted) .card.hover ~ .card {
    transform: translate3d(0, 0, 0) !important;
}

.card.focus,
.card.hover,
.card:hover {
    z-index: 100 !important;
    transform: scale3d(var(--nfx-card-scale), var(--nfx-card-scale), 1) !important;
}

.card.focus .card__view,
.card.hover .card__view,
.card:hover .card__view {
    border-color: var(--nfx-card-border-focus) !important;
}

.card.focus .card__view::before,
.card.hover .card__view::before,
.card:hover .card__view::before {
    opacity: 1 !important;
}

/* ── СДВИГ СОСЕДЕЙ (GPU translate3d) ── */
.card.focus ~ .card,
.card.hover ~ .card,
.card:hover ~ .card {
    transform: translate3d(var(--nfx-shift), 0, 0) !important;
    z-index: 1 !important;
}

/* ── КРАЙНИЕ КАРТОЧКИ: origin + смещение против обрезки ── */
.card[data-nfx-edge="first"].focus,
.card[data-nfx-edge="first"].hover,
.card[data-nfx-edge="first"]:hover {
    transform-origin: left center !important;
    transform: scale3d(var(--nfx-card-scale), var(--nfx-card-scale), 1)
               translate3d(var(--nfx-edge-nudge), 0, 0) !important;
}

.card[data-nfx-edge="first"].focus ~ .card,
.card[data-nfx-edge="first"].hover ~ .card,
.card[data-nfx-edge="first"]:hover ~ .card {
    transform: translate3d(calc(var(--nfx-shift) + var(--nfx-edge-nudge)), 0, 0) !important;
}

.card[data-nfx-edge="last"].focus,
.card[data-nfx-edge="last"].hover,
.card[data-nfx-edge="last"]:hover {
    transform-origin: right center !important;
    transform: scale3d(var(--nfx-card-scale), var(--nfx-card-scale), 1)
               translate3d(calc(var(--nfx-edge-nudge) * -1), 0, 0) !important;
}

.card.focus ~ .card[data-nfx-edge="last"],
.card.hover ~ .card[data-nfx-edge="last"],
.card:hover ~ .card[data-nfx-edge="last"] {
    transform: translate3d(calc(var(--nfx-shift) * 0.5), 0, 0) !important;
}

.card[data-nfx-single="true"].focus,
.card[data-nfx-single="true"].hover,
.card[data-nfx-single="true"]:hover {
    transform-origin: left center !important;
    transform: scale3d(var(--nfx-card-scale), var(--nfx-card-scale), 1) !important;
}


/* ================================================================
   4) HERO — полноэкранный бэкдроп, ноль оверлеев
   ================================================================ */

.full-start-new,
.full-start {
    position: relative !important;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
}

.full-start-new .full-start-new__background,
.full-start-new .full-start__background,
.full-start__background {
    position: absolute !important;
    top: -6em !important;
    left: 0 !important;
    width: 100% !important;
    height: calc(100% + 6em) !important;
    margin: 0 !important; padding: 0 !important;
    mask-image: none !important; -webkit-mask-image: none !important;
}

.full-start-new .full-start-new__background img,
.full-start-new .full-start__background img,
.full-start__background img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    filter: none !important;
}

/* Медленный кино-зум (выключен на слабых ТВ и в настройках) */
@keyframes nfxKenBurns {
    from { transform: scale(1.02); }
    to   { transform: scale(1.10); }
}

body.nfx-zoom .full-start-new .full-start-new__background img,
body.nfx-zoom .full-start-new .full-start__background img,
body.nfx-zoom .full-start__background img {
    animation: nfxKenBurns 30s ease-out forwards !important;
    will-change: transform !important;
}

.full-start-new::after,
.full-start::after {
    display: none !important;
    content: none !important;
}

.applecation__overlay,
.application__overlay,
.full-start__background.applecation__overlay {
    display: none !important;
}

.full-start-new__gradient,
.full-start__gradient,
.full-start-new__mask,
.full-start__mask {
    display: none !important;
    background: none !important;
}

.full-start-new__title,
.full-start__title,
.applecation__logo,
.applecation__left,
.applecation__right,
.applecation__content-wrapper,
.applecation__meta,
.applecation__ratings,
.full-start-new__head,
.full-start__head,
.full-start-new__details,
.full-start__details {
    background: none !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
}

.full-start-new__title::before,
.full-start-new__title::after,
.full-start__title::before,
.full-start__title::after,
.applecation__logo::before,
.applecation__logo::after,
.applecation__left::before,
.applecation__left::after,
.applecation__content-wrapper::before,
.applecation__content-wrapper::after,
.full-start-new__right::before,
.full-start-new__right::after,
.full-start__right::before,
.full-start__right::after,
.full-start-new__body::before,
.full-start-new__body::after,
.full-start__body::before,
.full-start__body::after {
    display: none !important;
    content: none !important;
    background: none !important;
}

/* ── ДИНАМИЧЕСКИЙ ТУМАН ПРИ СКРОЛЛЕ ── */
.full-start-new::before,
.full-start::before {
    content: "" !important; display: block !important; position: absolute !important;
    top: -6em !important;
    left: 0 !important; right: 0 !important; bottom: 0 !important;
    height: calc(100% + 6em) !important;
    background: linear-gradient(to top, var(--nfx-bg) 0%, rgba(10,13,18,0.85) 35%, transparent 80%) !important;
    opacity: var(--nfx-fog-level, 0.15) !important; z-index: 1 !important;
    pointer-events: none !important; transition: opacity 0.1s linear !important;
}

.full-start-new__reactions,
.full-start__reactions {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
}

.full-start-new__body, .full-start__body {
    position: relative !important; z-index: 2 !important; padding-left: 5% !important;
    display: flex !important; align-items: flex-end !important;
    min-height: 80vh !important;
    padding-top: 6em !important;
    padding-bottom: 2em !important; background: none !important;
}

.full-start-new__right,
.full-start__right {
    position: relative !important;
    z-index: 3 !important;
    max-width: 650px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-end !important;
    gap: 0 !important;
    background: none !important;
}

.full-start-new__left,
.full-start__left {
    display: none !important;
}

.full-start-new__title,
.full-start__title {
    font-family: var(--nfx-font) !important;
    font-weight: 800 !important;
    font-size: 2.6em !important;
    line-height: 1.08 !important;
    color: #fff !important;
    text-shadow: 0 2px 10px rgba(0,0,0,0.7),
                 0 6px 24px rgba(0,0,0,0.8) !important;
    margin-bottom: 8px !important;
    background: none !important;
    background-color: transparent !important;
    box-shadow: none !important;
    max-width: 100% !important;
}

.full-start-new__title img,
.full-start__title img,
.applecation__logo img,
.new-interface-full-logo {
    filter: none !important;
    background: none !important;
    box-shadow: none !important;
    max-width: 100% !important;
}

.full-start-new__head,
.full-start__head {
    font-family: var(--nfx-font) !important;
    font-weight: 500 !important;
    font-size: 0.85em !important;
    line-height: 1.3 !important;
    color: rgba(255,255,255,0.75) !important;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
    margin: 0 0 2px 0 !important;
}

.full-start-new__tagline,
.full-start__tagline {
    font-family: var(--nfx-font) !important;
    font-weight: 500 !important;
    font-style: italic !important;
    font-size: 0.88em !important;
    line-height: 1.3 !important;
    color: rgba(255,255,255,0.65) !important;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
    margin: 0 0 4px 0 !important;
    padding: 0 !important;
}

${ratingCSS}
.full-start-new__rate-line,
.full-start__rate-line {
    font-family: var(--nfx-font) !important;
    font-weight: 500 !important;
    font-size: 0.82em !important;
    line-height: 1.3 !important;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
    margin: 0 0 2px 0 !important;
}

.full-start-new__details,
.full-start__details {
    font-family: var(--nfx-font) !important;
    font-weight: 500 !important;
    font-size: 0.82em !important;
    line-height: 1.3 !important;
    color: rgba(255,255,255,0.72) !important;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
    margin: 0 0 2px 0 !important;
}

/* Метка качества на странице карточки — тоже без блюра */
.nfx-hero-quality {
    display: inline-block !important;
    vertical-align: middle !important;
    margin-right: 0.6em !important;
    padding: 1px 7px !important;
    border-radius: 4px !important;
    background: #2ecc71 !important;
    color: #fff !important;
    font-family: var(--nfx-font) !important;
    font-size: 0.9em !important;
    font-weight: 800 !important;
    letter-spacing: 0.04em !important;
    text-transform: uppercase !important;
    text-shadow: none !important;
    filter: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

.nfx-hero-quality[data-q="bluray"] { background: #3498db !important; }
.nfx-hero-quality[data-q="web"]    { background: #2ecc71 !important; }
.nfx-hero-quality[data-q="hdtv"]   { background: #9b59b6 !important; }
.nfx-hero-quality[data-q="cam"]    { background: #e67e22 !important; }
.nfx-hero-quality[data-q="soon"]   { background: #5a606a !important; }

.full-start-new__text,
.full-start__text,
.full-start-new__description,
.full-start__description {
    font-family: var(--nfx-font) !important;
    font-weight: 500 !important;
    color: rgba(255,255,255,0.72) !important;
    font-size: 0.85em !important;
    line-height: 1.4 !important;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
    max-width: 520px !important;
    margin: 0 0 6px 0 !important;
}

/* ── Кнопки ── */
.full-start__button,
.full-start-new__button {
    font-family: var(--nfx-font) !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    background: rgba(120, 120, 120, 0.2) !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
    color: rgba(255,255,255,0.8) !important;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
    transition: background 300ms ease,
                transform 200ms ease,
                box-shadow 300ms ease,
                border-color 300ms ease !important;
}

.full-start__button.focus,
.full-start__button:hover,
.full-start-new__button.focus,
.full-start-new__button:hover {
    background: var(--nfx-accent-bg) !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
    color: #ffffff !important;
    box-shadow: 0 0 20px var(--nfx-accent-gl),
               0 8px 28px rgba(0,0,0,0.4) !important;
    transform: scale(1.04) !important;
}

.full-start__button.focus *,
.full-start__button:hover *,
.full-start-new__button.focus *,
.full-start-new__button:hover * {
    color: #ffffff !important;
    fill: #ffffff !important;
}


/* ================================================================
   5) ВЕРХНЯЯ ПАНЕЛЬ (левое меню намеренно не трогаем)
   ================================================================ */

.head {
    position: absolute !important;
    top: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important;
    background: transparent !important; background-color: transparent !important; background-image: none !important;
    backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
    border: none !important; box-shadow: none !important; z-index: 100 !important;
}

.head__actions {
    text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
}

.head__button,
.head .button {
    text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important;
}


/* ================================================================
   6) СКРОЛЛ И GPU
   ================================================================ */

.scroll__body, .scroll__content, .items-line__body {
    will-change: transform, scroll-position !important;
    -webkit-backface-visibility: hidden !important;
    backface-visibility: hidden !important;
    -webkit-perspective: 1000 !important;
    perspective: 1000 !important;
    transform-style: preserve-3d !important;
    scroll-behavior: smooth !important;
    -webkit-overflow-scrolling: touch !important;
}

::-webkit-scrollbar {
    width: 4px !important;
    height: 4px !important;
}
::-webkit-scrollbar-track { background: transparent !important; }
::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.15) !important;
    border-radius: 8px !important;
}
::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.3) !important;
}

.scroll__body {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
}
.scroll__body::-webkit-scrollbar { display: none !important; }


/* ================================================================
   7) АДАПТИВ / МУЛЬТИЭКРАН
   ================================================================ */

@media (max-width: 768px) {
    .full-start-new__background, .full-start__background {
        display: none !important;
    }

    .full-start-new, .full-start {
        background-image: var(--nfx-mobile-bg) !important;
        background-size: cover !important;
        background-position: center top !important;
        background-repeat: no-repeat !important;
        margin-top: -5.5em !important;
        padding-top: 5.5em !important;
    }

    .applecation__overlay, .application__overlay {
        display: block !important;
        background: linear-gradient(to top, var(--nfx-bg) 0%, rgba(10,13,18,0.85) 40%, rgba(10,13,18,0.2) 75%, transparent 100%) !important;
        background-color: transparent !important;
        background-image: linear-gradient(to top, var(--nfx-bg) 0%, rgba(10,13,18,0.85) 40%, rgba(10,13,18,0.2) 75%, transparent 100%) !important;
        box-shadow: none !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
    }
}

@media (max-width: 576px) {
    .full-start-new__title, .full-start__title {
        font-size: 1.5em !important;
        margin-bottom: 4px !important;
    }
    .full-start-new__title img, .full-start__title img, .applecation__logo img {
        max-height: 130px !important;
        max-width: 100% !important;
    }
    .full-start-new__right, .full-start__right {
        max-width: 94vw !important;
        padding-bottom: 0.5em !important;
    }
    .full-start-new__body, .full-start__body {
        min-height: 75vh !important;
        padding-left: 2% !important;
        padding-bottom: 2.5em !important;
    }
    :root {
        --nfx-card-scale: 1.1;
        --nfx-shift: 8%;
        --nfx-duration: 300ms;
    }
    .items-line {
        padding: 16px 0 !important;
    }
    .card__quality, .nfx-top {
        font-size: 0.58em !important;
    }
}

@media (min-width: 577px) and (max-width: 1024px) {
    .full-start-new__title, .full-start__title {
        font-size: 1.9em !important;
    }
    .full-start-new__right, .full-start__right {
        max-width: 85vw !important;
    }
    :root {
        --nfx-card-scale: 1.25;
        --nfx-shift: 18%;
        --nfx-duration: 350ms;
    }
    .items-line {
        padding: 30px 0 !important;
    }
}

@media (min-width: 1025px) {
    .full-start-new__title, .full-start__title {
        font-size: 2.8em !important;
        margin-bottom: 12px !important;
    }
    .full-start-new__right, .full-start__right {
        max-width: 650px !important;
    }
    .items-line {
        padding: 45px 0 !important;
    }
}

@media (min-width: 1920px) {
    .full-start-new__title, .full-start__title {
        font-size: 3.8em !important;
    }
    .full-start-new__right, .full-start__right {
        max-width: 1000px !important;
    }
    :root {
        --nfx-card-scale: 1.45;
        --nfx-shift: 30%;
        --nfx-duration: 450ms;
    }
    .items-line {
        padding: 60px 0 !important;
    }
    .card__view {
        border-radius: calc(var(--nfx-radius) * 1.5) !important;
    }
    .card__quality, .nfx-top {
        font-size: 0.8em !important;
    }
}
`;

        var style = document.createElement('style');
        style.id = 'nfx-premium-v9';
        style.textContent = css;
        document.head.appendChild(style);

        applyBodyFlags();
    }


    // ─────────────────────────────────────────────────────────────────
    //  SECTION 7 — НАСТРОЙКИ И ЗАПУСК (без пунктов левого меню)
    // ─────────────────────────────────────────────────────────────────

    function initSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;

        var lang = uiLang();

        var i18n = {
            'en': {
                'ps_title': 'Premium Style',
                'accent_color': 'Accent Color',
                'red': 'Netflix Red',
                'green': 'Green',
                'blue': 'Blue',
                'orange': 'Orange',
                'purple': 'Purple',
                'pink': 'Pink',
                'font_family': 'Font Family',
                'small': 'Small',
                'large': 'Large',
                'xlarge': 'Extra Large',
                'card_scale': 'Card Focus Scale Factor',
                'default': 'Default',
                'edge_shift': 'Edge Shift Nudge',
                'logo_height': 'Logo Max-Height',
                'medium': 'Medium',
                'auto': 'Auto (Lampa)',
                'micro': 'Micro',
                'tiny': 'Tiny',
                'logo_lang': 'Logo Language Override',
                'transparent': 'Transparent',
                'white': 'White',
                'black': 'Black',
                'card_border_focus': 'Card Focus Border',
                'card_border_idle': 'Card Idle Border',
                'card_radius': 'Card Corner Radius',
                'square': 'Square (0px)',
                'small_rad': 'Small (4px)',
                'med_rad': 'Medium (8px)',
                'large_rad': 'Large (12px)',
                'xl_rad': 'Extra Large (16px)',
                'rating_set': 'Ratings Display',
                'r_all': 'All Ratings',
                'r_no_kp': 'Hide Kinopoisk (KP)',
                'r_west': 'TMDB + IMDB Only',
                'r_tmdb': 'TMDB Only',
                'r_none': 'Hide All Ratings',
                'poster_quality': 'Poster Image Quality',
                'pq_native': 'Native (Lampa)',
                'pq_342': 'Standard (w342)',
                'pq_500': 'High (w500)',
                'pq_780': 'Very High (w780)',
                'pq_orig': 'Maximum (original)',
                'q_badge': 'Quality Badge On Posters',
                'q_off': 'Off',
                'q_fast': 'Fast (no extra search)',
                'q_full': 'Full (best coverage)',
                'hero_quality': 'Quality Badge On Card Page',
                'top_badge': 'Gold TOP Badge (rating 8+)',
                'poster_fade': 'Smooth Poster Fade-In',
                'hero_zoom': 'Cinematic Backdrop Zoom',
                'quality_style': 'Quality Badge Style',
                'quality_compact': 'Compact',
                'quality_pill': 'Pill',
                'quality_wide': 'Wide'
            },
            'uk': {
                'ps_title': 'Premium Style',
                'accent_color': 'Акцентний колір',
                'red': 'Червоний (Netflix)',
                'green': 'Зелений',
                'blue': 'Синій',
                'orange': 'Помаранчевий',
                'purple': 'Фіолетовий',
                'pink': 'Рожевий',
                'font_family': 'Шрифт',
                'small': 'Малий',
                'large': 'Великий',
                'xlarge': 'Дуже великий',
                'card_scale': 'Масштаб картки у фокусі',
                'default': 'За замовчуванням',
                'edge_shift': 'Відступ крайньої картки',
                'logo_height': 'Висота логотипу',
                'medium': 'Середній',
                'auto': 'Авто (Lampa)',
                'micro': 'Мікро',
                'tiny': 'Крихітний',
                'logo_lang': 'Мова логотипу (Перевизначення)',
                'transparent': 'Прозора',
                'white': 'Біла',
                'black': 'Чорна',
                'card_border_focus': 'Обводка картки у фокусі',
                'card_border_idle': 'Обводка картки у спокої',
                'card_radius': 'Заокруглення кутів картки',
                'square': 'Квадратні (0px)',
                'small_rad': 'Малі (4px)',
                'med_rad': 'Середні (8px)',
                'large_rad': 'Великі (12px)',
                'xl_rad': 'Максимальні (16px)',
                'rating_set': 'Відображення рейтингів',
                'r_all': 'Всі рейтинги',
                'r_no_kp': 'Без Кінопошуку (KP)',
                'r_west': 'Тільки TMDB + IMDB',
                'r_tmdb': 'Тільки TMDB',
                'r_none': 'Приховати всі',
                'poster_quality': 'Якість зображення постерів',
                'pq_native': 'Як у Lampa',
                'pq_342': 'Стандартна (w342)',
                'pq_500': 'Висока (w500)',
                'pq_780': 'Дуже висока (w780)',
                'pq_orig': 'Максимальна (original)',
                'q_badge': 'Якість на постерах',
                'q_off': 'Вимкнено',
                'q_fast': 'Швидко (без пошуку)',
                'q_full': 'Повністю (максимум карток)',
                'hero_quality': 'Якість на сторінці картки',
                'top_badge': 'Золотий бейдж TOP (рейтинг 8+)',
                'poster_fade': 'Плавна поява постерів',
                'hero_zoom': 'Кінематографічний зум фону',
                'quality_style': 'Стиль метки качества',
                'quality_compact': 'Компактная',
                'quality_pill': 'Капсула',
                'quality_wide': 'Широкая'
            },
            'ru': {
                'ps_title': 'Premium Style',
                'accent_color': 'Акцентный цвет',
                'red': 'Красный (Netflix)',
                'green': 'Зеленый',
                'blue': 'Синий',
                'orange': 'Оранжевый',
                'purple': 'Фиолетовый',
                'pink': 'Розовый',
                'font_family': 'Шрифт',
                'small': 'Маленький',
                'large': 'Большой',
                'xlarge': 'Очень большой',
                'card_scale': 'Масштаб карточки в фокусе',
                'default': 'По умолчанию',
                'edge_shift': 'Отступ крайней карточки',
                'logo_height': 'Высота логотипа',
                'medium': 'Средний',
                'auto': 'Авто (Lampa)',
                'micro': 'Микро',
                'tiny': 'Крошечный',
                'logo_lang': 'Язык логотипа (Переопределение)',
                'transparent': 'Прозрачная',
                'white': 'Белая',
                'black': 'Черная',
                'card_border_focus': 'Обводка карточки в фокусе',
                'card_border_idle': 'Обводка карточки в покое',
                'card_radius': 'Закругление углов карточки',
                'square': 'Квадратные (0px)',
                'small_rad': 'Маленькие (4px)',
                'med_rad': 'Средние (8px)',
                'large_rad': 'Большие (12px)',
                'xl_rad': 'Максимальные (16px)',
                'rating_set': 'Отображение рейтингов',
                'r_all': 'Все рейтинги',
                'r_no_kp': 'Без Кинопоиска (KP)',
                'r_west': 'Только TMDB + IMDB',
                'r_tmdb': 'Только TMDB',
                'r_none': 'Скрыть все',
                'poster_quality': 'Качество изображения постеров',
                'pq_native': 'Как в Lampa',
                'pq_342': 'Стандартное (w342)',
                'pq_500': 'Высокое (w500)',
                'pq_780': 'Очень высокое (w780)',
                'pq_orig': 'Максимальное (original)',
                'q_badge': 'Качество на постерах',
                'q_off': 'Выключено',
                'q_fast': 'Быстро (без поиска)',
                'q_full': 'Полностью (максимум карточек)',
                'hero_quality': 'Качество на странице карточки',
                'top_badge': 'Золотой бейдж TOP (рейтинг 8+)',
                'poster_fade': 'Плавное появление постеров',
                'hero_zoom': 'Кинематографичный зум фона',
                'quality_style': 'Стиль метки качества',
                'quality_compact': 'Компактная',
                'quality_pill': 'Капсула',
                'quality_wide': 'Широкая'
            }
        };

        function t(key) {
            var dict = i18n[lang] || i18n['en'];
            return dict[key] || i18n['en'][key] || key;
        }

        Lampa.SettingsApi.addComponent({
            component: 'nfx_premium',
            name: t('ps_title'),
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>'
        });

        var prm = [
            { name: 'nfx_accent_color', type: 'select', values: { '#e50914': t('red'), '#2ecc71': t('green'), '#3498db': t('blue'), '#e67e22': t('orange'), '#9b59b6': t('purple'), '#e91e63': t('pink') }, default: '#e50914', title: t('accent_color') },
            { name: 'nfx_logo_lang', type: 'select', values: { 'auto': t('auto'), 'uk': 'Ukrainian (UK/UA)', 'ru': 'Russian (RU)', 'en': 'English (EN)' }, default: 'auto', title: t('logo_lang') },
            { name: 'nfx_font_family', type: 'select', values: { 'Montserrat': 'Montserrat', 'Roboto': 'Roboto', 'Open Sans': 'Open Sans', 'Inter': 'Inter' }, default: 'Montserrat', title: t('font_family') },
            { name: 'nfx_poster_quality', type: 'select', values: { 'native': t('pq_native'), 'w342': t('pq_342'), 'w500': t('pq_500'), 'w780': t('pq_780'), 'original': t('pq_orig') }, default: 'w500', title: t('poster_quality') },
            { name: 'nfx_quality_badge', type: 'select', values: { 'off': t('q_off'), 'fast': t('q_fast'), 'full': t('q_full') }, default: 'full', title: t('q_badge') },
            { name: 'nfx_quality_style', type: 'select', values: { 'compact': t('quality_compact'), 'pill': t('quality_pill'), 'wide': t('quality_wide') }, default: 'compact', title: t('quality_style') },
            { name: 'nfx_hero_quality', type: 'trigger', default: true, title: t('hero_quality') },
            { name: 'nfx_top_badge', type: 'trigger', default: true, title: t('top_badge') },
            { name: 'nfx_poster_fade', type: 'trigger', default: true, title: t('poster_fade') },
            { name: 'nfx_hero_zoom', type: 'trigger', default: true, title: t('hero_zoom') },
            { name: 'nfx_card_border_focus', type: 'select', values: { 'transparent': t('transparent'), 'accent': t('accent_color'), 'white': t('white') }, default: 'accent', title: t('card_border_focus') },
            { name: 'nfx_card_border_idle', type: 'select', values: { 'transparent': t('transparent'), 'accent': t('accent_color'), 'white': t('white'), 'black': t('black') }, default: 'transparent', title: t('card_border_idle') },
            { name: 'nfx_card_radius', type: 'select', values: { '0px': t('square'), '4px': t('small_rad'), '8px': t('med_rad') + ' (' + t('default') + ')', '12px': t('large_rad'), '16px': t('xl_rad') }, default: '8px', title: t('card_radius') },
            { name: 'nfx_card_scale', type: 'select', values: { '1.1': '1.10x', '1.25': '1.25x', '1.35': '1.35x (' + t('default') + ')', '1.45': '1.45x' }, default: '1.35', title: t('card_scale') },
            { name: 'nfx_edge_shift', type: 'select', values: { '10px': '10px', '20px': '20px', '30px': '30px' }, default: '20px', title: t('edge_shift') },
            { name: 'nfx_logo_height', type: 'select', values: { '80px': t('micro'), '120px': t('tiny'), '150px': t('small'), '200px': t('medium'), '250px': t('large'), '300px': t('xlarge') }, default: '200px', title: t('logo_height') },
            { name: 'nfx_rating_set', type: 'select', values: { 'all': t('r_all'), 'no_kp': t('r_no_kp'), 'west': t('r_west'), 'tmdb': t('r_tmdb'), 'none': t('r_none') }, default: 'no_kp', title: t('rating_set') }
        ];

        prm.forEach(function (p) {
            var paramConfig = { name: p.name, type: p.type, default: p.default };
            if (p.values) paramConfig.values = p.values;

            Lampa.SettingsApi.addParam({
                component: 'nfx_premium',
                param: paramConfig,
                field: { name: p.title },
                onChange: function () {
                    injectCSS();
                    CardProcessor.refresh();
                }
            });
        });
    }

    function bootstrap() {
        if (window.__nfx_premium_v9) return;
        window.__nfx_premium_v9 = true;

        initSettings();
        injectCSS();
        initHeroProcessor();
        initCardProcessor();

        if (window.Lampa && Lampa.Storage && Lampa.Storage.listener) {
            Lampa.Storage.listener.follow('change', function (e) {
                if (e.name && e.name.indexOf('nfx_') === 0) {
                    injectCSS();
                    CardProcessor.refresh();
                }
            });
        }

        // Динамический туман героя при скролле
        var isScrolling = false;
        document.addEventListener('scroll', function (e) {
            if (e.target && e.target.classList && e.target.classList.contains('scroll__body')) {
                if (!isScrolling) {
                    isScrolling = true;
                    window.requestAnimationFrame(function () {
                        var st = e.target.scrollTop;
                        var hero = e.target.querySelector('.full-start-new, .full-start');
                        if (hero) {
                            var additionalFog = Math.min(st / 400, 0.8);
                            hero.style.setProperty('--nfx-fog-level', 0.05 + additionalFog);
                        }
                        isScrolling = false;
                    });
                }
            }
        }, true);

        console.log('[Maks TV] v9.0 — качество на постерах без блюра, hi-res постеры, нативное левое меню');
    }

    if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') bootstrap();
        });
        setTimeout(bootstrap, 800);
    } else {
        var poll = setInterval(function () {
            if (typeof Lampa !== 'undefined' && Lampa.Listener) {
                clearInterval(poll);
                Lampa.Listener.follow('app', function (e) {
                    if (e.type === 'ready') bootstrap();
                });
                setTimeout(bootstrap, 800);
            }
        }, 200);
    }

})();
