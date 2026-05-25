(function () {
    'use strict';

    if (window.top_ratings_plugin) return;
    window.top_ratings_plugin = true;

    var API_BASE    = 'https://api.themoviedb.org/3';
    var YEARS_BACK  = 5;
    var PAGES_TO_LOAD = 10; // 200 записей на запрос

    // ─── Обнаружение TV/большого экрана ─────────────────────────────────────────
    var IS_TV = (window.innerWidth >= 1280) || navigator.userAgent.toLowerCase().indexOf('smart') !== -1;

    // ─── Категории ───────────────────────────────────────────────────────────────
    var CATEGORIES = [
        // ── Общий топ ──
        {
            title: 'Топ популярности',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFD700"/><stop offset="100%" style="stop-color:#FF8C00"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g1)" opacity="0.15"/><path fill="url(#g1)" d="M24 6l4.12 8.34L38 15.8l-7 6.82 1.65 9.63L24 27.4l-8.65 4.85L17 22.62l-7-6.82 9.88-1.46z"/></svg>',
            bg: '#1a1a2e', type: 'all', badge: 'ТОП'
        },
        {
            title: 'Случайный выбор',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#9C27B0"/><stop offset="100%" style="stop-color:#E040FB"/></linearGradient></defs><rect x="4" y="4" width="40" height="40" rx="10" fill="url(#g2)"/><circle fill="white" cx="15" cy="15" r="4"/><circle fill="white" cx="33" cy="33" r="4"/><circle fill="white" cx="24" cy="24" r="4"/><circle fill="white" cx="33" cy="15" r="4"/><circle fill="white" cx="15" cy="33" r="4"/></svg>',
            bg: '#150a1a', type: 'random', badge: 'RND'
        },

        // ── Фильмы ──
        {
            title: 'Топ Фильмы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#E50914"/><stop offset="100%" style="stop-color:#FF6B6B"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g3)" opacity="0.2"/><rect x="4" y="10" width="40" height="28" rx="4" fill="url(#g3)"/><rect x="4" y="10" width="6" height="28" fill="rgba(0,0,0,0.4)"/><rect x="38" y="10" width="6" height="28" fill="rgba(0,0,0,0.4)"/><rect x="4" y="16" width="40" height="4" fill="rgba(0,0,0,0.25)"/><rect x="4" y="28" width="40" height="4" fill="rgba(0,0,0,0.25)"/><circle cx="24" cy="24" r="5" fill="white" opacity="0.9"/><polygon points="22,21 28,24 22,27" fill="#E50914"/></svg>',
            bg: '#1a0a0a', type: 'movies'
        },
        {
            title: 'Новые Фильмы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#00C853"/><stop offset="100%" style="stop-color:#69F0AE"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g4)"/><path fill="white" d="M16 14h4l4 6 4-6h4v20h-4V20l-4 6-4-6v14h-4z"/></svg>',
            bg: '#0a1a0a', type: 'new_movies', badge: 'NEW'
        },
        {
            title: 'Фильмы 8+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FF8C00"/><stop offset="100%" style="stop-color:#FFD700"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g5)"/><text x="24" y="31" text-anchor="middle" fill="white" font-size="20" font-weight="900" font-family="Arial">8+</text></svg>',
            bg: '#1a0f00', type: 'top_movies_8'
        },
        {
            title: 'Фильмы 7+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFA500"/><stop offset="100%" style="stop-color:#FFD740"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g6)"/><text x="24" y="31" text-anchor="middle" fill="white" font-size="20" font-weight="900" font-family="Arial">7+</text></svg>',
            bg: '#1a1200', type: 'top_movies_7'
        },
        {
            title: 'Фильмы 6+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFD700"/><stop offset="100%" style="stop-color:#FFEB3B"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g7)"/><text x="24" y="31" text-anchor="middle" fill="#333" font-size="20" font-weight="900" font-family="Arial">6+</text></svg>',
            bg: '#1a1500', type: 'top_movies_6'
        },

        // ── Сериалы ──
        {
            title: 'Топ Сериалы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g8" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1565C0"/><stop offset="100%" style="stop-color:#42A5F5"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g8)" opacity="0.2"/><rect x="4" y="10" width="40" height="26" rx="4" fill="url(#g8)"/><rect x="14" y="36" width="20" height="4" rx="2" fill="url(#g8)"/><rect x="8" y="40" width="32" height="2" rx="1" fill="#42A5F5"/><rect x="8" y="15" width="32" height="16" rx="2" fill="rgba(0,0,0,0.35)"/><polygon points="20,18 30,23 20,28" fill="white" opacity="0.9"/></svg>',
            bg: '#0a0a1a', type: 'tv'
        },
        {
            title: 'Новые Сериалы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g9" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1976D2"/><stop offset="100%" style="stop-color:#64B5F6"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g9)"/><path fill="white" d="M12 14h6l6 8 6-8h6v20h-6V22l-6 8-6-8v12h-6z"/></svg>',
            bg: '#0a0a1a', type: 'new_tv', badge: 'NEW'
        },
        {
            title: 'Сериалы 8+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g10" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0D47A1"/><stop offset="100%" style="stop-color:#1976D2"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g10)"/><text x="24" y="31" text-anchor="middle" fill="white" font-size="20" font-weight="900" font-family="Arial">8+</text></svg>',
            bg: '#070d1a', type: 'top_tv_8'
        },
        {
            title: 'Сериалы 7+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g11" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1565C0"/><stop offset="100%" style="stop-color:#42A5F5"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g11)"/><text x="24" y="31" text-anchor="middle" fill="white" font-size="20" font-weight="900" font-family="Arial">7+</text></svg>',
            bg: '#080e1a', type: 'top_tv_7'
        },
        {
            title: 'Сериалы 6+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g12" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1976D2"/><stop offset="100%" style="stop-color:#90CAF9"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#g12)"/><text x="24" y="31" text-anchor="middle" fill="white" font-size="20" font-weight="900" font-family="Arial">6+</text></svg>',
            bg: '#091220', type: 'top_tv_6'
        },

        // ── По жанрам ──
        {
            title: 'Боевики',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="ga1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#B71C1C"/><stop offset="100%" style="stop-color:#EF5350"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#ga1)"/><rect x="8" y="22" width="22" height="4" rx="2" fill="white"/><rect x="30" y="18" width="10" height="12" rx="2" fill="white" opacity="0.8"/><rect x="28" y="20" width="4" height="8" rx="1" fill="#B71C1C"/><circle cx="12" cy="24" r="3" fill="white" opacity="0.6"/></svg>',
            bg: '#1a0404', type: 'genre_action'
        },
        {
            title: 'Комедии',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="ga2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#F57F17"/><stop offset="100%" style="stop-color:#FFCA28"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#ga2)"/><circle fill="white" cx="16" cy="19" r="3"/><circle fill="white" cx="32" cy="19" r="3"/><path d="M14 29 Q24 38 34 29" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
            bg: '#1a1400', type: 'genre_comedy'
        },
        {
            title: 'Ужасы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="ga3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a1a"/><stop offset="100%" style="stop-color:#424242"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#ga3)"/><path fill="white" d="M24 8C15.2 8 8 15.2 8 24c0 5.2 2.4 9.9 6.2 12.9V40h19.6v-3.1C37.6 33.9 40 29.2 40 24 40 15.2 32.8 8 24 8z"/><path fill="#1a1a1a" d="M16 31h4v5h-4zm12 0h4v5h-4z"/><circle fill="#FF1744" cx="18" cy="22" r="2.5"/><circle fill="#FF1744" cx="30" cy="22" r="2.5"/></svg>',
            bg: '#0d0d0d', type: 'genre_horror'
        },
        {
            title: 'Фантастика',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="ga4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0D47A1"/><stop offset="100%" style="stop-color:#29B6F6"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#ga4)"/><ellipse cx="24" cy="24" rx="14" ry="5" stroke="white" stroke-width="2" fill="none" opacity="0.6"/><circle cx="24" cy="24" r="6" fill="white"/><circle cx="24" cy="24" r="3" fill="#0D47A1"/><circle cx="10" cy="14" r="2" fill="white" opacity="0.5"/><circle cx="36" cy="10" r="1.5" fill="white" opacity="0.7"/><circle cx="38" cy="32" r="1" fill="white" opacity="0.5"/></svg>',
            bg: '#020d1a', type: 'genre_scifi'
        },
        {
            title: 'Триллеры',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="ga5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#263238"/><stop offset="100%" style="stop-color:#607D8B"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#ga5)"/><circle cx="24" cy="24" r="14" stroke="white" stroke-width="2" fill="none" opacity="0.4"/><line x1="24" y1="10" x2="24" y2="24" stroke="white" stroke-width="3" stroke-linecap="round"/><line x1="24" y1="24" x2="32" y2="28" stroke="#EF5350" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="3" fill="white"/></svg>',
            bg: '#0d1214', type: 'genre_thriller'
        },
        {
            title: 'Мелодрамы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="ga6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#AD1457"/><stop offset="100%" style="stop-color:#F06292"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#ga6)"/><path fill="white" d="M24 36l-2.5-2.3C12.5 25.4 8 21.5 8 16.5 8 12.4 11.4 9 15.5 9c2.2 0 4.3 1 5.7 2.7L24 14l2.8-2.3C28.2 10 30.3 9 32.5 9 36.6 9 40 12.4 40 16.5c0 5-4.5 8.9-13.5 17.2z"/></svg>',
            bg: '#1a0412', type: 'genre_romance'
        },
        {
            title: 'Аниме',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="ga7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#E91E63"/><stop offset="100%" style="stop-color:#FF80AB"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#ga7)"/><circle fill="white" cx="17" cy="21" r="5"/><circle fill="white" cx="31" cy="21" r="5"/><circle fill="#E91E63" cx="17" cy="21" r="2.5"/><circle fill="#E91E63" cx="31" cy="21" r="2.5"/><circle fill="white" cx="16" cy="20" r="1.2"/><circle fill="white" cx="30" cy="20" r="1.2"/><path d="M16 30 Q24 37 32 30" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
            bg: '#1a0010', type: 'genre_anime'
        },
        {
            title: 'Документальные',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="ga8" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#00695C"/><stop offset="100%" style="stop-color:#26A69A"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#ga8)"/><rect fill="white" x="11" y="14" width="26" height="4" rx="2"/><rect fill="white" x="11" y="22" width="26" height="4" rx="2"/><rect fill="white" x="11" y="30" width="18" height="4" rx="2"/></svg>',
            bg: '#001a17', type: 'genre_documentary'
        },

        // ── Русский контент ──
        {
            title: 'Русские Фильмы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><rect width="48" height="10.7" fill="#FFFFFF"/><rect y="10.7" width="48" height="10.7" fill="#0039A6"/><rect y="21.3" width="48" height="10.7" fill="#D52B1E"/></svg>',
            bg: '#1a0808', type: 'ru_movies'
        },
        {
            title: 'Русские Сериалы',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><rect width="48" height="10.7" fill="#FFFFFF"/><rect y="10.7" width="48" height="10.7" fill="#0039A6"/><rect y="21.3" width="48" height="10.7" fill="#D52B1E"/></svg>',
            bg: '#08081a', type: 'ru_tv'
        },

        // ── Свежее за 3 месяца ──
        {
            title: 'Топ за 3 мес.',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="gb1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#E64A19"/><stop offset="100%" style="stop-color:#FF7043"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#gb1)"/><circle cx="24" cy="24" r="14" stroke="white" stroke-width="2" fill="none" opacity="0.4"/><line x1="24" y1="12" x2="24" y2="24" stroke="white" stroke-width="3" stroke-linecap="round"/><line x1="24" y1="24" x2="30" y2="18" stroke="white" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="2.5" fill="white"/></svg>',
            bg: '#1a0f00', type: 'recent_top'
        },
        {
            title: 'Новинки 6+',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="gb2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#00838F"/><stop offset="100%" style="stop-color:#00E5FF"/></linearGradient></defs><circle cx="24" cy="24" r="22" fill="url(#gb2)"/><path fill="white" d="M24 10 L30 22 L42 24 L33 33 L35 45 L24 39 L13 45 L15 33 L6 24 L18 22z" opacity="0.25"/><text x="24" y="30" text-anchor="middle" fill="white" font-size="16" font-weight="900" font-family="Arial">6+</text></svg>',
            bg: '#001a1f', type: 'recent_6plus', badge: 'NEW'
        },

        // ── Мировые хиты ──
        {
            title: 'Голливуд',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><rect width="16" height="32" fill="#B22234"/><rect x="16" width="16" height="32" fill="#FFFFFF"/><rect x="32" width="16" height="32" fill="#3C3B6E"/><rect y="5" width="48" height="4" fill="white" opacity="0.5"/><rect y="14" width="48" height="4" fill="white" opacity="0.5"/><rect y="23" width="48" height="4" fill="white" opacity="0.5"/></svg>',
            bg: '#0a0a1f', type: 'us_movies'
        },
        {
            title: 'Корейские',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32"><rect width="48" height="32" fill="white"/><circle cx="24" cy="16" r="7" fill="#CD2E3A"/><circle cx="24" cy="16" r="3.5" fill="#003478"/></svg>',
            bg: '#1a0006', type: 'kr_content'
        }
    ];

    // ─── Кэш ─────────────────────────────────────────────────────────────────────
    var cache = {};

    // ─── Утилиты ─────────────────────────────────────────────────────────────────
    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function sortByDate(items) {
        return items.sort(function (a, b) {
            var dA = a.release_date || a.first_air_date || '';
            var dB = b.release_date || b.first_air_date || '';
            if (!dA) return 1; if (!dB) return -1;
            return dB.localeCompare(dA);
        });
    }

    function sortByVoteCount(items) {
        return items.sort(function (a, b) {
            var vA = a.vote_count || 0, vB = b.vote_count || 0;
            return vA === vB ? (b.vote_average || 0) - (a.vote_average || 0) : vB - vA;
        });
    }

    function sortByRating(items) {
        return items.sort(function (a, b) {
            var scoreA = (a.vote_average || 0) * Math.log(Math.max(a.vote_count || 1, 1));
            var scoreB = (b.vote_average || 0) * Math.log(Math.max(b.vote_count || 1, 1));
            return scoreB - scoreA;
        });
    }

    function dedupe(items) {
        var seen = {};
        return items.filter(function (item) {
            var key = (item.media_type || 'x') + '_' + item.id;
            if (seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    function filterByMinVotes(items, minVotes) {
        return items.filter(function (i) { return (i.vote_count || 0) >= minVotes; });
    }

    function filterByRating(items, minRating, maxRating) {
        return items.filter(function (i) {
            var r = i.vote_average || 0;
            return r >= minRating && r <= (maxRating || 10);
        });
    }

    function filterRecent(items, yearsBack) {
        var d = new Date();
        d.setFullYear(d.getFullYear() - (yearsBack || YEARS_BACK));
        var minDate = d.toISOString().split('T')[0];
        return items.filter(function (i) {
            var date = i.release_date || i.first_air_date || '';
            return date && date >= minDate;
        });
    }

    function getDateBack(months) {
        var d = new Date();
        d.setMonth(d.getMonth() - months);
        return d.toISOString().split('T')[0];
    }

    function filterDateFrom(items, fromDate) {
        return items.filter(function (i) {
            var date = i.release_date || i.first_air_date || '';
            return date && date >= fromDate;
        });
    }

    // ─── Сеть ────────────────────────────────────────────────────────────────────
    function loadPages(network, baseUrl, mediaType, pages, callback) {
        var all = [], done = 0;

        function onDone() {
            done++;
            if (done === pages) callback(all);
        }

        for (var p = 1; p <= pages; p++) {
            (function (page) {
                network.silent(baseUrl + '&page=' + page, function (data) {
                    if (data && data.results) {
                        data.results.forEach(function (item) {
                            item.media_type = mediaType;
                            if (item.vote_average && item.vote_count) {
                                var ri = '⭐ ' + item.vote_average.toFixed(1) +
                                         ' • 👥 ' + item.vote_count.toLocaleString('ru-RU') + ' оценок';
                                item.overview = item.overview ? ri + '\n\n' + item.overview : ri;
                            }
                        });
                        all = all.concat(data.results);
                    }
                    onDone();
                }, onDone);
            })(p);
        }
    }

    // ─── Конфигурация запросов по типу ──────────────────────────────────────────
    function getRequestConfig(type, apiKey, lang) {
        var today   = new Date().toISOString().split('T')[0];
        var date3m  = getDateBack(3);

        var base = API_BASE;
        var Q = '?api_key=' + apiKey + '&language=' + lang;

        var discoverMovie = base + '/discover/movie' + Q;
        var discoverTv    = base + '/discover/tv'    + Q;
        var popularMovie  = base + '/movie/popular'  + Q;
        var popularTv     = base + '/tv/popular'     + Q;
        var topRatedMovie = base + '/movie/top_rated'+ Q;
        var topRatedTv    = base + '/tv/top_rated'   + Q;

        var configs = {
            'all': [
                { url: popularMovie, mt: 'movie' },
                { url: popularTv,    mt: 'tv' }
            ],
            'random': [
                { url: popularMovie, mt: 'movie' },
                { url: popularTv,    mt: 'tv' }
            ],
            'movies':       [{ url: popularMovie,  mt: 'movie' }],
            'new_movies':   [{ url: topRatedMovie, mt: 'movie' }],
            'top_movies_8': [{
                url: discoverMovie + '&sort_by=vote_average.desc&vote_count.gte=5000&vote_average.gte=8',
                mt: 'movie'
            }],
            'top_movies_7': [{
                url: discoverMovie + '&sort_by=vote_average.desc&vote_count.gte=2000&vote_average.gte=7&vote_average.lte=7.99',
                mt: 'movie'
            }],
            'top_movies_6': [{
                url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&vote_average.gte=6&vote_average.lte=6.99',
                mt: 'movie'
            }],
            'tv':      [{ url: popularTv,  mt: 'tv' }],
            'new_tv':  [{ url: topRatedTv, mt: 'tv' }],
            'top_tv_8': [{
                url: discoverTv + '&sort_by=vote_average.desc&vote_count.gte=3000&vote_average.gte=8',
                mt: 'tv'
            }],
            'top_tv_7': [{
                url: discoverTv + '&sort_by=vote_average.desc&vote_count.gte=1000&vote_average.gte=7&vote_average.lte=7.99',
                mt: 'tv'
            }],
            'top_tv_6': [{
                url: discoverTv + '&sort_by=vote_count.desc&vote_count.gte=500&vote_average.gte=6&vote_average.lte=6.99',
                mt: 'tv'
            }],
            'genre_action': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&with_genres=28', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=10759', mt: 'tv' }
            ],
            'genre_comedy': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&with_genres=35', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=35',  mt: 'tv' }
            ],
            'genre_horror': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=27',  mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=200&with_genres=9648', mt: 'tv' }
            ],
            'genre_scifi': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&with_genres=878', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=10765', mt: 'tv' }
            ],
            'genre_thriller': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=1000&with_genres=53', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=300&with_genres=80',  mt: 'tv' }
            ],
            'genre_romance': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=10749', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=200&with_genres=10749', mt: 'tv' }
            ],
            'genre_anime': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=500&with_genres=16&with_origin_country=JP', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=300&with_genres=16&with_origin_country=JP', mt: 'tv' }
            ],
            'genre_documentary': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=300&with_genres=99', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=200&with_genres=99', mt: 'tv' }
            ],
            'ru_movies': [{
                url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=100&with_original_language=ru',
                mt: 'movie'
            }],
            'ru_tv': [{
                url: discoverTv + '&sort_by=vote_count.desc&vote_count.gte=50&with_original_language=ru',
                mt: 'tv'
            }],
            'recent_top': [
                {
                    url: discoverMovie + '&sort_by=vote_average.desc&vote_count.gte=100' +
                         '&vote_average.gte=6&primary_release_date.gte=' + date3m + '&primary_release_date.lte=' + today,
                    mt: 'movie', dateFrom: date3m
                },
                {
                    url: discoverTv + '&sort_by=vote_average.desc&vote_count.gte=100' +
                         '&vote_average.gte=6&first_air_date.gte=' + date3m + '&first_air_date.lte=' + today,
                    mt: 'tv', dateFrom: date3m
                }
            ],
            'recent_6plus': [
                {
                    url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=50' +
                         '&vote_average.gte=6&primary_release_date.gte=' + date3m,
                    mt: 'movie', dateFrom: date3m
                },
                {
                    url: discoverTv + '&sort_by=vote_count.desc&vote_count.gte=50' +
                         '&vote_average.gte=6&first_air_date.gte=' + date3m,
                    mt: 'tv', dateFrom: date3m
                }
            ],
            'us_movies': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=2000&with_origin_country=US', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=1000&with_origin_country=US', mt: 'tv' }
            ],
            'kr_content': [
                { url: discoverMovie + '&sort_by=vote_count.desc&vote_count.gte=200&with_origin_country=KR', mt: 'movie' },
                { url: discoverTv    + '&sort_by=vote_count.desc&vote_count.gte=200&with_origin_country=KR', mt: 'tv' }
            ]
        };

        return configs[type] || configs['all'];
    }

    // ─── Постобработка результатов ───────────────────────────────────────────────
    function postProcess(type, results) {
        results = dedupe(results);

        var date3m = getDateBack(3);

        switch (type) {
            case 'all':
                results = filterByMinVotes(results, 1000);
                results = sortByVoteCount(results);
                break;
            case 'random':
                results = filterByMinVotes(results, 500);
                results = shuffleArray(results);
                break;
            case 'movies':
                results = filterByMinVotes(results, 1000);
                results = sortByVoteCount(results);
                break;
            case 'new_movies':
                results = filterByMinVotes(results, 500);
                results = filterRecent(results, YEARS_BACK);
                results = sortByDate(results);
                break;
            case 'top_movies_8':
                results = filterByMinVotes(results, 1000);
                results = filterByRating(results, 8, 10);
                results = sortByRating(results);
                break;
            case 'top_movies_7':
                results = filterByMinVotes(results, 500);
                results = filterByRating(results, 7, 7.99);
                results = sortByRating(results);
                break;
            case 'top_movies_6':
                results = filterByMinVotes(results, 300);
                results = filterByRating(results, 6, 6.99);
                results = sortByRating(results);
                break;
            case 'tv':
                results = filterByMinVotes(results, 500);
                results = sortByVoteCount(results);
                break;
            case 'new_tv':
                results = filterByMinVotes(results, 200);
                results = filterRecent(results, YEARS_BACK);
                results = sortByDate(results);
                break;
            case 'top_tv_8':
                results = filterByMinVotes(results, 500);
                results = filterByRating(results, 8, 10);
                results = sortByRating(results);
                break;
            case 'top_tv_7':
                results = filterByMinVotes(results, 300);
                results = filterByRating(results, 7, 7.99);
                results = sortByRating(results);
                break;
            case 'top_tv_6':
                results = filterByMinVotes(results, 200);
                results = filterByRating(results, 6, 6.99);
                results = sortByRating(results);
                break;
            case 'recent_top':
            case 'recent_6plus':
                results = filterByMinVotes(results, 50);
                results = filterByRating(results, 6, 10);
                results = filterDateFrom(results, date3m);
                results = sortByRating(results);
                break;
            case 'ru_movies':
            case 'ru_tv':
                results = sortByVoteCount(results);
                break;
            case 'us_movies':
            case 'kr_content':
                results = filterByMinVotes(results, 200);
                results = sortByVoteCount(results);
                break;
            default:
                results = filterByMinVotes(results, 200);
                results = sortByVoteCount(results);
                break;
        }

        return results;
    }

    // ─── API ─────────────────────────────────────────────────────────────────────
    var API = {
        full: function (params, success, error) {
            var type = params.type;

            if (cache[type]) {
                success(type === 'random'
                    ? { results: shuffleArray(cache[type].results), title: params.title }
                    : cache[type]
                );
                return;
            }

            var network = new Lampa.Reguest();
            var apiKey  = Lampa.TMDB.key();
            var lang    = Lampa.Storage.get('tmdb_lang', 'ru');

            var requestConfigs = getRequestConfig(type, apiKey, lang);
            var allResults = [];
            var done = 0;
            var total = requestConfigs.length;

            requestConfigs.forEach(function (cfg) {
                loadPages(network, cfg.url, cfg.mt, PAGES_TO_LOAD, function (results) {
                    allResults = allResults.concat(results);
                    done++;
                    if (done === total) {
                        var processed = postProcess(type, allResults);
                        cache[type] = { results: processed, title: params.title };
                        success({ results: processed, title: params.title });
                    }
                });
            });
        },

        clear: function () { cache = {}; }
    };

    // ─── Стили ───────────────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('top-ratings-styles')) return;
        var s = document.createElement('style');
        s.id  = 'top-ratings-styles';

        // Определяем размеры в зависимости от размера экрана
        var cols       = IS_TV ? 4 : 3;
        var gap        = IS_TV ? '18px' : '10px';
        var padding    = IS_TV ? '24px' : '12px';
        var minHeight  = IS_TV ? '150px' : '88px';
        var iconSize   = IS_TV ? '64px' : '44px';
        var fontSize   = IS_TV ? '15px' : '10.5px';
        var secFont    = IS_TV ? '13px' : '11px';
        var badgeFont  = IS_TV ? '10px' : '8px';
        var cardRadius = IS_TV ? '16px' : '10px';
        var secPad     = IS_TV ? '10px 4px 4px' : '4px 2px 2px';

        s.textContent = [
            '.top-ratings-grid{',
            '  display:grid;',
            '  grid-template-columns:repeat(' + cols + ',1fr);',
            '  gap:' + gap + ';',
            '  padding:' + padding + ';',
            '  box-sizing:border-box;',
            '}',
            '.top-ratings-section-title{',
            '  grid-column:1/-1;',
            '  font-size:' + secFont + ';',
            '  color:#aaa;',
            '  text-transform:uppercase;',
            '  letter-spacing:1.5px;',
            '  padding:' + secPad + ';',
            '  margin-top:8px;',
            '  font-weight:600;',
            '  border-left:3px solid #e50914;',
            '  padding-left:10px;',
            '}',
            '.top-ratings-card{',
            '  background:linear-gradient(135deg,#1e1e2e 0%,#252535 100%);',
            '  border-radius:' + cardRadius + ';',
            '  display:flex;',
            '  flex-direction:column;',
            '  align-items:center;',
            '  justify-content:center;',
            '  padding:' + (IS_TV ? '20px 14px' : '12px 8px') + ';',
            '  cursor:pointer;',
            '  transition:background .2s,transform .15s,box-shadow .2s;',
            '  min-height:' + minHeight + ';',
            '  gap:' + (IS_TV ? '12px' : '7px') + ';',
            '  position:relative;',
            '  border:2px solid transparent;',
            '  outline:none;',
            '}',
            '.top-ratings-card.focus,.top-ratings-card:hover{',
            '  background:linear-gradient(135deg,#2a2a3e 0%,#353550 100%);',
            '  transform:scale(' + (IS_TV ? '1.06' : '1.05') + ');',
            '  box-shadow:0 0 0 3px #e50914, 0 8px 32px rgba(229,9,20,0.35);',
            '  border-color:#e50914;',
            '  z-index:10;',
            '}',
            '.top-ratings-card .tr-icon{',
            '  width:' + iconSize + ';',
            '  height:' + iconSize + ';',
            '  display:flex;',
            '  align-items:center;',
            '  justify-content:center;',
            '  flex-shrink:0;',
            '  filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5));',
            '}',
            '.top-ratings-card .tr-icon svg{',
            '  width:' + iconSize + ';',
            '  height:auto;',
            '}',
            '.top-ratings-card .tr-title{',
            '  font-size:' + fontSize + ';',
            '  color:#e0e0e0;',
            '  text-align:center;',
            '  line-height:1.35;',
            '  font-weight:600;',
            '  letter-spacing:0.3px;',
            '}',
            '.top-ratings-card.focus .tr-title,.top-ratings-card:hover .tr-title{',
            '  color:#ffffff;',
            '}',
            '.top-ratings-badge{',
            '  position:absolute;',
            '  top:' + (IS_TV ? '8px' : '5px') + ';',
            '  right:' + (IS_TV ? '8px' : '5px') + ';',
            '  font-size:' + badgeFont + ';',
            '  font-weight:800;',
            '  padding:' + (IS_TV ? '2px 7px' : '1px 4px') + ';',
            '  border-radius:5px;',
            '  line-height:1.5;',
            '  background:#e50914;',
            '  color:white;',
            '  letter-spacing:0.5px;',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    }

    // ─── Главный компонент с навигацией пультом ───────────────────────────────────
    function createMainComponent(params) {
        var self = this;
        var scroll = new Lampa.Scroll({ mask: true, over: true });

        var sections = [
            { title: 'Общий топ',       types: ['all', 'random'] },
            { title: 'Фильмы',          types: ['movies', 'new_movies', 'top_movies_8', 'top_movies_7', 'top_movies_6'] },
            { title: 'Сериалы',         types: ['tv', 'new_tv', 'top_tv_8', 'top_tv_7', 'top_tv_6'] },
            { title: 'По жанрам',       types: ['genre_action', 'genre_comedy', 'genre_horror', 'genre_scifi', 'genre_thriller', 'genre_romance', 'genre_anime', 'genre_documentary'] },
            { title: 'Российское кино', types: ['ru_movies', 'ru_tv'] },
            { title: 'Свежее',          types: ['recent_top', 'recent_6plus'] },
            { title: 'По странам',      types: ['us_movies', 'kr_content'] }
        ];

        var catMap = {};
        CATEGORIES.forEach(function (c) { catMap[c.type] = c; });

        var grid = $('<div class="top-ratings-grid"></div>');

        // Список всех карточек для навигации пультом
        var allCards = [];
        var COLS = IS_TV ? 4 : 3;
        var focusIdx = 0;

        sections.forEach(function (sec) {
            var titleEl = $('<div class="top-ratings-section-title">' + sec.title + '</div>');
            grid.append(titleEl);

            sec.types.forEach(function (type) {
                var cat = catMap[type];
                if (!cat) return;

                var badgeHtml = cat.badge
                    ? '<span class="top-ratings-badge">' + cat.badge + '</span>'
                    : '';

                var card = $(
                    '<div class="top-ratings-card selector" tabindex="0" data-type="' + cat.type + '">' +
                    '<div class="tr-icon">' + cat.icon + '</div>' +
                    '<div class="tr-title">' + cat.title + '</div>' +
                    badgeHtml +
                    '</div>'
                );

                card.on('hover:enter click', function () {
                    Lampa.Activity.push({
                        url: '', title: cat.title,
                        component: 'top_ratings_full',
                        type: cat.type, page: 1
                    });
                });

                allCards.push(card);
                grid.append(card);
            });
        });

        // ── Функция фокуса ──
        function setFocus(idx) {
            if (idx < 0 || idx >= allCards.length) return;
            allCards[focusIdx].removeClass('focus');
            focusIdx = idx;
            var el = allCards[focusIdx];
            el.addClass('focus');
            // Скроллим к карточке
            try {
                el[0].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } catch(e) {}
        }

        // ── Контроллер пульта ──
        var controllerName = 'top_ratings_grid';

        Lampa.Controller.add(controllerName, {
            toggle: function () {
                Lampa.Controller.colldown(this);
                setFocus(focusIdx);
            },
            left: function () {
                var next = focusIdx - 1;
                if (next >= 0) setFocus(next);
            },
            right: function () {
                var next = focusIdx + 1;
                if (next < allCards.length) setFocus(next);
            },
            up: function () {
                var next = focusIdx - COLS;
                if (next >= 0) {
                    setFocus(next);
                } else {
                    // Выход наверх — к меню Lampa
                    Lampa.Controller.toggle('menu');
                }
            },
            down: function () {
                var next = focusIdx + COLS;
                if (next < allCards.length) setFocus(next);
            },
            enter: function () {
                allCards[focusIdx].trigger('hover:enter');
            },
            back: function () {
                Lampa.Activity.backward();
            }
        });

        scroll.body().append(grid);

        this.create = function () {
            this.activity.loader(false);
            return scroll.render();
        };

        this.start = function () {
            Lampa.Controller.toggle(controllerName);
        };

        this.pause  = function () {};
        this.stop   = function () { Lampa.Controller.remove(controllerName); };
        this.render = function () { return scroll.render(); };
        this.destroy = function () {
            Lampa.Controller.remove(controllerName);
            scroll.destroy();
        };
    }

    // ─── Компонент списка ─────────────────────────────────────────────────────────
    function createFullComponent(params) {
        var component = Lampa.Maker.make('Category', params);

        component.use({
            onCreate: function () {
                var self = this;
                this.activity.loader(true);
                API.full(params, function (data) {
                    self.build(data);
                    self.activity.loader(false);
                }, function () {
                    self.empty();
                    self.activity.loader(false);
                });
            },
            onUpdate: function (p) {
                var self = this;
                this.activity.loader(true);
                API.full(p, function (data) {
                    self.build(data);
                    self.activity.loader(false);
                }, function () {
                    self.empty();
                    self.activity.loader(false);
                });
            },
            onInstance: function (card, data) {
                card.use({
                    onEnter: function (item, elem) {
                        Lampa.Activity.push({
                            url: '', component: 'full',
                            id: elem.id, method: elem.media_type, card: elem
                        });
                    }
                });
            }
        });

        return component;
    }

    // ─── Запуск ───────────────────────────────────────────────────────────────────
    function startPlugin() {
        injectStyles();

        Lampa.Component.add('top_ratings',      createMainComponent);
        Lampa.Component.add('top_ratings_full', createFullComponent);

        var menuItem = $(
            '<li class="menu__item selector">' +
            '<div class="menu__ico">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">' +
            '<defs><linearGradient id="menuG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#FFD700"/><stop offset="100%" style="stop-color:#FF8C00"/></linearGradient></defs>' +
            '<path fill="url(#menuG)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
            '</svg></div>' +
            '<div class="menu__text">Топ TMDB</div></li>'
        );

        menuItem.on('hover:enter', function () {
            Lampa.Activity.push({ url: '', title: 'Топ TMDB', component: 'top_ratings', page: 1 });
        });

        $('.menu .menu__list').eq(0).append(menuItem);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();