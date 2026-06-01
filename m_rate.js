/**
 * Lampa Rating Plugin
 * Рейтинг пользователей Lampa на карточках фильмов и сериалов
 * Кнопка для оценки (1-10 звёзд) с ограничением раз в 24 часа
 * Без bylampa домена — использует только cub.red API
 */

(function () {
    'use strict';

    var PLUGIN_NAME = 'lampa_rating';
    var API_BASE = 'https://cub.red/api/reactions';
    var VOTE_COOLDOWN = 24 * 60 * 60 * 1000; // 24 часа в мс
    var VOTE_STORAGE_KEY = 'lampa_rating_votes';

    // -------------------------------------------------------
    // Утилиты
    // -------------------------------------------------------

    function getStoredVotes() {
        try {
            var raw = Lampa.Storage.get(VOTE_STORAGE_KEY, '{}');
            return JSON.parse(raw);
        } catch (e) {
            return {};
        }
    }

    function saveVote(cardId, rating) {
        var votes = getStoredVotes();
        votes[cardId] = { rating: rating, time: Date.now() };
        Lampa.Storage.set(VOTE_STORAGE_KEY, JSON.stringify(votes));
    }

    function getMyVote(cardId) {
        var votes = getStoredVotes();
        if (votes[cardId]) {
            return votes[cardId];
        }
        return null;
    }

    function canVote(cardId) {
        var vote = getMyVote(cardId);
        if (!vote) return true;
        return (Date.now() - vote.time) > VOTE_COOLDOWN;
    }

    function getCardKey(card) {
        var method = card.name ? 'tv' : 'movie';
        var id = card.id;
        return method + '_' + id;
    }

    function settingEnabled() {
        return Lampa.Storage.field('lampa_rating_show') !== false &&
               Lampa.Storage.field('lampa_rating_show') !== 'false';
    }

    // -------------------------------------------------------
    // API: получение рейтинга
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
                var positive = 0;
                var negative = 0;
                var totalVotes = 0;

                result.forEach(function (item) {
                    var cnt = parseInt(item.counter) || 0;
                    totalVotes += cnt;
                    // fire, nice — позитивные
                    if (item.type === 'fire' || item.type === 'nice') {
                        positive += cnt;
                    }
                    // shit, bore, think — негативные
                    if (item.type === 'shit' || item.type === 'bore' || item.type === 'think') {
                        negative += cnt;
                    }
                });

                // Вычислить рейтинг 0-10 по соотношению
                var score = 0;
                if (positive + negative > 0) {
                    score = (positive / (positive + negative)) * 10;
                }

                callback(null, {
                    score: parseFloat(score.toFixed(1)),
                    votes: totalVotes,
                    result: result
                });
            } catch (e) {
                callback(e, null);
            }
        };
        xhr.onerror = function () {
            callback(new Error('Network error'), null);
        };
        xhr.ontimeout = function () {
            callback(new Error('Timeout'), null);
        };
        xhr.send();
    }

    // -------------------------------------------------------
    // API: отправка оценки (1-10 звёзд -> reaction type)
    // -------------------------------------------------------

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
        xhr.onload = function () {
            saveVote(key, rating);
            if (callback) callback(null);
        };
        xhr.onerror = function () {
            if (callback) callback(new Error('Network error'));
        };
        xhr.ontimeout = function () {
            if (callback) callback(new Error('Timeout'));
        };
        xhr.send();
    }

    // -------------------------------------------------------
    // UI: вставить рейтинг LAMPA в карточку
    // -------------------------------------------------------

    function injectRatingIntoCard(render, card) {
        if (!settingEnabled()) return;

        // Убрать старый элемент если есть
        render.find('.rate--lampa-custom').remove();

        fetchRating(card, function (err, data) {
            if (err || !data) return;

            var rateBlock = render.find('.full-start__rate');
            if (!rateBlock.length) return;

            // Удалить предыдущий наш элемент
            rateBlock.find('.rate--lampa-custom').remove();

            var score = data.score;
            var votes = data.votes;

            var html = '<div class="rate--lampa-custom" style="display:inline-flex;align-items:center;margin-left:1.2em;gap:0.3em;">' +
                '<span style="font-size:1.05em;font-weight:700;color:#fff;">' + score + '</span>' +
                '<span style="font-size:0.72em;font-weight:600;color:#f5c518;text-transform:uppercase;letter-spacing:.04em;">LAMPA</span>' +
                '</div>';

            rateBlock.append(html);
        });
    }

    // -------------------------------------------------------
    // UI: модальное окно для оценки (звёзды 1-10)
    // -------------------------------------------------------

    function showVoteModal(card) {
        var cardKey = getCardKey(card);

        var existingModal = document.getElementById('lampa-vote-modal');
        if (existingModal) existingModal.remove();

        var myVote = getMyVote(cardKey);
        var canVoteNow = canVote(cardKey);

        var starsHtml = '';
        for (var i = 1; i <= 10; i++) {
            var isSelected = myVote && myVote.rating === i;
            starsHtml +=
                '<div class="lampa-star-item selector" data-rating="' + i + '" style="display:inline-flex;flex-direction:column;align-items:center;gap:0.25em;cursor:' + (canVoteNow ? 'pointer' : 'default') + ';">' +
                '<span class="lampa-star" style="font-size:1.8em;color:' + (isSelected ? '#f5c518' : '#aaa') + ';transition:color .15s;">' +
                (isSelected ? '★' : '☆') +
                '</span>' +
                '<span style="font-size:0.7em;color:#aaa;">' + i + '</span>' +
                '</div>';
        }

        var titleText = card.name || card.title || card.original_name || card.original_title || '';
        var year = (card.first_air_date || card.release_date || '').slice(0, 4);
        var poster = (card.poster_path ? 'https://image.tmdb.org/t/p/w185' + card.poster_path : '') ||
                     (card.img || '');

        var currentRating = myVote ? myVote.rating : null;
        var userCount = '';

        // Получить актуальный рейтинг
        fetchRating(card, function (err, data) {
            if (!err && data) {
                var ratingEl = document.getElementById('lampa-modal-score');
                var countEl = document.getElementById('lampa-modal-count');
                if (ratingEl) ratingEl.textContent = data.score;
                if (countEl) countEl.textContent = data.votes;
            }
        });

        var cooldownMsg = '';
        if (!canVoteNow && myVote) {
            var remaining = VOTE_COOLDOWN - (Date.now() - myVote.time);
            var hours = Math.floor(remaining / 3600000);
            var mins = Math.floor((remaining % 3600000) / 60000);
            cooldownMsg = 'Следующая оценка через ' + hours + 'ч ' + mins + 'мин';
        }

        var modalHtml =
            '<div id="lampa-vote-modal" style="' +
                'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;' +
                'display:flex;align-items:flex-end;justify-content:center;' +
                'background:rgba(0,0,0,0.75);' +
            '">' +
                '<div style="' +
                    'background:#1a1a2e;border-radius:1.2em 1.2em 0 0;' +
                    'padding:2em 1.5em 3em;width:100%;max-width:480px;' +
                    'box-shadow:0 -8px 40px rgba(0,0,0,0.7);' +
                '">' +
                    '<h2 style="color:#fff;font-size:1.4em;font-weight:300;margin:0 0 1.2em;text-align:left;">' +
                        'Поставьте оценку' +
                    '</h2>' +
                    '<div style="display:flex;gap:1em;align-items:center;margin-bottom:1.5em;">' +
                        (poster ? '<img src="' + poster + '" style="width:90px;border-radius:.5em;flex-shrink:0;" onerror="this.style.display=\'none\'">' : '') +
                        '<div>' +
                            '<div style="color:#aaa;font-size:0.85em;margin-bottom:.2em;">' + year + '</div>' +
                            '<div style="color:#fff;font-size:1.3em;font-weight:600;margin-bottom:.5em;">' + titleText + '</div>' +
                            '<div style="display:inline-flex;align-items:center;gap:.7em;background:rgba(255,255,255,0.08);border-radius:2em;padding:.35em .9em;">' +
                                '<span style="color:#f5c518;font-size:1em;">★</span>' +
                                '<span id="lampa-modal-score" style="color:#fff;font-weight:700;">' + (currentRating ? currentRating.toFixed(1) : '—') + '</span>' +
                                '<span style="color:#aaa;font-size:0.85em;">|</span>' +
                                '<span style="color:#bbb;font-size:0.85em;">👤</span>' +
                                '<span id="lampa-modal-count" style="color:#fff;font-weight:500;">—</span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="lampa-stars-container" style="display:flex;flex-wrap:wrap;justify-content:center;gap:.7em;margin-bottom:1.2em;">' +
                        starsHtml +
                    '</div>' +
                    '<div style="text-align:center;background:rgba(255,255,255,0.06);border-radius:.7em;padding:.7em;color:#aaa;font-size:.82em;">' +
                        (canVoteNow ? 'Каждую карточку можно оценить раз в 24 часа' : cooldownMsg) +
                    '</div>' +
                '</div>' +
            '</div>';

        var modalEl = document.createElement('div');
        modalEl.innerHTML = modalHtml;
        document.body.appendChild(modalEl.firstChild);

        var modal = document.getElementById('lampa-vote-modal');

        // Hover эффекты и клик по звёздам
        var starItems = modal.querySelectorAll('.lampa-star-item');

        function highlightStars(upTo) {
            starItems.forEach(function (el, idx) {
                var star = el.querySelector('.lampa-star');
                if (idx < upTo) {
                    star.style.color = '#f5c518';
                    star.textContent = '★';
                } else {
                    star.style.color = '#aaa';
                    star.textContent = '☆';
                }
            });
        }

        if (canVoteNow) {
            starItems.forEach(function (el) {
                var rating = parseInt(el.dataset.rating);

                el.addEventListener('mouseenter', function () {
                    highlightStars(rating);
                });

                el.addEventListener('mouseleave', function () {
                    if (currentRating) {
                        highlightStars(currentRating);
                    } else {
                        highlightStars(0);
                    }
                });

                el.addEventListener('click', function () {
                    currentRating = rating;
                    highlightStars(rating);

                    submitVote(card, rating, function (err) {
                        if (err) {
                            Lampa.Noty.show('Ошибка при отправке оценки');
                        } else {
                            Lampa.Noty.show('Оценка ' + rating + '/10 принята!');
                            // обновить счётчик в модале
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
                });

                // Lampa TV-пульт поддержка
                el.addEventListener('hover:enter', function () {
                    if (!canVoteNow) return;
                    var r = parseInt(el.dataset.rating);
                    currentRating = r;
                    highlightStars(r);
                    submitVote(card, r, function (err) {
                        if (err) {
                            Lampa.Noty.show('Ошибка при отправке оценки');
                        } else {
                            Lampa.Noty.show('Оценка ' + r + '/10 принята!');
                        }
                    });
                });
            });

            if (currentRating) highlightStars(currentRating);
        }

        // Закрыть по клику вне окна
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Escape для закрытия
        function onKeyDown(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                modal.remove();
                document.removeEventListener('keydown', onKeyDown);
            }
        }
        document.addEventListener('keydown', onKeyDown);
    }

    // -------------------------------------------------------
    // UI: кнопка звёздочки в full карточке
    // -------------------------------------------------------

    function injectVoteButton(render, card) {
        // Не добавлять дважды
        if (render.find('.view--lampa-vote').length) return;

        var iconStar = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' +
            '</svg>';

        var btn = $(
            '<div class="full-start__button selector view--lampa-vote" data-subtitle="Оценить">' +
                iconStar +
                '<span>Оценить</span>' +
            '</div>'
        );

        btn.on('hover:enter click', function (e) {
            e.preventDefault();
            showVoteModal(card);
        });

        // Вставить после кнопки "Ещё (...)"
        var moreBtn = render.find('.full-start__more, [data-subtitle="Ещё"], .view--more');
        if (moreBtn.length) {
            moreBtn.after(btn);
        } else {
            var playBtn = render.find('.full-start__play');
            if (playBtn.length) {
                playBtn.after(btn);
            } else {
                render.append(btn);
            }
        }
    }

    // -------------------------------------------------------
    // Настройки
    // -------------------------------------------------------

    function initSettings() {
        if (typeof Lampa.Settings === 'undefined') return;

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name !== 'main') return;

            var params = e.body;

            // Найти секцию или добавить
            Lampa.Params.select('lampa_rating_show', {
                name: 'Показывать оценки LAMPA',
                values: { 'true': 'Да', 'false': 'Нет' },
                'default': 'true'
            });
        });
    }

    // Альтернативный способ добавления настроек через Settings напрямую
    function tryAddSettings() {
        try {
            if (Lampa.Params && Lampa.Params.select) {
                Lampa.Params.select('lampa_rating_show', {
                    name: 'Показывать оценки LAMPA',
                    values: { 'true': 'Да', 'false': 'Нет' },
                    'default': 'true'
                });
            }
        } catch (e) {
            // ignore
        }
    }

    // -------------------------------------------------------
    // Инициализация языка
    // -------------------------------------------------------

    function initLang() {
        if (typeof Lampa.Lang === 'undefined') return;
        try {
            Lampa.Lang.add({
                lampa_rating_show: {
                    ru: 'Показывать оценки LAMPA',
                    en: 'Show LAMPA ratings',
                    uk: 'Показувати оцінки LAMPA'
                }
            });
        } catch (e) { }
    }

    // -------------------------------------------------------
    // Главный слушатель событий
    // -------------------------------------------------------

    function startPlugin() {
        initLang();
        tryAddSettings();
        initSettings();

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;

            var card = e.data && e.data.movie ? e.data.movie : null;
            if (!card) return;

            var render = e.object && e.object.activity ? e.object.activity.render() : null;
            if (!render || !render.length) return;

            // Вставить рейтинг LAMPA в блок рейтингов
            injectRatingIntoCard(render, card);

            // Вставить кнопку оценки
            injectVoteButton(render, card);
        });

        // Если уже открыта карточка
        try {
            if (Lampa.Activity.active && Lampa.Activity.active().component === 'full') {
                var active = Lampa.Activity.active();
                var card = active.card || (active.movie);
                var render = active.activity ? active.activity.render() : null;
                if (card && render) {
                    injectRatingIntoCard(render, card);
                    injectVoteButton(render, card);
                }
            }
        } catch (e) { }
    }

    // -------------------------------------------------------
    // Запуск
    // -------------------------------------------------------

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }

})();
