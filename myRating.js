(function () {
    'use strict';

    var PLUGIN_NAME = 'lampa_rating';
    var API_BASE = 'https://cub.red/api/reactions';
    var VOTE_COOLDOWN = 24 * 60 * 60 * 1000;
    var VOTE_STORAGE_KEY = 'lampa_rating_votes';
    var prevController = 'full';

    // -------------------------------------------------------
    // Инъекция CSS стилей
    // -------------------------------------------------------
    function injectStyles() {
        if (document.getElementById('lampa-rating-css')) return;
        var style = document.createElement('style');
        style.id = 'lampa-rating-css';
        style.textContent = [
            /* --- Оверлей --- */
            '.lampa-vote-overlay{',
            '  position:fixed;top:0;left:0;width:100%;height:100%;',
            '  background:rgba(0,0,0,.88);z-index:9999;',
            '  display:flex;align-items:center;justify-content:center;',
            '}',

            /* --- Диалог --- */
            '.lampa-vote-dialog{',
            '  background:#1a1a2e;border:1px solid #2a2a4a;border-radius:16px;',
            '  padding:28px 32px;',
            /* Фиксированная ширина — не дадим звёздам переноситься */
            '  width:640px;max-width:94vw;',
            '  box-shadow:0 8px 40px rgba(0,0,0,.7);',
            '  box-sizing:border-box;',
            '}',

            /* --- Заголовок --- */
            '.lampa-vote-title{font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;}',

            /* --- Шапка с постером --- */
            '.lampa-vote-header{display:flex;gap:16px;align-items:flex-start;margin-bottom:20px;}',
            '.lampa-vote-poster{width:64px;height:94px;object-fit:cover;border-radius:8px;flex-shrink:0;}',
            '.lampa-vote-poster-ph{width:64px;height:94px;background:#2a2a4a;border-radius:8px;flex-shrink:0;}',
            '.lampa-vote-info{flex:1;min-width:0;}',
            '.lampa-vote-year{font-size:11px;color:#666;margin-bottom:4px;}',
            '.lampa-vote-name{font-size:16px;font-weight:700;color:#fff;line-height:1.3;margin-bottom:12px;}',
            '.lampa-vote-current{display:flex;align-items:center;gap:8px;font-size:13px;color:#aaa;}',
            '.lampa-vote-current .lv-icon{color:#f5c518;}',
            '.lampa-vote-current .lv-score{font-size:18px;font-weight:700;color:#fff;}',
            '.lampa-vote-sep{color:#444;}',
            '.lampa-vote-current .lv-count{color:#888;}',

            /* -------------------------------------------------------------------
               КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ДЛЯ TV:
               Звёзды — сетка 2 строки × 5 столбцов.
               NO flex-wrap — это убирало звёзды на вторую строку непредсказуемо
               и ломало навигацию пультом.
               ------------------------------------------------------------------- */
            '.lampa-stars{',
            '  display:grid;',
            '  grid-template-columns:repeat(5,1fr);',
            '  gap:10px 8px;',
            '  margin:4px 0 18px;',
            '  width:100%;',
            '}',

            /* --- Элемент звезды --- */
            '.lampa-star-item{',
            '  display:flex;flex-direction:column;align-items:center;gap:4px;',
            '  cursor:pointer;border-radius:10px;padding:10px 6px;',
            '  border:2px solid transparent;',
            '  transition:background .12s,border-color .12s;',
            /* min-width убран — grid сам управляет шириной */
            '}',
            '.lampa-star-item:focus{outline:none;}',

            /* Фокус — заметный, чтобы на TV было видно */
            '.lampa-star-item.focused,.lampa-star-item:focus{',
            '  background:rgba(245,197,24,.22)!important;',
            '  border-color:rgba(245,197,24,.7)!important;',
            '}',

            '.lampa-star-icon{font-size:24px;color:#555;transition:color .12s;line-height:1;}',
            '.lampa-star-num{font-size:11px;color:#888;font-weight:600;}',

            '.lampa-vote-hint{',
            '  font-size:12px;color:#666;text-align:center;margin-top:4px;',
            '  padding:8px 12px;background:rgba(255,255,255,.04);border-radius:8px;',
            '}',

            /* --- Кнопка «Оценить» — точно такой же размер, как соседние кнопки --- */
            /* width:auto + min-width предотвращают растягивание по тексту */
            '.view--lampa-vote{min-width:0!important;max-width:80px!important;}',
            '.view--lampa-vote .view--button__text{white-space:nowrap;overflow:hidden;',
            'text-overflow:ellipsis;font-size:11px!important;}',
            '.view--lampa-vote .view--button__ico svg{width:20px!important;height:20px!important;}',

            /* --- Мини-рейтинг на карточке --- */
            '.rate--lampa-custom{display:inline-flex;flex-direction:column;align-items:center;',
            'margin-left:10px;vertical-align:middle;}',
            '.rate--lampa-score{font-size:14px;font-weight:700;color:#f5c518;line-height:1;}',
            '.rate--lampa-label{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.5px;}',
        ].join('\n');
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
    // Рейтинг в карточке
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
            var html =
                '<div class="rate--lampa-custom">' +
                '<span class="rate--lampa-score">' + data.score + '</span>' +
                '<span class="rate--lampa-label">LAMPA</span>' +
                '</div>';
            rateBlock.append(html);
        });
    }

    // -------------------------------------------------------
    // Модальное окно
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

        /*
         * ИСПРАВЛЕНИЕ НАВИГАЦИИ НА TV:
         * Звёзды расположены в сетке 2 строки × 5 столбцов:
         *   Строка 0: звёзды 1-5  (индексы 0-4)
         *   Строка 1: звёзды 6-10 (индексы 5-9)
         *
         * data-row и data-col позволяют контроллеру точно знать
         * где находится фокус и куда переходить.
         */
        var starsHtml = '';
        for (var i = 1; i <= 10; i++) {
            var isSelected = currentRating >= i;
            var row = i <= 5 ? 0 : 1;
            var col = (i - 1) % 5;
            starsHtml +=
                '<div class="lampa-star-item selector"' +
                ' data-rating="' + i + '"' +
                ' data-row="' + row + '"' +
                ' data-col="' + col + '"' +
                ' tabindex="0">' +
                '<span class="lampa-star-icon" style="color:' + (isSelected ? '#f5c518' : '#555') + '">' +
                (isSelected ? '★' : '☆') +
                '</span>' +
                '<span class="lampa-star-num">' + i + '</span>' +
                '</div>';
        }

        var posterHtml = poster
            ? '<img class="lampa-vote-poster" src="' + poster + '" alt="" />'
            : '<div class="lampa-vote-poster-ph"></div>';

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

        // ---- Сетка навигации 2×5 ----
        var focusRow = currentRating > 0 ? (currentRating <= 5 ? 0 : 1) : 0;
        var focusCol = currentRating > 0 ? (currentRating - 1) % 5 : 0;

        function getStarIndex(row, col) {
            return row * 5 + col; // 0-based
        }

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

        function focusStar(row, col) {
            // Ограничиваем диапазон
            if (row < 0) row = 0;
            if (row > 1) row = 1;
            if (col < 0) col = 0;
            if (col > 4) col = 4;

            focusRow = row;
            focusCol = col;

            var idx = getStarIndex(row, col);
            starItems.forEach(function (el) { el.classList.remove('focused'); });
            if (starItems[idx]) {
                starItems[idx].classList.add('focused');
                starItems[idx].focus();
                highlightStars(idx + 1);
            }
        }

        // Установить начальный фокус
        focusStar(focusRow, focusCol);

        // ---- Обработчики мыши / тач ----
        if (canVoteNow) {
            starItems.forEach(function (el) {
                var rating = parseInt(el.getAttribute('data-rating'));
                var elRow = parseInt(el.getAttribute('data-row'));
                var elCol = parseInt(el.getAttribute('data-col'));

                el.addEventListener('mouseenter', function () {
                    highlightStars(rating);
                    starItems.forEach(function (s) { s.classList.remove('focused'); });
                    el.classList.add('focused');
                    focusRow = elRow;
                    focusCol = elCol;
                });

                el.addEventListener('mouseleave', function () {
                    highlightStars(currentRating > 0 ? currentRating : 0);
                    el.classList.remove('focused');
                });

                el.addEventListener('click', function () {
                    currentRating = rating;
                    highlightStars(rating);
                    doVote(rating);
                });

                // Lampa TV события
                el.addEventListener('hover:enter', function () {
                    if (!canVoteNow) return;
                    currentRating = rating;
                    highlightStars(rating);
                    doVote(rating);
                });

                el.addEventListener('hover:focus', function () {
                    focusStar(elRow, elCol);
                });
            });
        }

        // ---- Голосование ----
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

        // ---- Закрытие ----
        function closeModal() {
            if (modal && modal.parentNode) modal.remove();
            document.removeEventListener('keydown', onKeyDown);
            try {
                Lampa.Controller.toggle(prevController || 'full');
            } catch (e) {
                try { Lampa.Controller.toggle('content'); } catch (e2) {}
            }
        }

        // ---- Сохранить текущий контроллер ----
        try {
            var enabled = Lampa.Controller.enabled();
            prevController = (enabled && enabled.name) ? enabled.name : 'full';
        } catch (e) {
            prevController = 'full';
        }

        /*
         * ИСПРАВЛЕНИЕ НАВИГАЦИИ ПУЛЬТОМ НА TV:
         *
         * Сетка 2 строки × 5 столбцов:
         *   LEFT  — col - 1 (не выходим за пределы строки)
         *   RIGHT — col + 1 (не выходим за пределы строки)
         *   UP    — row - 1 (со строки 1 → строка 0, тот же столбец)
         *   DOWN  — row + 1 (со строки 0 → строка 1, тот же столбец)
         *   ENTER — выставить оценку и закрыть
         *   BACK  — закрыть без оценки
         */
        Lampa.Controller.add('lampa_rating_modal', {
            toggle: function () {
                Lampa.Controller.own(this);
                focusStar(focusRow, focusCol);
            },
            left: function () {
                if (focusCol > 0) focusStar(focusRow, focusCol - 1);
            },
            right: function () {
                if (focusCol < 4) focusStar(focusRow, focusCol + 1);
            },
            up: function () {
                if (focusRow > 0) focusStar(focusRow - 1, focusCol);
                else closeModal();
            },
            down: function () {
                if (focusRow < 1) focusStar(focusRow + 1, focusCol);
            },
            enter: function () {
                if (!canVoteNow) { closeModal(); return; }
                var rating = getStarIndex(focusRow, focusCol) + 1;
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

        // Загрузить актуальный рейтинг
        fetchRating(card, function (err, data) {
            if (!err && data) {
                var sc = document.getElementById('lampa-modal-score');
                var ct = document.getElementById('lampa-modal-count');
                if (sc) sc.textContent = data.score;
                if (ct) ct.textContent = data.votes;
            }
        });

        // Закрыть по клику на фон
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        // Клавиатурная навигация (резерв для TV + браузер)
        function onKeyDown(e) {
            var key = e.keyCode || e.which;
            if (key === 27) { closeModal(); return; }          // Escape
            if (key === 13 || key === 32) {                    // Enter / Space
                e.preventDefault();
                if (!canVoteNow) { closeModal(); return; }
                var rating = getStarIndex(focusRow, focusCol) + 1;
                currentRating = rating;
                highlightStars(rating);
                doVote(rating);
                setTimeout(closeModal, 900);
            }
            if (key === 37) { e.preventDefault(); if (focusCol > 0) focusStar(focusRow, focusCol - 1); }  // ←
            if (key === 39) { e.preventDefault(); if (focusCol < 4) focusStar(focusRow, focusCol + 1); }  // →
            if (key === 38) {                                                                               // ↑
                e.preventDefault();
                if (focusRow > 0) focusStar(focusRow - 1, focusCol); else closeModal();
            }
            if (key === 40) { e.preventDefault(); if (focusRow < 1) focusStar(focusRow + 1, focusCol); }  // ↓
        }
        document.addEventListener('keydown', onKeyDown);
    }

    // -------------------------------------------------------
    // Кнопка «Оценить»
    // -------------------------------------------------------
    var VOTE_BUTTON_COMPONENT = 'lampa_vote';

    var iconStar =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
        'width="22" height="22" fill="currentColor">' +
        '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77' +
        'l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' +
        '</svg>';

    function makeVoteBtn(card) {
        /*
         * НЕ ставим tabindex — Lampa управляет фокусом сама через класс .hover.
         * Браузерный tabindex конфликтует с Lampa-навигацией на TV.
         */
        var btn = $(
            '<div class="view--button view--lampa-vote selector"' +
            ' data-component="' + VOTE_BUTTON_COMPONENT + '">' +
            '<div class="view--button__ico">' + iconStar + '</div>' +
            '<div class="view--button__text">Оценить</div>' +
            '</div>'
        );

        function openModal() { showVoteModal(card); }

        /*
         * Три варианта срабатывания — покрывают все версии Lampa и платформы:
         *   hover:enter  — стандартное TV-событие Lampa (OK-кнопка пульта)
         *   hover:click  — альтернативное TV-событие в части сборок Lampa
         *   click        — мышь / тач-экран
         * НЕ вызываем stopPropagation — он мог блокировать Lampa-события.
         */
        btn.on('hover:enter hover:click click', function (e) {
            e.preventDefault();
            openModal();
        });

        /*
         * РЕЗЕРВНЫЙ ОБРАБОТЧИК ДЛЯ TV (Android TV 9):
         * Когда Lampa ставит класс .hover на кнопку и пользователь нажимает OK,
         * некоторые версии прошивки не доносят jQuery-событие до элемента.
         * Слушаем нативный keydown на фазе захвата (capture=true) и проверяем
         * сами — есть ли у нашей кнопки класс .hover.
         */
        var btnEl = btn[0];
        function onDocKey(e) {
            var kc = e.keyCode || e.which;
            // Enter (13), OK/Select (32 у ряда TV), MediaPlayPause нам не нужен
            if (kc !== 13 && kc !== 32) return;
            if (btnEl && (btnEl.classList.contains('hover') || document.activeElement === btnEl)) {
                e.preventDefault();
                e.stopPropagation();
                openModal();
            }
        }
        document.addEventListener('keydown', onDocKey, true);

        // Чистим слушатель, когда карточка уничтожается
        btn.one('destroy remove', function () {
            document.removeEventListener('keydown', onDocKey, true);
        });

        return btn;
    }

    function injectVoteButton(render, card) {
        if (render.find('.view--lampa-vote').length) return;

        var btn = makeVoteBtn(card);

        var moreBtn = render.find('.view--more, .full-start__more, [data-component="more"]');
        if (moreBtn.length) {
            moreBtn.after(btn);
        } else {
            var playBtn = render.find('.full-start__play, .view--play');
            if (playBtn.length) playBtn.after(btn);
            else render.find('.full-start__buttons, .full-start-new__buttons').append(btn);
        }

        /*
         * Обновляем навигатор Lampa после добавления кнопки в DOM.
         * Пробуем сначала Lampa.Navigator (если есть), затем Controller.toggle.
         * Задержка 150 мс — DOM должен успеть обновиться.
         */
        setTimeout(function () {
            try {
                if (Lampa.Navigator && typeof Lampa.Navigator.update === 'function') {
                    Lampa.Navigator.update();
                }
            } catch (e) {}
            try {
                var cur = Lampa.Controller.enabled();
                if (cur && cur.name) Lampa.Controller.toggle(cur.name);
                else Lampa.Controller.toggle('full');
            } catch (e) {}
        }, 150);
    }

    // -------------------------------------------------------
    // Настройки
    // -------------------------------------------------------
    function initSettings() {
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
                    field: { name: 'Рейтинги LAMPA на карточках' },
                    onChange: function (val) {
                        Lampa.Storage.set('lampa_rating_show', val);
                    }
                });
                return;
            }
        } catch (e) {}

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
            /*
             * РЕГИСТРАЦИЯ ДЛЯ РЕДАКТОРА КНОПОК:
             * Lampa генерирует событие type='button' когда формирует список
             * кнопок для редактора. Добавляем нашу кнопку в этот список —
             * тогда редактор её видит, может скрыть/переместить.
             */
            if (e.type === 'button') {
                try {
                    var buttons = e.buttons || (e.data && e.data.buttons);
                    if (buttons && Array.isArray(buttons)) {
                        var alreadyReg = buttons.some(function (b) {
                            return b.component === VOTE_BUTTON_COMPONENT;
                        });
                        if (!alreadyReg) {
                            buttons.push({
                                component: VOTE_BUTTON_COMPONENT,
                                icon: iconStar,
                                label: 'Оценить',
                                name: 'Оценить'
                            });
                        }
                    }
                } catch (err) {}
                return;
            }

            if (e.type !== 'complite') return;

            var card = e.data && e.data.movie ? e.data.movie : null;
            if (!card || !card.id) return;

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
