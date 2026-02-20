(function () {
    'use strict';

    // ===== НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ =====
    var CONFIG = {
        // Путь к папке с иконками (можно заменить на свой)
        pluginPath: 'https://raw.githubusercontent.com/FoxStudio24/lampa/main/Quality/',

        // Размеры бейджей (можно менять числа и единицы измерения)
        badgeHeightCard: '0.9em',      // высота на карточках
        badgeHeightDetails: '1.2em',   // высота на странице деталей
        gapCard: '0.2em',              // отступ между бейджами на карточке
        gapDetails: '0.3em',           // отступ на странице деталей
        topOffset: '0.3em',            // отступ сверху на карточке
        rightOffset: '0.3em',           // отступ справа на карточке
        enableLog: false                // выключить лог (если false)
    };

    // === СЛУЖЕБНЫЙ КОД (лучше не трогать) ===
    var cardBadgesCache = {};
    var pluginPath = CONFIG.pluginPath;

    var svgIcons = {
        '4K': pluginPath + 'Quality_ico/4K.svg',
        '2K': pluginPath + 'Quality_ico/2K.svg',
        'FULL HD': pluginPath + 'Quality_ico/FULL HD.svg',
        'HD': pluginPath + 'Quality_ico/HD.svg',
        'HDR': pluginPath + 'Quality_ico/HDR.svg',
        'Dolby Vision': pluginPath + 'Quality_ico/Dolby Vision.svg',
        '7.1': pluginPath + 'Quality_ico/7.1.svg',
        '5.1': pluginPath + 'Quality_ico/5.1.svg',
        '4.0': pluginPath + 'Quality_ico/4.0.svg',
        '2.0': pluginPath + 'Quality_ico/2.0.svg',
        'DUB': pluginPath + 'Quality_ico/DUB.svg'
    };

    function getBest(results) {
        var best = {
            resolution: null,
            hdr: false,
            dolbyVision: false,
            audio: null,
            dub: false
        };
        var resOrder = ['HD', 'FULL HD', '2K', '4K'];
        var audioOrder = ['2.0', '4.0', '5.1', '7.1'];
        var limit = Math.min(results.length, 20);

        for (var i = 0; i < limit; i++) {
            var item = results[i];
            var title = (item.Title || '').toLowerCase();
            var foundRes = null;

            if (title.indexOf('4k') >= 0 || title.indexOf('2160') >= 0 || title.indexOf('uhd') >= 0) foundRes = '4K';
            else if (title.indexOf('2k') >= 0 || title.indexOf('1440') >= 0) foundRes = '2K';
            else if (title.indexOf('1080') >= 0 || title.indexOf('fhd') >= 0 || title.indexOf('full hd') >= 0) foundRes = 'FULL HD';
            else if (title.indexOf('720') >= 0 || title.indexOf('hd') >= 0) foundRes = 'HD';

            if (foundRes && (!best.resolution || resOrder.indexOf(foundRes) > resOrder.indexOf(best.resolution))) {
                best.resolution = foundRes;
            }

            if (item.ffprobe && Array.isArray(item.ffprobe)) {
                item.ffprobe.forEach(function(stream) {
                    if (stream.codec_type === 'video') {
                        var h = parseInt(stream.height || 0);
                        var w = parseInt(stream.width || 0);
                        var res = null;
                        if (h >= 2160 || w >= 3840) res = '4K';
                        else if (h >= 1440 || w >= 2560) res = '2K';
                        else if (h >= 1080 || w >= 1920) res = 'FULL HD';
                        else if (h >= 720 || w >= 1280) res = 'HD';

                        if (res && (!best.resolution || resOrder.indexOf(res) > resOrder.indexOf(best.resolution))) {
                            best.resolution = res;
                        }

                        if (stream.side_data_list && JSON.stringify(stream.side_data_list).indexOf('Vision') >= 0) best.dolbyVision = true;
                        if (stream.color_transfer === 'smpte2084' || stream.color_transfer === 'arib-std-b67') best.hdr = true;
                    }
                    if (stream.codec_type === 'audio' && stream.channels) {
                        var ch = parseInt(stream.channels);
                        var aud = (ch >= 8) ? '7.1' : (ch >= 6) ? '5.1' : (ch >= 4) ? '4.0' : '2.0';
                        if (!best.audio || audioOrder.indexOf(aud) > audioOrder.indexOf(best.audio)) best.audio = aud;
                    }
                });
            }

            if (title.indexOf('vision') >= 0 || title.indexOf('dovi') >= 0) best.dolbyVision = true;
            if (title.indexOf('hdr') >= 0) best.hdr = true;
            if (title.indexOf('dub') >= 0 || title.indexOf('дубл') >= 0) best.dub = true;
        }

        if (best.dolbyVision) best.hdr = true;
        return best;
    }

    function createBadgeImg(type, isCard, index) {
        var iconPath = svgIcons[type];
        if (!iconPath) return '';
        var className = isCard ? 'card-quality-badge' : 'quality-badge';
        var delay = (index * 0.08) + 's';
        return '<div class="' + className + '" style="animation-delay: ' + delay + '"><img src="' + iconPath + '" draggable="false" oncontextmenu="return false;"></div>';
    }

    function addCardBadges(card, best) {
        if (card.find('.card-quality-badges').length) return;
        var badges = [];
        if (best.resolution) badges.push(createBadgeImg(best.resolution, true, badges.length));
        if (best.hdr) badges.push(createBadgeImg('HDR', true, badges.length));
        if (best.audio) badges.push(createBadgeImg(best.audio, true, badges.length));
        if (best.dub) badges.push(createBadgeImg('DUB', true, badges.length));
        if (best.dolbyVision) badges.push(createBadgeImg('Dolby Vision', true, badges.length));

        if (badges.length) {
            // Вставляем бейджи в контейнер постера (или можно сразу в card, но оставим как есть)
            card.find('.card__view').append('<div class="card-quality-badges">' + badges.join('') + '</div>');
        }
    }

    function processCards() {
        $('.card:not(.qb-processed)').addClass('qb-processed').each(function() {
            var card = $(this);
            var movie = card.data('item');
            if (movie && Lampa.Storage.field('parser_use')) {
                Lampa.Parser.get({
                    search: movie.title || movie.name,
                    movie: movie,
                    page: 1
                }, function(response) {
                    if (response && response.Results) addCardBadges(card, getBest(response.Results));
                });
            }
        });
    }

    Lampa.Listener.follow('full', function(e) {
        if (e.type !== 'complite') return;
        var details = $('.full-start-new__details');
        if (details.length) {
            if (!$('.quality-badges-container').length) details.after('<div class="quality-badges-container"></div>');

            Lampa.Parser.get({
                search: e.data.movie.title || e.data.movie.name,
                movie: e.data.movie,
                page: 1
            }, function(response) {
                if (response && response.Results) {
                    var best = getBest(response.Results);
                    var badges = [];
                    if (best.resolution) badges.push(createBadgeImg(best.resolution, false, badges.length));
                    if (best.hdr) badges.push(createBadgeImg('HDR', false, badges.length));
                    if (best.audio) badges.push(createBadgeImg(best.audio, false, badges.length));
                    if (best.dub) badges.push(createBadgeImg('DUB', false, badges.length));
                    if (best.dolbyVision) badges.push(createBadgeImg('Dolby Vision', false, badges.length));

                    $('.quality-badges-container').html(badges.join(''));
                }
            });
        }
    });

    setInterval(processCards, 3000);

    // Генерируем стили с учётом пользовательских размеров
    var style = `
        <style>
        /* Принудительное позиционирование для корректной работы с cardify */
        .card__view {
            position: relative !important;
        }
        .card-quality-badges {
            position: absolute;
            top: ${CONFIG.topOffset};
            right: ${CONFIG.rightOffset};
            display: flex;
            flex-direction: row;
            gap: ${CONFIG.gapCard};
            pointer-events: none;
            z-index: 999 !important;
        }
        .quality-badges-container {
            display: flex;
            gap: ${CONFIG.gapDetails};
            margin: 0 0 0.4em 0;
            min-height: 1.2em;
            pointer-events: none;
        }
        .quality-badge {
            height: ${CONFIG.badgeHeightDetails};
            opacity: 0;
            transform: translateY(8px);
            animation: qb_in 0.4s ease forwards;
        }
        .card-quality-badge {
            height: ${CONFIG.badgeHeightCard};
            opacity: 0;
            transform: translateY(5px);
            animation: qb_in 0.3s ease forwards;
        }
        @keyframes qb_in {
            to { opacity: 1; transform: translateY(0); }
        }
        .quality-badge img, .card-quality-badge img {
            height: 100%;
            width: auto;
            display: block;
        }
        .card-quality-badge img {
            filter: drop-shadow(0 1px 2px #000);
        }
        @media (max-width: 768px) {
            .quality-badges-container {
                gap: 0.25em;
                margin: 0 0 0.35em 0;
                min-height: 1em;
            }
            .quality-badge {
                height: 1em;
            }
            .card-quality-badges {
                top: 0.25em;
                right: 0.25em;
                gap: 0.18em;
            }
            .card-quality-badge {
                height: 0.75em;
            }
        }
        </style>
    `;

    $('body').append(style);
    if (CONFIG.enableLog) console.log('[QualityBadges] Запущен с настраиваемыми размерами');
})();