(function () {
    'use strict';

    var PLUGIN_NAME = 'lampa_rating';
    var API_BASE = 'https://cub.red/api/reactions';
    var VOTE_COOLDOWN = 24 * 60 * 60 * 1000;
    var VOTE_STORAGE_KEY = 'lampa_rating_votes';
    var prevController = 'full';

    // -------------------------------------------------------
    // FIX #8: Инъекция CSS стилей при запуске
    // -------------------------------------------------------
    function injectStyles() {
        if (document.getElementById('lampa-rating-css')) return;
        var style = document.createElement('style');
        style.id = 'lampa-rating-css';
        style.textContent = [
            '.lampa-vote-overlay{position:fixed;top:0;left:0;width:100%;height:100%;',
            'background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:center;justify-content:center;}',
            '.lampa-vote-dialog{background:#1a1a2e;border:1px solid #2a2a4a;border-radius:16px;',
            'padding:24px;width:520px;max-width:90vw;box-shadow:0 8px 40px rgba(0,0,0,.7);}',
            '.lampa-vote-title{font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;}',
            '.lampa-vote-header{display:flex;gap:16px;align-items:flex-start;margin-bottom:20px;}',
            '.lampa-vote-poster{width:60px;height:88px;object-fit:cover;border-radius:8px;flex-shrink:0;}',
            '.lampa-vote-poster-ph{width:60px;height:88px;background:#2a2a4a;border-radius:8px;flex-shrink:0;}',
            '.lampa-vote-info{flex:1;min-width:0;}',
            '.lampa-vote-year{font-size:11px;color:#666;margin-bottom:4px;}',
            '.lampa-vote-name{font-size:16px;font-weight:700;color:#fff;line-height:1.3;margin-bottom:12px;}',
            '.lampa-vote-current{display:flex;align-items:center;gap:8px;font-size:13px;color:#aaa;}',
            '.lampa-vote-current .lv-icon{color:#f5c518;}',
            '.lampa-vote-current .lv-score{font-size:18px;font-weight:700;color:#fff;}',
            '.lampa-vote-sep{color:#444;}',
            '.lampa-vote-current .lv-count{color:#888;}',
            '.lampa-stars{display:flex;gap:6px;margin:4px 0 16px;flex-wrap:wrap;}',
            '.lampa-star-item{display:flex;flex-direction:column;align-items:center;gap:3px;',
            'cursor:pointer;border-radius:10px;padding:8px 10px;border:1px solid transparent;',
            'transition:all .15s ease;min-width:42px;}',
            '.lampa-star-item:focus{outline:none;}',
            '.lampa-star-item.focused,.lampa-star-item:focus{',
            'background:rgba(245,197,24,.18)!important;border-color:rgba(245,197,24,.4)!important;}',
            '.lampa-star-icon{font-size:22px;color:#555;transition:color .15s;}',
            '.lampa-star-num{font-size:10px;color:#555;font-weight:600;}',
            '.lampa-vote-hint{font-size:11px;color:#666;text-align:center;margin-top:4px;}',
            '.rate--lampa-custom{display:inline-flex;flex-direction:column;align-items:center;',
            'margin-left:10px;vertical-align:middle;}',
            '.rate--lampa-score{font-size:14px;font-weight:700;color:#f5c518;line-height:1;}',
            '.rate--lampa-label{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.5px;}',
        ].join('');
        document.head.appendChild(style);
    }

    // -------------------------------------------------------
    // Утилиты
    // -------------------------------------------------------
    function getStoredVotes() {
        try {
            var raw = Lampa.Storage.get(VOTE_STORAGE_KEY, '{}');
            return JSON.parse(raw);
        } catch (e) { return {}; }
    }

    function saveVote(cardId, rating) {
        var votes = getStoredVotes();
        votes[cardId] = { rating: rating, time: Date.now() };
        Lampa.Storage.set(VOTE_STORAGE_KEY, JSON.stringify(votes));
    }

    function getMyVote(cardId) {
        var votes = getStoredVotes();
        return votes[cardId] || null;
    }

    function canVote(cardId) {
        var vote = getMyVote(cardId);
        if (!vote) return true;
        return (Date.now() - vote.time) > VOTE_COOLDOWN;
    }

    function getCardKey(card) {
        var isTV = false;
        if (card.media_type === 'tv') isTV = true;
        else if (card.media_type === 'movie') isTV = false;
        else if (card.number_of_seasons !== undefined) isTV = true;
        else if (card.first_air_date) isTV = true;
        else if (card.name && !card.title) isTV = true;
        return (isTV ? 'tv' : 'movie') + '_' + card.id;
    }

    function settingEnabled() {
        var val = Lampa.Storage.get('lampa_rating_show', 'true');
        return val !== 'false' && val !== false;
    }

    // -------------------------------------------------------
    // API
    // -------------------------------------------------------
    function fetchRating(card, callback) {
        var key = getCardKey(card);
        var url = API_BASE + '/get/' + key;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 5000;
        xhr.onload = function () {
            try {
                var data = JSON.parse(this.responseText);
                var result = data.result || [];
                var positive = 0, negative = 0, totalVotes = 0;
                result.forEach(function (item) {
                    var cnt = parseInt(item.counter) || 0;
                    totalVotes += cnt;
                    if (item.type === 'fire' || item.type === 'nice') positive += cnt;
                    if (item.type === 'shit' || item.type === 'bore' || item.type === 'think') negative += cnt;
                });
                var score = 0;
                if (positive + negative > 0) score = (positive / (positive + negative)) * 10;
                callback(null, { score: parseFloat(score.toFixed(1)), votes: totalVotes, result: result });
            } catch (e) { callback(e, null); }
        };
        xhr.onerror = function () { callback(new Error('Network error'), null); };
        xhr.ontimeout = function () { callback(new Error('Timeout'), null); };
        xhr.send();
    }

    function ratingToReactionType(rating) {
        if (rating >= 9) return 'fire';
        if (rating >= 7) return 'nice';
        if (rating >= 5) return 'think';
        if (rating >= 3) return 'bore';
        return 'shit';
    }

    function submitVote(card, rating, callback) {
        var key = getCardKey(card);
        var reactionType = ratingToReactionType(rating);
        var url = API_BASE + '/set/' + key + '?type=' + reactionType;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 5000;
        xhr.onload = function () { saveVote(key, rating); if (callback) callback(null); };
        xhr.onerror = function () { if (callback) callback(new Error('Network error')); };
        xhr.ontimeout = function () { if (callback) callback(new Error('Timeout')); };
        xhr.send();
    }

    // -------------------------------------------------------
    // FIX #2: Рейтинг в карточке — правильный HTML
    // -------------------------------------------------------
    function injectRatingIntoCard(render, card) {
        if (!settingEnabled()) return;
        render.find('.rate--lampa-custom').remove();
        fetchRating(card, function (err, data) {
            if (err || !data) return;
            var rateBlock = render.find('.full-start__rate');
            if (!rateBlock.length) rateBlock = render.find('.full-start-new__rate');
            if (!rateBlock.length) return;
            rateBlock.find('.rate--lampa-custom').remove();
            // FIX #2: реальный HTML (не пустые строки)
            var html =
                '<div class="rate--lampa-custom">' +
                '<span class="rate--lampa-score">' + data.score + '</span>' +
                '<span class="rate--lampa-label">LAMPA</span>' +
                '</div>';
            rateBlock.append(html);
        });
    }

    // -------------------------------------------------------
    // FIX #3 + #7: Модальное окно с корректным HTML и TV-навигацией
    // -------------------------------------------------------
    function showVoteModal(card) {
        var cardKey = getCardKey(card);
        var existingModal = document.getElementById('lampa-vote-modal');
        if (existingModal) existingModal.remove();

        var myVote = getMyVote(cardKey);
        var canVoteNow = canVote(cardKey);
        var currentRating = myVote ? myVote.rating : 0;

        var titleText = card.name || card.title || card.original_name || card.original_title || '';
        var year = (card.first_air_date || card.release_date || '').slice(0, 4);
        var poster = (card.poster_path ? 'https://image.tmdb.org/t/p/w185' + card.poster_path : '') || (card.img || '');

        var cooldownMsg = '';
        if (!canVoteNow && myVote) {
            var remaining = VOTE_COOLDOWN - (Date.now() - myVote.time);
            var hours = Math.floor(remaining / 3600000);
            var mins = Math.floor((remaining % 3600000) / 60000);
            cooldownMsg = 'Следующая оценка через ' + hours + 'ч ' + mins + 'мин';
        }

        // FIX #7: класс selector для TV-навигации
        var starsHtml = '';
        for (var i = 1; i <= 10; i++) {
            var isSelected = currentRating >= i;
            starsHtml +=
                '<div class="lampa-star-item selector" data-rating="' + i + '" tabindex="0">' +
                '<span class="lampa-star-icon" style="color:' + (isSelected ? '#f5c518' : '#555') + '">' +
                (isSelected ? '★' : '☆') +
                '</span>' +
                '<span class="lampa-star-num">' + i + '</span>' +
                '</div>';
        }

        var posterHtml = poster
            ? '<img class="lampa-vote-poster" src="' + poster + '" alt="" />'
            : '<div class="lampa-vote-poster-ph"></div>';

        // FIX #3: полностью корректный HTML для модального окна
        var modalHtml =
            '<div id="lampa-vote-modal" class="lampa-vote-overlay">' +
            '<div class="lampa-vote-dialog">' +
            '<div class="lampa-vote-title">Поставьте оценку</div>' +
            '<div class="lampa-vote-header">' +
            posterHtml +
            '<div class="lampa-vote-info">' +
            '<div class="lampa-vote-year">' + year + '</div>' +
            '<div class="lampa-vote-name">' + titleText + '</div>' +
            '<div class="lampa-vote-current">' +
            '<span class="lv-icon">★</span>' +
            '<span class="lv-score" id="lampa-modal-score">—</span>' +
            '<span class="lv-sep">|</span>' +
            '<span>👥</span>' +
            '<span class="lv-count" id="lampa-modal-count">—</span>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="lampa-stars">' + starsHtml + '</div>' +
            '<div class="lampa-vote-hint">' +
            (canVoteNow ? 'Можно оценить раз в 24 часа' : cooldownMsg) +
            '</div>' +
            '</div>' +
            '</div>';

        var wrapper = document.createElement('div');
        wrapper.innerHTML = modalHtml;
        document.body.appendChild(wrapper.firstChild);

        var modal = document.getElementById('lampa-vote-modal');
        var starItems = Array.prototype.slice.call(modal.querySelectorAll('.lampa-star-item'));
        var focusedIndex = currentRating > 0 ? currentRating - 1 : 0;

        function highlightStars(upTo) {
            starItems.forEach(function (el, idx) {
                var icon = el.querySelector('.lampa-star-icon');
                if (idx < upTo) {
                    icon.style.color = '#f5c518';
                    icon.textContent = '★';
                } else {
                    icon.style.color = '#555';
                    icon.textContent = '☆';
                }
            });
        }

        function focusStar(idx) {
            starItems.forEach(function (el) {
                el.classList.remove('focused');
            });
            if (starItems[idx]) {
                starItems[idx].classList.add('focused');
                focusedIndex = idx;
                highlightStars(idx + 1);
            }
        }

        if (currentRating > 0) {
            highlightStars(currentRating);
            focusedIndex = currentRating - 1;
        }

        if (canVoteNow) {
            starItems.forEach(function (el) {
                var rating = parseInt(el.getAttribute('data-rating'));

                el.addEventListener('mouseenter', function () {
                    highlightStars(rating);
                    starItems.forEach(function (s) { s.classList.remove('focused'); });
                    el.classList.add('focused');
                    focusedIndex = rating - 1;
                });

                el.addEventListener('mouseleave', function () {
                    if (currentRating > 0) highlightStars(currentRating);
                    else highlightStars(0);
                    el.classList.remove('focused');
                });

                el.addEventListener('click', function () {
                    currentRating = rating;
                    highlightStars(rating);
                    doVote(rating);
                });

                el.addEventListener('hover:enter', function () {
                    if (!canVoteNow) return;
                    currentRating = rating;
                    highlightStars(rating);
                    doVote(rating);
                });

                el.addEventListener('hover:focus', function () {
                    focusStar(rating - 1);
                });
            });
        }

        function doVote(rating) {
            submitVote(card, rating, function (err) {
                if (err) {
                    Lampa.Noty.show('Ошибка при отправке оценки');
                } else {
                    Lampa.Noty.show('Оценка ' + rating + '/10 принята!');
                    fetchRating(card, function (e2, data) {
                        if (!e2 && data) {
                            var sc = document.getElementById('lampa-modal-score');
                            var ct = document.getElementById('lampa-modal-count');
                            if (sc) sc.textContent = data.score;
                            if (ct) ct.textContent = data.votes;
                        }
                    });
                }
            });
        }

        function closeModal() {
            if (modal && modal.parentNode) modal.remove();
            // FIX #6: восстановить контроллер надёжно
            try {
                Lampa.Controller.toggle(prevController || 'full');
            } catch (e) {
                try { Lampa.Controller.toggle('content'); } catch (e2) {}
            }
        }

        // FIX #6: надёжно сохранить текущий контроллер
        try {
            var enabled = Lampa.Controller.enabled();
            prevController = (enabled && enabled.name) ? enabled.name : 'full';
        } catch (e) {
            prevController = 'full';
        }

        Lampa.Controller.add('lampa_rating_modal', {
            toggle: function () {
                Lampa.Controller.own(this);
                focusStar(focusedIndex);
            },
            left: function () {
                if (focusedIndex > 0) focusStar(focusedIndex - 1);
            },
            right: function () {
                if (focusedIndex < starItems.length - 1) focusStar(focusedIndex + 1);
            },
            up: function () {
                focusStar(starItems.length - 1);
            },
            down: function () {
                focusStar(0);
            },
            enter: function () {
                if (!canVoteNow) { closeModal(); return; }
                var rating = focusedIndex + 1;
                currentRating = rating;
                highlightStars(rating);
                doVote(rating);
                setTimeout(closeModal, 900);
            },
            back: function () {
                closeModal();
            }
        });

        Lampa.Controller.toggle('lampa_rating_modal');

        fetchRating(card, function (err, data) {
            if (!err && data) {
                var sc = document.getElementById('lampa-modal-score');
                var ct = document.getElementById('lampa-modal-count');
                if (sc) sc.textContent = data.score;
                if (ct) ct.textContent = data.votes;
            }
        });

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        function onKeyDown(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                closeModal();
                document.removeEventListener('keydown', onKeyDown);
            }
        }
        document.addEventListener('keydown', onKeyDown);
    }

    // -------------------------------------------------------
    // FIX #1 + #4: Кнопка «Оценить» — правильная структура + SVG
    // -------------------------------------------------------
    function injectVoteButton(render, card) {
        if (render.find('.view--lampa-vote').length) return;

        // FIX #4: реальный SVG иконки звезды
        var iconStar =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
            'width="22" height="22" fill="currentColor">' +
            '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77' +
            'l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
            '</svg>';

        // FIX #1: правильная структура кнопки Lampa с классом selector
        var btn = $(
            '<div class="view--button view--lampa-vote selector" tabindex="0">' +
            '<div class="view--button__ico">' + iconStar + '</div>' +
            '<div class="view--button__text">Оценить</div>' +
            '</div>'
        );

        btn.on('hover:enter click', function (e) {
            e.preventDefault();
            showVoteModal(card);
        });

        // Найти место вставки — кнопка «Ещё» или кнопка Play
        var moreBtn = render.find('.view--more, .full-start__more, [data-component="more"]');
        if (moreBtn.length) {
            moreBtn.after(btn);
        } else {
            var playBtn = render.find('.full-start__play, .view--play');
            if (playBtn.length) playBtn.after(btn);
            else render.find('.full-start__buttons, .full-start-new__buttons').append(btn);
        }
    }

    // -------------------------------------------------------
    // FIX #5: Настройки — правильный API Lampa
    // -------------------------------------------------------
    function initSettings() {
        // Способ 1: Lampa.SettingsApi (современный API)
        try {
            if (Lampa.SettingsApi) {
                Lampa.SettingsApi.addParam({
                    component: 'interface',
                    param: {
                        name: 'lampa_rating_show',
                        type: 'select',
                        values: { 'true': 'Показывать', 'false': 'Скрыть' },
                        'default': 'true'
                    },
                    field: {
                        name: 'Рейтинги LAMPA на карточках'
                    },
                    onChange: function (val) {
                        Lampa.Storage.set('lampa_rating_show', val);
                    }
                });
                return;
            }
        } catch (e) {}

        // Способ 2: Lampa.Settings.listener (запасной вариант)
        try {
            if (Lampa.Settings && Lampa.Settings.listener) {
                Lampa.Settings.listener.follow('open', function (e) {
                    if (e.name !== 'interface' && e.name !== 'main') return;
                    setTimeout(function () {
                        var body = e.body;
                        if (!body || body.find('[data-name="lampa_rating_show"]').length) return;
                        var html =
                            '<div class="settings-param selector" data-name="lampa_rating_show" tabindex="0">' +
                            '<div class="settings-param__name">Рейтинги LAMPA на карточках</div>' +
                            '<div class="settings-param__value">' +
                            (settingEnabled() ? 'Показывать' : 'Скрыть') +
                            '</div>' +
                            '</div>';
                        var el = $(html);
                        el.on('hover:enter click', function () {
                            var current = Lampa.Storage.get('lampa_rating_show', 'true');
                            var newVal = (current === 'false' || current === false) ? 'true' : 'false';
                            Lampa.Storage.set('lampa_rating_show', newVal);
                            el.find('.settings-param__value').text(newVal === 'true' ? 'Показывать' : 'Скрыть');
                            Lampa.Noty.show('Настройка сохранена');
                        });
                        body.append(el);
                    }, 200);
                });
            }
        } catch (e) {}
    }

    // -------------------------------------------------------
    // Локализация
    // -------------------------------------------------------
    function initLang() {
        try {
            if (Lampa.Lang) {
                Lampa.Lang.add({
                    lampa_rating_show: {
                        ru: 'Рейтинги LAMPA на карточках',
                        en: 'LAMPA ratings on cards',
                        uk: 'Рейтинги LAMPA на картках'
                    }
                });
            }
        } catch (e) {}
    }

    // -------------------------------------------------------
    // Главный слушатель
    // -------------------------------------------------------
    function startPlugin() {
        injectStyles();
        initLang();
        initSettings();

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var card = e.data && e.data.movie ? e.data.movie : null;
            if (!card || !card.id) return;
            // Поддержка обоих вариантов получения render
            var render = null;
            try {
                render = e.object && e.object.activity
                    ? e.object.activity.render()
                    : (e.object && e.object.render ? e.object.render() : null);
            } catch (err) {}
            if (!render || !render.length) return;
            injectRatingIntoCard(render, card);
            injectVoteButton(render, card);
        });
    }

    // -------------------------------------------------------
    // Запуск
    // -------------------------------------------------------
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();