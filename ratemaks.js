(function () {
    'use strict';

    var PLUGIN_NAME = 'lampa_rating';
    var API_BASE = 'https://cub.red/api/reactions';
    var VOTE_COOLDOWN = 24 * 60 * 60 * 1000;
    var VOTE_STORAGE_KEY = 'lampa_rating_votes';
    var prevController = null;

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
        return votes[cardId] || null;
    }

    function canVote(cardId) {
        var vote = getMyVote(cardId);
        if (!vote) return true;
        return (Date.now() - vote.time) > VOTE_COOLDOWN;
    }

    // ИСПРАВЛЕНО: надёжное определение типа карточки
    function getCardKey(card) {
        var isTV = false;
        if (card.media_type === 'tv') isTV = true;
        else if (card.media_type === 'movie') isTV = false;
        else if (card.number_of_seasons !== undefined) isTV = true;
        else if (card.first_air_date) isTV = true;
        else if (card.name && !card.title) isTV = true;
        var method = isTV ? 'tv' : 'movie';
        return method + '_' + card.id;
    }

    // ИСПРАВЛЕНО: правильная проверка настройки
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
    // UI: рейтинг в карточке
    // -------------------------------------------------------

    function injectRatingIntoCard(render, card) {
        if (!settingEnabled()) return;
        render.find('.rate--lampa-custom').remove();
        fetchRating(card, function (err, data) {
            if (err || !data) return;
            var rateBlock = render.find('.full-start__rate');
            if (!rateBlock.length) return;
            rateBlock.find('.rate--lampa-custom').remove();
            var html =
                '' +
                '' + data.score + '' +
                'LAMPA' +
                '';
            rateBlock.append(html);
        });
    }

    // -------------------------------------------------------
    // UI: модальное окно — ПЕРЕРАБОТАНО для Android TV
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

        // Строим звёзды как отдельные элементы с классом selector
        var starsHtml = '';
        for (var i = 1; i <= 10; i++) {
            var isSelected = currentRating >= i;
            starsHtml +=
                '' +
                '' +
                (isSelected ? '★' : '☆') +
                '' +
                '' + i + '' +
                '';
        }

        var modalHtml =
            '' +
            '' +
            'Поставьте оценку' +
            '' +
            (poster ? '' : '') +
            '' +
            '' + year + '' +
            '' + titleText + '' +
            '' +
            '★' +
            '—' +
            '|' +
            '👥' +
            '—' +
            '' +
            '' +
            starsHtml +
            '' +
            '' +
            (canVoteNow ? 'Можно оценить раз в 24 часа' : cooldownMsg) +
            '' +
            '';

        var wrapper = document.createElement('div');
        wrapper.innerHTML = modalHtml;
        document.body.appendChild(wrapper.firstChild);

        var modal = document.getElementById('lampa-vote-modal');
        var starItems = Array.prototype.slice.call(modal.querySelectorAll('.lampa-star-item'));
        var focusedIndex = currentRating > 0 ? currentRating - 1 : 0;

        // Подсветить звёзды до указанного индекса
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

        // Сфокусировать элемент
        function focusStar(idx) {
            starItems.forEach(function (el) {
                el.style.background = '';
            });
            if (starItems[idx]) {
                starItems[idx].style.background = 'rgba(245,197,24,0.18)';
                focusedIndex = idx;
                highlightStars(idx + 1);
            }
        }

        if (currentRating > 0) {
            highlightStars(currentRating);
            focusedIndex = currentRating - 1;
        }

        // Обработка клика / hover для мыши (мобильные)
        if (canVoteNow) {
            starItems.forEach(function (el) {
                var rating = parseInt(el.getAttribute('data-rating'));

                el.addEventListener('mouseenter', function () {
                    highlightStars(rating);
                    starItems.forEach(function (s) { s.style.background = ''; });
                    el.style.background = 'rgba(245,197,24,0.18)';
                    focusedIndex = rating - 1;
                });

                el.addEventListener('mouseleave', function () {
                    if (currentRating > 0) highlightStars(currentRating);
                    else highlightStars(0);
                    el.style.background = '';
                });

                el.addEventListener('click', function () {
                    currentRating = rating;
                    highlightStars(rating);
                    doVote(rating);
                });

                // Lampa TV: hover:enter
                el.addEventListener('hover:enter', function () {
                    if (!canVoteNow) return;
                    currentRating = rating;
                    highlightStars(rating);
                    doVote(rating);
                });

                // Lampa TV: hover:focus
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
            modal.remove();
            // ИСПРАВЛЕНО: восстановить предыдущий контроллер
            try {
                if (prevController) {
                    Lampa.Controller.toggle(prevController);
                } else {
                    Lampa.Controller.toggle('content');
                }
            } catch (e) {}
        }

        // НОВОЕ: Зарегистрировать контроллер для Android TV пульта
        try {
            prevController = Lampa.Controller.enabled().name;
        } catch (e) {
            prevController = 'content';
        }

        Lampa.Controller.add('lampa_rating_modal', {
            toggle: function () {
                Lampa.Controller.own(this);
                // Сфокусировать первую/текущую звезду
                focusStar(focusedIndex);
            },
            left: function () {
                if (focusedIndex > 0) {
                    focusStar(focusedIndex - 1);
                }
            },
            right: function () {
                if (focusedIndex < starItems.length - 1) {
                    focusStar(focusedIndex + 1);
                }
            },
            up: function () {
                // Перемотка к максимуму
                focusStar(starItems.length - 1);
            },
            down: function () {
                // Перемотка к минимуму
                focusStar(0);
            },
            enter: function () {
                if (!canVoteNow) {
                    closeModal();
                    return;
                }
                var rating = focusedIndex + 1;
                currentRating = rating;
                highlightStars(rating);
                doVote(rating);
                setTimeout(closeModal, 800);
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

        // Закрыть по клику вне окна (мобильные)
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        // Escape
        function onKeyDown(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                closeModal();
                document.removeEventListener('keydown', onKeyDown);
            }
        }
        document.addEventListener('keydown', onKeyDown);
    }

    // -------------------------------------------------------
    // UI: кнопка «Оценить» в карточке
    // -------------------------------------------------------

    function injectVoteButton(render, card) {
        if (render.find('.view--lampa-vote').length) return;

        var iconStar =
            '' +
            '';

        var btn = $(
            '' +
            iconStar + 'Оценить'
        );

        btn.on('hover:enter click', function (e) {
            e.preventDefault();
            showVoteModal(card);
        });

        var moreBtn = render.find('.full-start__more, [data-subtitle="Ещё"], .view--more');
        if (moreBtn.length) {
            moreBtn.after(btn);
        } else {
            var playBtn = render.find('.full-start__play');
            if (playBtn.length) playBtn.after(btn);
            else render.append(btn);
        }
    }

    // -------------------------------------------------------
    // ИСПРАВЛЕНО: Настройки в разделе «Интерфейс»
    // -------------------------------------------------------

    function initSettings() {
        // Способ 1: через событие открытия настроек
        if (Lampa.Settings && Lampa.Settings.listener) {
            Lampa.Settings.listener.follow('open', function (e) {
                // Lampa использует 'interface' для раздела Интерфейс
                if (e.name !== 'interface' && e.name !== 'main') return;

                setTimeout(function () {
                    var body = e.body;
                    if (!body) return;

                    // Проверить что настройка ещё не добавлена
                    if (body.find('[data-name="lampa_rating_show"]').length) return;

                    var html =
                        '' +
                        'Рейтинги LAMPA на карточках' +
                        '' +
                        (settingEnabled() ? 'Показывать' : 'Скрыть') +
                        '';

                    var el = $(html);
                    el.on('hover:enter click', function () {
                        var current = Lampa.Storage.get('lampa_rating_show', 'true');
                        var newVal = (current === 'false' || current === false) ? 'true' : 'false';
                        Lampa.Storage.set('lampa_rating_show', newVal);
                        el.find('.settings-param__value').text(newVal === 'true' ? 'Показывать' : 'Скрыть');
                        Lampa.Noty.show('Настройка сохранена');
                    });

                    body.append(el);
                }, 100);
            });
        }

        // Способ 2: через Lampa.Params (если доступен)
        try {
            if (Lampa.Params && Lampa.Params.select) {
                Lampa.Params.select('lampa_rating_show', {
                    name: 'Рейтинги LAMPA',
                    values: { 'true': 'Показывать', 'false': 'Скрыть' },
                    'default': 'true'
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
        initLang();
        initSettings();

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var card = e.data && e.data.movie ? e.data.movie : null;
            if (!card) return;
            var render = e.object && e.object.activity ? e.object.activity.render() : null;
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