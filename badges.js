// ==UserScript==
// @name         Кино-бейджи: Рейтинги и форматы
// @description  Добавляет на постеры информационные блейды с рейтингами TMDB, IMDb и техническими значками 4K, Dolby Atmos и т.д.
// @version      1.0.0
// @author       Мастер Плагинов
// @include      *
// ==/UserScript==

(function() {
    // Конфигурация плагина
    const pluginConfig = {
        id: 'kinobadges',
        name: 'Кино-бейджи: Рейтинги и форматы',
        version: '1.0.0',
        settings: {
            enabled: true,        // Включен ли плагин
            showTmdb: true,       // Показывать TMDB
            showImdb: true,       // Показывать IMDb
            showTech: true,       // Показывать технические значки (4K, Dolby)
        }
    };

    let isReady = false;

    // Основной класс плагина
    class KinoBadgesPlugin {
        constructor(config) {
            this.config = config;
            this.cache = new Map();
        }

        async init() {
            this.addSettingsToLampa();
            this.hookIntoMovieCards();
            console.log(`${this.config.name} v${this.config.version} инициализирован.`);
        }

        // Метод для добавления настроек в меню Lampa
        addSettingsToLampa() {
            if (typeof Lampa !== 'undefined' && Lampa.SettingsApi) {
                Lampa.SettingsApi.addComponent({
                    component: 'header',
                    name: this.config.name,
                    field: {
                        type: 'toggle',
                        name: `${this.config.id}_enabled`,
                        default: true,
                        onChange: (value) => { this.config.settings.enabled = value; }
                    }
                }, 0);
                console.log("Настройки плагина добавлены в Lampa.");
            } else {
                console.warn("Lampa.SettingsApi не найден. Настройки не будут добавлены.");
                setTimeout(() => this.addSettingsToLampa(), 1000);
            }
        }

        // Метод для внедрения в карточки фильмов
        hookIntoMovieCards() {
            if (typeof Lampa !== 'undefined' && Lampa.Listener) {
                Lampa.Listener.follow('full', (data) => {
                    if (!this.config.settings.enabled) return;
                    if (data && data.object && data.object.type === 'movie') this.showInfo({ card: data.object });
                });
                console.log("Плагин подключен к отрисовке карточек.");
            } else {
                console.warn("Lampa.Listener не найден. Повторная попытка...");
                setTimeout(() => this.hookIntoMovieCards(), 1000);
            }
        }

        async getMovieDetails(tmdbId) {
            if (this.cache.has(tmdbId)) return this.cache.get(tmdbId);
            try {
                const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=ваш_ключ_TMDB_API&append_to_response=external_ids,release_dates`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
                const data = await response.json();
                this.cache.set(tmdbId, data);
                return data;
            } catch (error) {
                console.error(`Ошибка при получении данных для TMDB ID ${tmdbId}:`, error);
                return null;
            }
        }

        async showInfo(object) {
            if (!object.card) {
                console.warn("Карточка фильма не найдена.");
                return;
            }

            const tmdbId = object.card.id;
            if (!tmdbId) {
                console.warn("TMDB ID не найден в объекте карточки.");
                return;
            }

            const movieData = await this.getMovieDetails(tmdbId);
            if (!movieData) {
                console.warn(`Не удалось получить данные для TMDB ID ${tmdbId}.`);
                return;
            }

            const tmdbRating = movieData.vote_average ? movieData.vote_average.toFixed(1) : 'Н/Д';
            const imdbId = movieData.imdb_id;
            let imdbRating = 'Н/Д';

            if (imdbId && imdbId !== 'Н/Д') {
                const imdbRatingData = await this.getIMDbRating(imdbId);
                imdbRating = imdbRatingData || 'Н/Д';
            } else {
                console.warn(`IMDb ID не найден для TMDB ID ${tmdbId}.`);
            }

            const badgeHtml = this.createBadgesHtml(tmdbRating, imdbRating);
            this.injectBadgesToCard(object.card, badgeHtml);
        }

        async getIMDbRating(imdbId) {
            try {
                const url = `https://www.omdbapi.com/?apikey=ваш_ключ_API_OMDB&i=${imdbId}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
                const data = await response.json();
                return data.imdbRating !== 'N/A' ? data.imdbRating : 'Н/Д';
            } catch (error) {
                console.error(`Ошибка при получении рейтинга IMDb для ID ${imdbId}:`, error);
                return 'Н/Д';
            }
        }

        createBadgesHtml(tmdbRating, imdbRating) {
            let badges = '';
            if (this.config.settings.showTmdb) badges += `<div class="movie-badge tmdb-badge">TMDB ${tmdbRating}</div>`;
            if (this.config.settings.showImdb) badges += `<div class="movie-badge imdb-badge">IMDb ${imdbRating}</div>`;
            if (this.config.settings.showTech) badges += `<div class="movie-badge tech-badge">4K Dolby Vision Atmos REMUX</div>`;
            return badges ? `<div class="movie-badges">${badges}</div>` : '';
        }

        injectBadgesToCard(cardElement, badgeHtml) {
            if (!cardElement || !badgeHtml) return;

            const existingBadgesContainer = cardElement.querySelector('.movie-badges');
            if (existingBadgesContainer) existingBadgesContainer.remove();

            const posterContainer = cardElement.querySelector('.poster-container');
            if (posterContainer) {
                posterContainer.insertAdjacentHTML('beforeend', badgeHtml);
            } else {
                cardElement.insertAdjacentHTML('afterbegin', badgeHtml);
            }

            this.addStyles();
        }

        addStyles() {
            if (document.getElementById('kinobadges-styles')) return;

            const style = document.createElement('style');
            style.id = 'kinobadges-styles';
            style.textContent = `
                .movie-badges {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 5px;
                }
                .movie-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: bold;
                    color: white;
                    text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
                }
                .tmdb-badge { background-color: rgba(1, 180, 228, 0.9); }
                .imdb-badge { background-color: rgba(245, 197, 24, 0.9); color: #000; text-shadow: 1px 1px 0 rgba(255,255,255,0.5);}
                .tech-badge { background-color: rgba(0, 0, 0, 0.7); border: 1px solid rgba(255,255,255,0.3);}
            `;
            document.head.appendChild(style);
        }
    }

    // Функция для ожидания готовности Lampa и инициализации плагина
    function waitForLampa() {
        if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.SettingsApi) {
            if (!isReady) {
                isReady = true;
                const plugin = new KinoBadgesPlugin(pluginConfig);
                plugin.init();
            }
        } else {
            setTimeout(waitForLampa, 300);
        }
    }

    waitForLampa();
})();