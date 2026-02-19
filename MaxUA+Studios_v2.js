(function () {
  'use strict';

  var pluginPath = 'https://crowley38.github.io/Icons/';
  
  // Додаємо налаштування в Lampa (за замовчуванням увімкнено)
  if (Lampa.Storage.get('applecation_show_studio') === null) {
      Lampa.Storage.set('applecation_show_studio', true);
  }

  var svgIcons = {
    '4K': pluginPath + '4K.svg',
    '2K': pluginPath + '2K.svg',
    'FULL HD': pluginPath + 'FULL HD.svg',
    'HD': pluginPath + 'HD.svg',
    'HDR': pluginPath + 'HDR.svg',
    'Dolby Vision': pluginPath + 'Dolby Vision.svg',
    '7.1': pluginPath + '7.1.svg',
    '5.1': pluginPath + '5.1.svg',
    '4.0': pluginPath + '4.0.svg',
    '2.0': pluginPath + '2.0.svg',
    'DUB': pluginPath + 'DUB.svg',
    'UKR': pluginPath + 'UKR.svg'
  };

  // Функція обробки та рендеру логотипів студій/мереж
  function renderStudioLogos(container, data) {
    var showStudio = Lampa.Storage.get('applecation_show_studio');
    if (showStudio === false || showStudio === 'false') return;

    var logos = [];
    var sources = [data.networks, data.production_companies];

    sources.forEach(function(source) {
      if (source && source.length) {
        source.forEach(function(item) {
          if (item.logo_path) {
            var logoUrl = Lampa.Api.img(item.logo_path, 'w200');
            // Перевіряємо чи вже додали цей логотип (щоб не дублювати)
            if (!logos.find(function(l) { return l.url === logoUrl; })) {
                logos.push({ url: logoUrl, name: item.name });
            }
          }
        });
      }
    });

    logos.forEach(function(logo) {
      var imgId = 'logo_' + Math.random().toString(36).substr(2, 9);
      var html = '<div class="quality-badge studio-logo" id="' + imgId + '">' +
                   '<img src="' + logo.url + '" title="' + logo.name + '" style="height: 1.8em; width: auto; opacity: 1;">' +
                 '</div>';
      container.append(html);

      // Аналіз яскравості
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;
        ctx.drawImage(this, 0, 0);

        try {
          var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var pixels = imageData.data;
          var r = 0, g = 0, b = 0, pixelCount = 0, darkPixelCount = 0;

          for (var i = 0; i < pixels.length; i += 4) {
            var alpha = pixels[i + 3];
            if (alpha > 50) { // ігноруємо прозорість
              var brightness = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
              r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2];
              pixelCount++;
              if (brightness < 25) darkPixelCount++;
            }
          }

          if (pixelCount > 0) {
            var avgBrightness = (0.299 * (r/pixelCount) + 0.587 * (g/pixelCount) + 0.114 * (b/pixelCount));
            var darkRatio = darkPixelCount / pixelCount;

            // Якщо логотип занадто темний для чорного фону — інвертуємо
            if (avgBrightness < 30 && darkRatio > 0.6) {
              $('#' + imgId + ' img').css({
                'filter': 'brightness(0) invert(1) contrast(1.2)',
                'opacity': '0.9'
              });
            }
          }
        } catch (e) { console.log('Quality Plugin: Canvas error', e); }
      };
      img.src = logo.url;
    });
  }

  function getBest(results) {
    var best = { resolution: null, hdr: false, dolbyVision: false, audio: null, dub: false, ukr: false };
    var resOrder = ['HD', 'FULL HD', '2K', '4K'];
    var audioOrder = ['2.0', '4.0', '5.1', '7.1'];
    
    var limit = Math.min(results.length, 20);
    for (var i = 0; i < limit; i++) {
      var item = results[i];
      var title = (item.Title || '').toLowerCase();

      if (title.indexOf('ukr') >= 0 || title.indexOf('укр') >= 0 || title.indexOf('ua') >= 0) best.ukr = true;

      var foundRes = null;
      if (title.indexOf('4k') >= 0 || title.indexOf('2160') >= 0 || title.indexOf('uhd') >= 0) foundRes = '4K';
      else if (title.indexOf('2k') >= 0 || title.indexOf('1440') >= 0) foundRes = '2K';
      else if (title.indexOf('1080') >= 0 || title.indexOf('fhd') >= 0 || title.indexOf('full hd') >= 0) foundRes = 'FULL HD';
      else if (title.indexOf('720') >= 0 || title.indexOf('hd') >= 0) foundRes = 'HD';

      if (foundRes && (!best.resolution || resOrder.indexOf(foundRes) > resOrder.indexOf(best.resolution))) best.resolution = foundRes;

      if (item.ffprobe && Array.isArray(item.ffprobe)) {
        item.ffprobe.forEach(function(stream) {
          if (stream.codec_type === 'video') {
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
      if (title.indexOf('vision') >= 0 || title.indexOf('dovi') >= 0 || title.indexOf(' dv ') >= 0) best.dolbyVision = true;
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
    return '<div class="' + className + '" style="animation-delay: ' + delay + '"><img src="' + iconPath + '" draggable="false"></div>';
  }

  function addCardBadges(card, best) {
    if (card.find('.card-quality-badges').length) return;
    var badges = [];
    if (best.ukr) badges.push(createBadgeImg('UKR', true, badges.length));
    if (best.resolution) badges.push(createBadgeImg(best.resolution, true, badges.length));
    if (badges.length) card.find('.card__view').append('<div class="card-quality-badges">' + badges.join('') + '</div>');
  }

  function processCards() {
    $('.card:not(.qb-processed)').addClass('qb-processed').each(function() {
      var card = $(this);
      var movie = card.data('item');
      if (movie && Lampa.Storage.field('parser_use')) {
        Lampa.Parser.get({ search: movie.title || movie.name, movie: movie, page: 1 }, function(response) {
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
        var container = $('.quality-badges-container');
        container.empty();
        
        // Виклик нової функції для логотипів студій та мереж
        renderStudioLogos(container, e.data.movie);

        Lampa.Parser.get({ search: e.data.movie.title || e.data.movie.name, movie: e.data.movie, page: 1 }, function(response) {
            if (response && response.Results) {
                var best = getBest(response.Results);
                var badges = [];
                if (best.ukr) badges.push(createBadgeImg('UKR', false, badges.length));
                if (best.resolution) badges.push(createBadgeImg(best.resolution, false, badges.length));
                if (best.dolbyVision) badges.push(createBadgeImg('Dolby Vision', false, badges.length));
                if (best.hdr) badges.push(createBadgeImg('HDR', false, badges.length));
                if (best.audio) badges.push(createBadgeImg(best.audio, false, badges.length));
                if (best.dub) badges.push(createBadgeImg('DUB', false, badges.length));
                container.append(badges.join(''));
            }
        });
    }
  });

  setInterval(processCards, 3000);

  var style = '<style>\
    .quality-badges-container { display: flex; align-items: center; gap: 0.8em; margin: 0.8em 0; min-height: 2em; flex-wrap: wrap; }\
    .quality-badge { height: 1.3em; opacity: 0; transform: translateY(8px); animation: qb_in 0.4s ease forwards; display: flex; align-items: center; }\
    .studio-logo { height: 1.8em !important; margin-right: 4px; }\
    .card-quality-badges { position: absolute; top: 0.3em; right: 0.3em; display: flex; flex-direction: row; gap: 0.2em; pointer-events: none; z-index: 5; }\
    .card-quality-badge { height: 0.9em; opacity: 0; transform: translateY(5px); animation: qb_in 0.3s ease forwards; }\
    @keyframes qb_in { to { opacity: 1; transform: translateY(0); } }\
    .quality-badge img, .card-quality-badge img { height: 100%; width: auto; display: block; }\
    .card-quality-badge img { filter: drop-shadow(0 1px 2px #000); }\
  </style>';
  $('body').append(style);

})();
