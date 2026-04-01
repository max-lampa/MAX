(function () {
    'use strict';
    var network = new Lampa.Reguest();
    var base_url = 'https://api.themoviedb.org/3';
    function getInterfaceLanguage() {
        var lang = Lampa.Storage.get('language', 'ru');
        if (lang === 'ru') return 'ru-RU';
        if (lang === 'uk') return 'uk-UA';
        return 'en-US';
    }
    function getShortLanguageCode() {
        var lang = Lampa.Storage.get('language', 'ru');
        return lang;
    }
    function applyWithoutKeywords(params) {
        var baseExcludedKeywords = [
            '346448', '158718', '4178', '196034', '272265', '13141', '345822', '315535', '290667', '323447', '290637', '290607', '290643', '290664',
            '210024', '222243', '287501', '290799', '315997', '317458', '327471', '335166', '338496', '338657', '338655', '338836', '342777', '344069', '344070'
        ];
        params.without_keywords = baseExcludedKeywords.join(',');
        return params;
    }
    function filterTMDBContentByGenre(content, category) {
        const allowedGenreIds = [28, 12, 16, 35, 80, 18, 10751, 14, 36, 27, 10402, 9648, '10749', 878, 53, 10752, 37];
        const disallowedGenreIds = [10763, 10767, '10770', 10764, 10766];
        const genreIds = content.genre_ids || [];
        const hasAllowedGenre = genreIds.some(id => allowedGenreIds.includes(id));
        const hasDisallowedGenre = genreIds.some(id => disallowedGenreIds.includes(id));
        const requiresRating = category !== 'upcoming_series' && (!content.release_date || new Date(content.release_date) <= new Date());
        const hasRating = !requiresRating || (content.vote_average && content.vote_average > 0);
        let isFutureRelease = true;
        if (category === 'upcoming_movies') {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const releaseDate = content.release_date || '9999-12-31';
            isFutureRelease = releaseDate >= todayStr;
            console.log('Checking release date for', content.title || content.name, 'release_date:', releaseDate, 'today:', todayStr, 'isFutureRelease:', isFutureRelease);
        }
        console.log('Filtering content:', content.title || content.name, 'genre_ids:', genreIds, 'hasAllowedGenre:', hasAllowedGenre, 'hasDisallowedGenre:', hasDisallowedGenre, 'vote_average:', content.vote_average, 'hasRating:', hasRating, 'requiresRating:', requiresRating, 'category:', category, 'isFutureRelease:', isFutureRelease);
        return hasAllowedGenre && !hasDisallowedGenre && hasRating && isFutureRelease;
    }
    function fetchTMDB(endpoint, params, resolve, reject) {
        var url = new URL(base_url + endpoint);
        params.api_key = Lampa.TMDB.key();
        params = applyWithoutKeywords(params);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        console.log('TMDB Request: ' + url.toString());
        network.silent(url.toString(), function (data) {
            if (!data || data.status_code) {
                console.log('TMDB Response error for ' + endpoint + ': ', data ? data.status_message : 'No data');
                reject(data ? new Error(data.status_message) : new Error('No response'));
                return;
            }
            console.log('TMDB Response for ' + endpoint + ': ', data);
            resolve(data);
        }, function (error) {
            console.log('TMDB Error for ' + endpoint + ': ', error);
            reject(error);
        });
    }
    function fetchSeriesDetails(seriesId, dateField, startDate, endDate, callback) {
        var endpoint = '/tv/' + seriesId;
        var params = { language: getInterfaceLanguage() };
        fetchTMDB(endpoint, params, function (data) {
            if (!data) {
                console.log('Series ' + seriesId + ' fetch failed: data is undefined');
                callback(false, 'N/A', 0, 0);
                return;
            }
            if (dateField === 'season_check') {
                var seasons = data.seasons || [];
                var futureSeasons = seasons.filter(season => season.air_date && new Date(season.air_date) > new Date() && season.air_date >= startDate && season.air_date <= endDate);
                var nextSeason = futureSeasons.length ? futureSeasons.reduce((earliest, current) => new Date(earliest.air_date) < new Date(current.air_date) ? earliest : current) : null;
                var airDate;
                var isValid = false;
                var seasonNumber = 0;
                var episodeNumber = 1; // Для "Скоро на ТБ" завжди перша серія
                if (nextSeason) {
                    airDate = nextSeason.air_date;
                    isValid = true;
                    seasonNumber = nextSeason.season_number;
                    console.log('Series ' + seriesId + ': Found future season, air_date:', airDate, 'season_number:', seasonNumber);
                } else if (data.next_episode_to_air && data.next_episode_to_air.air_date) {
                    var nextEpisodeDate = data.next_episode_to_air.air_date;
                    isValid = nextEpisodeDate >= startDate && nextEpisodeDate <= endDate;
                    airDate = nextEpisodeDate;
                    seasonNumber = data.next_episode_to_air.season_number;
                    console.log('Series ' + seriesId + ': Found next episode, air_date:', airDate, 'isValid:', isValid, 'season_number:', seasonNumber);
                } else if (futureSeasons.length > 0) {
                    airDate = futureSeasons[0].air_date; // Беремо найближчий майбутній сезон
                    isValid = true;
                    seasonNumber = futureSeasons[0].season_number;
                    console.log('Series ' + seriesId + ': Found future seasons, using first available, air_date:', airDate, 'season_number:', seasonNumber);
                } else {
                    airDate = 'N/A';
                    console.log('Series ' + seriesId + ': No future seasons or next episode found within range', startDate, 'to', endDate);
                }
                callback(isValid, airDate, seasonNumber, episodeNumber);
            } else {
                var seasons = data.seasons || [];
                var lastSeason = seasons.length ? seasons[seasons.length - 1] : null;
                if (lastSeason && lastSeason.season_number > 0) {
                    fetchTMDB(`/tv/${seriesId}/season/${lastSeason.season_number}`, params, function (seasonData) {
                        var episodes = seasonData.episodes || [];
                        var lastEpisode = episodes.length ? episodes[episodes.length - 1] : null;
                        var airDate = lastEpisode && lastEpisode.air_date ? lastEpisode.air_date : lastSeason.air_date || data.first_air_date;
                        var isWithinRange = airDate >= startDate && airDate <= endDate;
                        var seasonNumber = lastSeason.season_number;
                        var episodeNumber = lastEpisode ? lastEpisode.episode_number : 0;
                        console.log('Series ' + seriesId + ' first_episode_of_last_season:', airDate, 'is within range', startDate, 'to', endDate, ':', isWithinRange, 'season_number:', seasonNumber, 'episode_number:', episodeNumber);
                        callback(isWithinRange, airDate, seasonNumber, episodeNumber);
                    }, function () {
                        callback(false, data.first_air_date, 0, 0);
                    });
                } else {
                    callback(false, data.first_air_date, 0, 0);
                }
            }
        }, function () {
            callback(false, 'N/A', 0, 0);
        });
    }
    function get(endpoint, params, minItems, resolve, reject, category) {
        var results = [];
        var page = params.page || 1;
        var totalPages = 1;
        function fetchPage() {
            var currentParams = Object.assign({}, params, { page: page });
            fetchTMDB(endpoint, currentParams, function (data) {
                if (data.results) {
                    var filteredResults = data.results.filter(function (content) {
                        return filterTMDBContentByGenre(content, category);
                    });
                    if (category === 'new_series_seasons' || category === 'upcoming_series') {
                        var today = new Date();
                        var todayStr = today.toISOString().split('T')[0];
                        var sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(today.getMonth() - 6);
                        var sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
                        var threeMonthsLater = new Date();
                        threeMonthsLater.setDate(today.getDate() + 180);
                        var threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
                        var validResults = [];
                        if (filteredResults.length === 0) {
                            processResults(data, []);
                            return;
                        }
                        var promises = filteredResults.map(function (series) {
                            return new Promise(function (resolveDetail) {
                                var dateField = category === 'new_series_seasons' ? 'last_episode_to_air' : 'season_check';
                                var startDate = category === 'new_series_seasons' ? sixMonthsAgoStr : todayStr;
                                var endDate = category === 'new_series_seasons' ? todayStr : threeMonthsLaterStr;
                                fetchSeriesDetails(series.id, dateField, startDate, endDate, function (isValid, airDate, seasonNumber, episodeNumber) {
                                    if (isValid) {
                                        series.season_number = seasonNumber;
                                        series.episode_number = episodeNumber;
                                        validResults.push(series);
                                        console.log('Added series to upcoming_series:', series.name, 'air_date:', airDate, 'season:', seasonNumber, 'episode:', episodeNumber);
                                    } else {
                                        console.log('Filtered out series:', series.name, 'air_date:', airDate, 'reason: Not within 180 days or no upcoming episodes');
                                    }
                                    resolveDetail();
                                });
                            });
                        });
                        Promise.all(promises).then(function () {
                            validResults.sort(function (a, b) {
                                return b.popularity - a.popularity;
                            });
                            processResults(data, validResults);
                        });
                    } else {
                        processResults(data, filteredResults);
                    }
                } else {
                    resolve(data);
                }
            }, reject);
        }
        function processResults(data, filteredResults) {
            results = results.concat(filteredResults);
            console.log('Processed page ' + page + ' for ' + endpoint + ', category: ' + category + ', total results: ', results.length, 'results: ', results.map(r => r.title || r.name));
            totalPages = data.total_pages || 1;
            if (results.length >= minItems || page >= totalPages || page >= 30) {
                data.results = results.slice(0, minItems);
                console.log('Final results for ' + endpoint + ': ', data.results.length);
                resolve(data);
            } else {
                page++;
                fetchPage();
            }
        }
        fetchPage();
    }
    function main(oncomplite, onerror) {
        var status = new Lampa.Status(6);
        var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;
        var minItems = light ? 6 : 20;
        status.onComplite = function () {
            var fulldata = [];
            var categories = ['popular_movies', 'in_theaters', 'upcoming_movies', 'popular_series', 'new_series_seasons', 'upcoming_series'];
            categories.forEach(function (key) {
                if (status.data[key] && status.data[key].results && status.data[key].results.length) {
                    fulldata.push(status.data[key]);
                }
            });
            console.log('Main: Fetched categories with data: ', fulldata.map(d => d.type));
            if (fulldata.length) oncomplite(fulldata);
            else onerror();
        };
        var append = function (title, name, url, json) {
            json.title = title;
            json.type = name;
            json.url = url;
            status.append(name, json);
        };
        var today = new Date();
        var todayStr = today.toISOString().split('T')[0];
        var sixWeeksAgo = new Date();
        sixWeeksAgo.setDate(today.getDate() - 42);
        var sixWeeksAgoStr = sixWeeksAgo.toISOString().split('T')[0];
        var sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        var sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
        var threeMonthsLater = new Date();
        threeMonthsLater.setDate(today.getDate() + 180);
        var threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
        var twelveMonthsLater = new Date();
        twelveMonthsLater.setMonth(today.getMonth() + 12);
        var twelveMonthsLaterStr = twelveMonthsLater.toISOString().split('T')[0];
        var lang = getInterfaceLanguage();
        get('/trending/movie/week', { language: lang, page: 1 }, minItems, function (json) {
            append(Lampa.Lang.translate('new_trailers_popular_movies'), 'popular_movies', '/trending/movie/week', json);
        }, status.error.bind(status), 'popular_movies');
        get('/discover/movie', {
            language: lang,
            page: 1,
            include_adult: false,
            sort_by: 'primary_release_date.desc',
            'primary_release_date.gte': sixWeeksAgoStr,
            'primary_release_date.lte': todayStr,
            'vote_count.gte': 30,
            region: 'UA'
        }, minItems, function (json) {
            append(Lampa.Lang.translate('new_trailers_in_theaters'), 'in_theaters', '/discover/movie', json);
        }, status.error.bind(status), 'in_theaters');
        get('/movie/upcoming', {
            language: lang,
            page: 1,
            include_adult: false,
            sort_by: 'popularity.desc',
            'primary_release_date.gte': todayStr,
            'primary_release_date.lte': twelveMonthsLaterStr
        }, minItems, function (json) {
            append(Lampa.Lang.translate('new_trailers_upcoming_movies'), 'upcoming_movies', '/movie/upcoming', json);
        }, status.error.bind(status), 'upcoming_movies');
        get('/trending/tv/week', { language: lang, page: 1 }, minItems, function (json) {
            append(Lampa.Lang.translate('new_trailers_popular_series'), 'popular_series', '/trending/tv/week', json);
        }, status.error.bind(status), 'popular_series');
        get('/discover/tv', {
            language: lang,
            page: 1,
            include_adult: false,
            sort_by: 'popularity.desc',
            'air_date.gte': sixMonthsAgoStr,
            'air_date.lte': todayStr
        }, minItems, function (json) {
            append(Lampa.Lang.translate('new_trailers_new_series_seasons'), 'new_series_seasons', '/discover/tv', json);
        }, status.error.bind(status), 'new_series_seasons');
        get('/discover/tv', {
            language: lang,
            page: 1,
            include_adult: false,
            sort_by: 'popularity.desc',
            'air_date.gte': todayStr,
            'air_date.lte': threeMonthsLaterStr
        }, minItems, function (json) {
            var today = new Date();
            var todayStr = today.toISOString().split('T')[0];
            var threeMonthsLater = new Date();
            threeMonthsLater.setDate(today.getDate() + 180);
            var threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
            var validResults = [];
            if (json.results && json.results.length) {
                var promises = json.results.map(function (series) {
                    return new Promise(function (resolveDetail) {
                        fetchSeriesDetails(series.id, 'season_check', todayStr, threeMonthsLaterStr, function (isValid, airDate, seasonNumber, episodeNumber) {
                            if (isValid || (!series.first_air_date && airDate >= todayStr && airDate <= threeMonthsLaterStr)) {
                                series.season_number = seasonNumber;
                                series.episode_number = episodeNumber;
                                validResults.push(series);
                                console.log('Main: Added to upcoming_series:', series.name, 'air_date:', airDate, 'season:', seasonNumber, 'episode:', episodeNumber);
                            } else {
                                console.log('Main: Filtered out from upcoming_series:', series.name, 'air_date:', airDate, 'reason: Not within 180 days');
                            }
                            resolveDetail();
                        });
                    });
                });
                Promise.all(promises).then(function () {
                    validResults.sort(function (a, b) {
                        return b.popularity - a.popularity;
                    });
                    json.results = validResults.slice(0, minItems);
                    append(Lampa.Lang.translate('new_trailers_upcoming_series'), 'upcoming_series', '/discover/tv', json);
                });
            } else {
                append(Lampa.Lang.translate('new_trailers_upcoming_series'), 'upcoming_series', '/discover/tv', json);
            }
        }, status.error.bind(status), 'upcoming_series');
    }
    function full(params, oncomplite, onerror) {
        var lang = getInterfaceLanguage();
        var requestParams = { language: lang, page: params.page };
        if (params.url === '/discover/movie' || params.url === '/movie/upcoming' || params.url === '/discover/tv') {
            var today = new Date();
            var todayStr = today.toISOString().split('T')[0];
            var sixWeeksAgo = new Date();
            sixWeeksAgo.setDate(today.getDate() - 42);
            var sixWeeksAgoStr = sixWeeksAgo.toISOString().split('T')[0];
            var sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(today.getMonth() - 6);
            var sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
            var threeMonthsLater = new Date();
            threeMonthsLater.setDate(today.getDate() + 180);
            var threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
            var twelveMonthsLater = new Date();
            twelveMonthsLater.setMonth(today.getMonth() + 12);
            var twelveMonthsLaterStr = twelveMonthsLater.toISOString().split('T')[0];
            if (params.type === 'in_theaters') {
                requestParams = Object.assign(requestParams, {
                    include_adult: false,
                    sort_by: 'primary_release_date.desc',
                    'primary_release_date.gte': sixWeeksAgoStr,
                    'primary_release_date.lte': todayStr,
                    'vote_count.gte': 30,
                    region: 'UA'
                });
            } else if (params.type === 'upcoming_movies') {
                requestParams = Object.assign(requestParams, {
                    include_adult: false,
                    sort_by: 'popularity.desc',
                    'primary_release_date.gte': todayStr,
                    'primary_release_date.lte': twelveMonthsLaterStr
                });
            } else if (params.type === 'new_series_seasons') {
                requestParams = Object.assign(requestParams, {
                    include_adult: false,
                    sort_by: 'popularity.desc',
                    'air_date.gte': sixMonthsAgoStr,
                    'air_date.lte': todayStr
                });
            } else if (params.type === 'upcoming_series') {
                requestParams = Object.assign(requestParams, {
                    include_adult: false,
                    sort_by: 'popularity.desc',
                    'air_date.gte': todayStr,
                    'air_date.lte': threeMonthsLaterStr
                });
            }
        }
        get(params.url, requestParams, 20, oncomplite, onerror, params.type);
    }
    function videos(card, oncomplite, onerror) {
        var endpoint = (card.name ? '/tv/' : '/movie/') + card.id + '/videos';
        var interfaceLang = getInterfaceLanguage();
        fetchTMDB(endpoint, { language: interfaceLang }, function (data) {
            if (data.results && data.results.length) {
                oncomplite(data);
            } else {
                console.log('No trailers found for language ' + interfaceLang + ', trying English...');
                fetchTMDB(endpoint, { language: 'en-US' }, function (dataEn) {
                    oncomplite(dataEn);
                }, function (error) {
                    onerror(error);
                });
            }
        }, function (error) {
            onerror(error);
        });
    }
    function clear() {
        network.clear();
    }
    var NewApi = {
        get: get,
        main: main,
        full: full,
        videos: videos,
        clear: clear
    };
    function NewTrailer(data, params) {
        this.build = function () {
            var lang = getShortLanguageCode();
            var title = data.title || data.name;
            var originalTitle = data.original_title || data.original_name;
            var hasTranslation = lang === 'en' || (title !== originalTitle && title.trim() !== '');
            console.log('Checking translation for:', title, 'original:', originalTitle, 'lang:', lang, 'hasTranslation:', hasTranslation);
            if (!hasTranslation) return;
            this.card = Lampa.Template.get('new_trailer', {});
            this.img = this.card.find('img')[0];
            this.is_youtube = params.type === 'rating';
            this.card.find('.card__title').text(title);
            if (!this.is_youtube) {
                var releaseDate = (data.release_date || data.first_air_date || '0000').slice(0, 4);
                this.card.find('.card__details').text(releaseDate + ' - ' + (data.original_title || data.original_name));
            } else {
                this.card.find('.card__details').remove();
            }
            var premiereDate = data.release_date || data.first_air_date || 'N/A';
            var formattedDate = premiereDate !== 'N/A' ? premiereDate.split('-').reverse().join('-') : 'N/A';
            this.card.find('.card__view').append(`
                <div class="card__premiere-date" style="position: absolute; top: 0.5em; right: 0.5em; color: #fff; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 3px;">${formattedDate}</div>
            `);
            this.card.find('.card__view').append(`
                <div class="card__trailer-lang" style="position: absolute; top: 2.25em; right: 0.5em; color: #fff; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 3px;"></div>
            `);
            var rating = data.vote_average ? data.vote_average.toFixed(1) : '—';
            this.card.find('.card__view').append(`
                <div class="card__rating" style="position: absolute; bottom: 0.5em; right: 0.5em; color: #fff; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 3px;">${rating}</div>
            `);
            if (data.name && !this.is_youtube) {
                this.card.find('.card__view').append(`
                    <div class="card__season-episode" style="position: absolute; bottom: 0.5em; left: 0.5em; color: #fff; background: rgba(0,0,0,0.7); padding: 0.2em 0.5em; border-radius: 3px;">—</div>
                `);
                if (params.type === 'upcoming_series' && data.season_number && data.episode_number) {
                    this.card.find('.card__season-episode').text(`S${data.season_number}E${data.episode_number}`);
                }
                var today = new Date();
                var todayStr = today.toISOString().split('T')[0];
                var sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(today.getMonth() - 6);
                var sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];
                var threeMonthsLater = new Date();
                threeMonthsLater.setDate(today.getDate() + 180);
                var threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];
                var dateField = params.type === 'upcoming_series' ? 'season_check' : 'last_episode_to_air';
                var startDate = params.type === 'new_series_seasons' ? sixMonthsAgoStr : todayStr;
                var endDate = params.type === 'new_series_seasons' ? todayStr : threeMonthsLaterStr;
                fetchSeriesDetails(data.id, dateField, startDate, endDate, (isValid, airDate, seasonNumber, episodeNumber) => {
                    try {
                        if (seasonNumber > 0 && episodeNumber > 0) {
                            this.card.find('.card__season-episode').text(`S${seasonNumber}E${episodeNumber}`);
                        } else {
                            this.card.find('.card__season-episode').text('—');
                        }
                        if (params.type === 'new_series_seasons' || params.type === 'upcoming_series') {
                            premiereDate = airDate || 'N/A';
                            formattedDate = premiereDate !== 'N/A' ? premiereDate.split('-').reverse().join('-') : 'N/A';
                            this.card.find('.card__premiere-date').text(formattedDate);
                            console.log('Updated premiere date for', data.name, 'to', formattedDate);
                        }
                    } catch (e) {
                        console.log('Error updating season-episode for series ' + data.id + ': ', e);
                        this.card.find('.card__season-episode').text('—');
                    }
                });
            }
        };
        this.cardImgBackground = function (card_data) {
            if (Lampa.Storage.field('background')) {
                if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
                }
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : this.is_youtube ? 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg' : '';
            }
            return '';
        };
        this.image = function () {
            var _this = this;
            this.img.onload = function () {
                _this.card.addClass('card--loaded');
                _this.updateTrailerLanguage();
            };
            this.img.onerror = function () {
                _this.img.src = './img/img_broken.svg';
            };
        };
        this.updateTrailerLanguage = function () {
            var _this = this;
            NewApi.videos(data, function (videos) {
                var lang = '—';
                if (videos.results && videos.results.length) {
                    lang = videos.results[0].iso_639_1.toUpperCase();
                }
                _this.card.find('.card__trailer-lang').text(lang);
            }, function () {
                _this.card.find('.card__trailer-lang').text('—');
            });
        };
        this.play = function (id) {
            if (Lampa.Manifest.app_digital >= 183) {
                var item = {
                    title: Lampa.Utils.shortText(data.title || data.name, 50),
                    id: id,
                    youtube: true,
                    url: 'https://www.youtube.com/watch?v=' + id,
                    icon: '<img class="size-youtube" src="https://img.youtube.com/vi/' + id + '/default.jpg" />',
                    template: 'selectbox_icon'
                };
                Lampa.Player.play(item);
                Lampa.Player.playlist([item]);
            } else {
                Lampa.YouTube.play(id);
            }
        };
        this.create = function () {
            var _this2 = this;
            this.build();
            if (!this.card) return;
            this.card.on('hover:focus', function (e, is_mouse) {
                Lampa.Background.change(_this2.cardImgBackground(data));
                _this2.onFocus(e.target, data, is_mouse);
            }).on('hover:enter', function () {
                if (_this2.is_youtube) {
                    _this2.play(data.id);
                } else {
                    NewApi.videos(data, function (videos) {
                        if (videos.results && videos.results.length) {
                            _this2.play(videos.results[0].key);
                        } else {
                            Lampa.Noty.show(Lampa.Lang.translate('new_trailers_no_trailers'));
                        }
                    }, function () {
                        Lampa.Noty.show(Lampa.Lang.translate('new_trailers_no_trailers'));
                    });
                }
            }).on('hover:long', function () {
                if (!_this2.is_youtube) {
                    var items = [{ title: Lampa.Lang.translate('new_trailers_view'), view: true }];
                    Lampa.Loading.start(function () {
                        NewApi.clear();
                        Lampa.Loading.stop();
                    });
                    NewApi.videos(data, function (videos) {
                        Lampa.Loading.stop();
                        if (videos.results && videos.results.length) {
                            items.push({ title: Lampa.Lang.translate('new_title_trailers'), separator: true });
                            videos.results.forEach(function (video) {
                                items.push({ title: video.name + ' (' + video.iso_639_1.toUpperCase() + ')', id: video.key });
                            });
                        }
                        Lampa.Select.show({
                            title: Lampa.Lang.translate('title_action'),
                            items: items,
                            onSelect: function (item) {
                                Lampa.Controller.toggle('content');
                                if (item.view) {
                                    Lampa.Activity.push({
                                        url: '',
                                        component: 'full',
                                        id: data.id,
                                        method: data.name ? 'tv' : 'movie',
                                        card: data,
                                        source: 'tmdb'
                                    });
                                } else {
                                    _this2.play(item.id);
                                }
                            },
                            onBack: function () {
                                Lampa.Controller.toggle('content');
                            }
                        });
                    });
                } else if (Lampa.Search) {
                    Lampa.Select.show({
                        title: Lampa.Lang.translate('title_action'),
                        items: [{ title: Lampa.Lang.translate('search') }],
                        onSelect: function (item) {
                            Lampa.Controller.toggle('content');
                            Lampa.Search.open({ input: data.title || data.name });
                        },
                        onBack: function () {
                            Lampa.Controller.toggle('content');
                        }
                    });
                }
            });
            this.image();
        };
        this.destroy = function () {
            this.img.onerror = null;
            this.img.onload = null;
            this.img.src = '';
            this.card.remove();
            this.card = this.img = null;
        };
        this.visible = function () {
            if (this.visibled) return;
            if (params.type === 'rating') {
                this.img.src = 'https://img.youtube.com/vi/' + data.id + '/hqdefault.jpg';
            } else if (data.backdrop_path) {
                this.img.src = Lampa.Api.img(data.backdrop_path, 'w500');
            } else if (data.poster_path) {
                this.img.src = Lampa.Api.img(data.poster_path);
            } else {
                this.img.src = './img/img_broken.svg';
            }
            this.visibled = true;
        };
        this.render = function () {
            return this.card;
        };
    }
    function NewLine(data) {
        var content = Lampa.Template.get('items_line', { title: data.title });
        var body = content.find('.items-line__body');
        var scroll = new Lampa.Scroll({ horizontal: true, step: 600 });
        var light = Lampa.Storage.get('light_version', false) && window.innerWidth >= 767;
        var items = [];
        var active = 0;
        var more;
        var last;
        this.create = function () {
            scroll.render().find('.scroll__body').addClass('items-cards');
            content.find('.items-line__title').text(data.title);
            body.append(scroll.render());
            this.bind();
        };
        this.bind = function () {
            var maxItems = light ? 6 : data.results.length;
            data.results.slice(0, maxItems).forEach(this.append.bind(this));
            if (data.results.length > 0) this.more();
            Lampa.Layer.update();
        };
        this.cardImgBackground = function (card_data) {
            if (Lampa.Storage.field('background')) {
                if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
                }
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
            }
            return '';
        };
        this.append = function (element) {
            var _this = this;
            var card = new NewTrailer(element, { type: data.type });
            card.create();
            if (!card.render()) return;
            card.visible();
            card.onFocus = function (target, card_data, is_mouse) {
                last = target;
                active = items.indexOf(card);
                if (!is_mouse) scroll.update(items[active].render(), true);
                if (_this.onFocus) _this.onFocus(card_data);
            };
            scroll.append(card.render());
            items.push(card);
        };
        this.more = function () {
            more = Lampa.Template.get('more').addClass('more--new-trailers');
            more.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: data.url,
                    component: 'new_trailers_full',
                    type: data.type,
                    page: light ? 1 : 2
                });
            });
            more.on('hover:focus', function (e) {
                last = e.target;
                active = items.length;
                scroll.update(more, true);
            });
            scroll.append(more);
        };
        this.toggle = function () {
            var _this2 = this;
            Lampa.Controller.add('items_line', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
                },
                right: function () {
                    console.log('NewLine: Right navigation, active: ' + active + ', items length: ' + items.length);
                    if (active < items.length - 1) {
                        active++;
                        Navigator.move('right');
                        scroll.update(items[active].render(), true);
                        console.log('NewLine: Moved right to card, new active: ' + active);
                    } else if (active === items.length - 1) {
                        active = items.length;
                        scroll.update(more, true);
                        Lampa.Controller.collectionFocus(more[0], scroll.render());
                        console.log('NewLine: Moved right to More, new active: ' + active);
                    } else {
                        active = 0;
                        scroll.update(items[active].render(), true);
                        Lampa.Controller.collectionFocus(items[active].render()[0], scroll.render());
                        console.log('NewLine: Cycled right to first card, new active: ' + active);
                    }
                },
                left: function () {
                    console.log('NewLine: Left navigation, active: ' + active);
                    if (active > 0) {
                        active--;
                        if (active === items.length) {
                            scroll.update(items[items.length - 1].render(), true);
                            Lampa.Controller.collectionFocus(items[items.length - 1].render()[0], scroll.render());
                            console.log('NewLine: Moved left from More to last card, new active: ' + active);
                        } else {
                            Navigator.move('left');
                            scroll.update(items[active].render(), true);
                            console.log('NewLine: Moved left to card, new active: ' + active);
                        }
                    } else if (active === 0) {
                        active = items.length;
                        scroll.update(more, true);
                        Lampa.Controller.collectionFocus(more[0], scroll.render());
                        console.log('NewLine: Cycled left to More, new active: ' + active);
                    }
                },
                down: this.onDown,
                up: this.onUp,
                gone: function () {},
                back: this.onBack
            });
            Lampa.Controller.toggle('items_line');
        };
        this.render = function () {
            return content;
        };
        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            content.remove();
            more.remove();
            items = [];
        };
    }
    function NewComponent$1(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        var items = [];
        var html = $('<div></div>');
        var active = 0;
        var light = Lampa.Storage.field('light_version') && window.innerWidth >= 767;
        this.create = function () {
            NewApi.main(this.build.bind(this), this.empty.bind(this));
            return this.render();
        };
        this.empty = function () {
            var empty = new Lampa.Empty();
            html.append(empty.render());
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };
        this.build = function (data) {
            var _this = this;
            scroll.minus();
            html.append(scroll.render());
            data.forEach(function (element) {
                _this.append(element);
            });
            if (light) {
                scroll.onWheel = function (step) {
                    if (step > 0) _this.down();
                    else _this.up();
                };
            }
            this.activity.loader(false);
            this.activity.toggle();
        };
        this.append = function (element) {
            var item = new NewLine(element);
            item.create();
            item.onDown = this.down.bind(this);
            item.onUp = this.up.bind(this);
            item.onBack = this.back.bind(this);
            item.onToggle = function () {
                active = items.indexOf(item);
            };
            item.wrap = $('<div></div>');
            if (light) {
                scroll.append(item.wrap);
            } else {
                scroll.append(item.render());
            }
            items.push(item);
        };
        this.back = function () {
            Lampa.Activity.backward();
        };
        this.detach = function () {
            if (light) {
                items.forEach(function (item) {
                    item.render().detach();
                });
                items.slice(active, active + 2).forEach(function (item) {
                    item.wrap.append(item.render());
                });
            }
        };
        this.down = function () {
            active++;
            active = Math.min(active, items.length - 1);
            this.detach();
            items[active].toggle();
            scroll.update(items[active].render());
        };
        this.up = function () {
            active--;
            if (active < 0) {
                active = 0;
                this.detach();
                Lampa.Controller.toggle('head');
            } else {
                this.detach();
                items[active].toggle();
            }
            scroll.update(items[active].render());
        };
        this.start = function () {
            var _this2 = this;
            if (Lampa.Activity.active().activity !== this.activity) return;
            Lampa.Controller.add('content', {
                toggle: function () {
                    if (items.length) {
                        _this2.detach();
                        items[active].toggle();
                    }
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: this.back
            });
            Lampa.Controller.toggle('content');
        };
        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {
            return html;
        };
        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            html.remove();
            items = [];
        };
    }
    function NewComponent(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 250, end_ratio: 2 });
        var items = [];
        var html = $('<div></div>');
        var body = $('<div class="category-full category-full--new-trailers"></div>');
        var newlampa = Lampa.Manifest.app_digital >= 166;
        var light = newlampa ? false : Lampa.Storage.field('light_version') && window.innerWidth >= 767;
        var total_pages = 0;
        var last;
        var waitload;
        var active = 0;
        var seenIds = new Set();
        this.create = function () {
            NewApi.full(object, this.build.bind(this), this.empty.bind(this));
            return this.render();
        };
        this.empty = function () {
            var empty = new Lampa.Empty();
            scroll.append(empty.render());
            this.start = empty.start;
            this.activity.loader(false);
            this.activity.toggle();
        };
        this.next = function () {
            var _this = this;
            if (waitload) return;
            if (object.page < 30 && object.page < total_pages) {
                waitload = true;
                object.page++;
                NewApi.full(object, function (result) {
                    _this.append(result, true);
                    waitload = false;
                }, function () {});
            }
        };
        this.cardImgBackground = function (card_data) {
            if (Lampa.Storage.field('background')) {
                if (Lampa.Storage.get('background_type', 'complex') === 'poster' && window.innerWidth > 790) {
                    return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'original') : '';
                }
                return card_data.backdrop_path ? Lampa.Api.img(card_data.backdrop_path, 'w500') : '';
            }
            return '';
        };
        this.append = function (data, append) {
            var _this2 = this;
            data.results.forEach(function (element) {
                if (seenIds.has(element.id)) {
                    console.log('Duplicate card skipped:', element.title || element.name, 'ID:', element.id);
                    return;
                }
                var card = new NewTrailer(element, { type: object.type });
                card.create();
                if (!card.render()) return;
                card.visible();
                card.onFocus = function (target, card_data) {
                    last = target;
                    scroll.update(card.render(), true);
                    if (!light && !newlampa && scroll.isEnd()) _this2.next();
                };
                body.append(card.render());
                items.push(card);
                seenIds.add(element.id);
                if (append) Lampa.Controller.collectionAppend(card.render());
            });
        };
        this.build = function (data) {
            var _this3 = this;
            if (data.results && data.results.length) {
                total_pages = data.total_pages || 1;
                scroll.minus();
                html.append(scroll.render());
                this.append(data);
                if (light && items.length) this.back();
                if (total_pages > data.page && light && items.length) this.more();
                scroll.append(body);
                if (newlampa) {
                    scroll.onEnd = this.next.bind(this);
                    scroll.onWheel = function (step) {
                        if (!Lampa.Controller.own(_this3)) _this3.start();
                        if (step > 0) Navigator.move('down');
                        else if (active > 0) Navigator.move('up');
                    };
                }
                this.activity.loader(false);
                this.activity.toggle();
            } else if (object.page > 1) {
                var emptyMessage = $('<div class="empty__message" style="text-align: center; padding: 20px; color: #fff;">' + Lampa.Lang.translate('new_trailers_no_more_items') + '</div>');
                scroll.append(emptyMessage);
                this.activity.loader(false);
                this.activity.toggle();
            } else {
                html.append(scroll.render());
                this.empty();
            }
        };
        this.more = function () {
            var more = $('<div class="selector" style="width: 100%; height: 5px;"></div>');
            more.on('hover:focus', function (e) {
                Lampa.Controller.collectionFocus(last || false, scroll.render());
                var next = Lampa.Arrays.clone(object);
                delete next.activity;
                active = 0;
                next.page++;
                Lampa.Activity.push(next);
            });
            body.append(more);
        };
        this.back = function () {
            last = items[0] ? items[0].render()[0] : false;
            var more = $('<div class="selector" style="width: 100%; height: 5px;"></div>');
            more.on('hover:focus', function (e) {
                if (object.page > 1) {
                    Lampa.Activity.backward();
                } else {
                    Lampa.Controller.toggle('head');
                }
            });
            body.prepend(more);
        };
        this.start = function () {
            if (Lampa.Activity.active().activity !== this.activity) return;
            Lampa.Controller.add('content', {
                link: this,
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };
        this.pause = function () {};
        this.stop = function () {};
        this.render = function () {
            return html;
        };
        this.destroy = function () {
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            html.remove();
            body.remove();
            items = [];
            seenIds.clear();
        };
    }
    Lampa.Lang.add({
        new_trailers_popular_movies: { ru: 'Популярные фильмы', uk: 'Популярні фільми', en: 'Popular Movies' },
        new_trailers_in_theaters: { ru: 'В кинотеатрах', uk: 'У кінотеатрах', en: 'In Theaters' },
        new_trailers_upcoming_movies: { ru: 'Скоро в кино', uk: 'Скоро в кіно', en: 'Upcoming Movies' },
        new_trailers_popular_series: { ru: 'Популярные сериалы', uk: 'Популярні серіали', en: 'Popular Series' },
        new_trailers_new_series_seasons: { ru: 'Новые сериалы и сезоны', uk: 'Нові серіали і сезони', en: 'New Series and Seasons' },
        new_trailers_upcoming_series: { ru: 'Скоро на ТВ', uk: 'Скоро на ТБ', en: 'Upcoming Series' },
        new_trailers_no_trailers: { ru: 'Нет трейлеров', uk: 'Немає трейлерів', en: 'No trailers' },
        new_trailers_view: { ru: 'Подробнее', uk: 'Докладніше', en: 'Details' },
        new_title_trailers: { ru: 'Трейлер', uk: 'Трейлер', en: 'Trailer' },
        new_trailers_no_more_items: { ru: 'Больше фильмов нет', uk: 'Більше фільмів немає', en: 'No more movies' }
    });
    function startPlugin() {
        window.plugin_new_trailers_ready = true;
        Lampa.Component.add('new_trailers_main', NewComponent$1);
        Lampa.Component.add('new_trailers_full', NewComponent);
        Lampa.Template.add('new_trailer', `
            <div class="card selector card--new-trailer layer--render layer--visible">
                <div class="card__view">
                    <img src="./img/img_load.svg" class="card__img">
                    <div class="card__promo">
                        <div class="card__promo-text">
                            <div class="card__title"></div>
                        </div>
                        <div class="card__details"></div>
                    </div>
                </div>
                <div class="card__play">
                    <img src="./img/icons/player/play.svg" />
                </div>
            </div>
        `);
        Lampa.Template.add('new_trailer_style', `
            <style>
            .card.card--new-trailer,
            .card-more.more--new-trailers {
                width: 25.7em;
                box-sizing: border-box;
            }
            .card.card--new-trailer.selector:focus {
                outline: 2px solid #fff;
                transform: scale(1.05);
                z-index: 5;
                transition: transform 0.2s ease;
            }
            .card.card--new-trailer .card__view {
                padding-bottom: 56%;
                margin-bottom: 0;
                position: relative;
            }
            .card.card--new-trailer .card__promo {
                padding-bottom: 2em;
            }
            .card.card--new-trailer .card__promo-text {
                position: absolute;
                bottom: 3em;
                left: 0.5em;
                right: 0.5em;
            }
            .card.card--new-trailer .card__details {
                margin-top: 0.5em;
                position: absolute;
                bottom: 2em;
                left: 0.5em;
                right: 0.5em;
                color: rgba(255, 255, 255, 0.7);
            }
            .card.card--new-trailer .card__play {
                position: absolute;
                top: 1.4em;
                left: 1.5em;
                background: #000000b8;
                width: 2.2em;
                height: 2.2em;
                border-radius: 100%;
                text-align: center;
                padding-top: 0.6em;
            }
            .card.card--new-trailer .card__play img {
                width: 0.9em;
                height: 1em;
            }
            .card-more.more--new-trailers .card-more__box {
                padding-bottom: 56%;
            }
            .category-full--new-trailers .card {
                margin-bottom: 1.5em;
                width: 33.3%;
                box-sizing: border-box;
            }
            @media screen and (max-width: 767px) {
                .category-full--new-trailers .card {
                    width: 50%;
                }
            }
            @media screen and (max-width: 400px) {
                .category-full--new-trailers .card {
                    width: 100%;
                }
            }
            .card__premiere-date, .card__trailer-lang, .card__rating, .card__season-episode {
                font-size: 0.9em;
                z-index: 10;
            }
            .items-cards .selector {
                margin-right: 1.5em;
            }
            </style>
        `);
        function add() {
            var button = $(`<li class="menu__item selector">
                <div class="menu__ico">
                    <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/>
                    </svg>
                </div>
                <div class="menu__text">${Lampa.Lang.translate('new_title_trailers')}</div>
            </li>`);
            button.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('new_title_trailers'),
                    component: 'new_trailers_main',
                    page: 1
                });
            });
            $('.menu .menu__list').eq(0).append(button);
            $('body').append(Lampa.Template.get('new_trailer_style', {}, true));
        }
        if (window.appready) add();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') add();
            });
        }
    }
    if (!window.plugin_new_trailers_ready) startPlugin();
})();
