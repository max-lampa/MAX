(function () {
  'use strict';

  // Регистрация настроек в Lampa
  Lampa.Settings.listener.follow('open', function (e) {
    if (e.name == 'interface') {
      var size_item = $('<div class="settings-param selector" data-type="select" data-name="quality_badge_size">\
        <div class="settings-param__name">Размер иконок качества</div>\
        <div class="settings-param__value"></div>\
      </div>');
      
      var color_item = $('<div class="settings-param selector" data-type="select" data-name="quality_badge_color">\
        <div class="settings-param__name">Цвет иконок качества</div>\
        <div class="settings-param__value"></div>\
      </div>');
      
      e.body.find('[data-name="card_view"]').after(size_item, color_item);
      
      Lampa.Settings.serial(size_item);
      Lampa.Settings.serial(color_item);
    }
  });

  // Настройки по умолчанию
  Lampa.Storage.setDefault('quality_badge_size', 'medium');
  Lampa.Storage.setDefault('quality_badge_color', 'original');
  
  Lampa.Params.select('quality_badge_size', {
    'small': 'Маленький',
    'medium': 'Стандартный',
    'large': 'Большой'
  }, 'medium');

  Lampa.Params.select('quality_badge_color', {
    'original': 'Оригинальный',
    'gold': 'Золотой',
    'white': 'Белый'
  }, 'original');

  var pluginPath = 'https://raw.githubusercontent.com/FoxStudio24/lampa/main/Quality/';

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
    var best = { resolution: null, hdr: false, dolbyVision: false, audio: null, dub: false };
    var resOrder = ['HD', 'FULL HD', '2K', '4K'];
    var limit = Math.min(results.length, 20);
    for (var i = 0; i < limit; i++) {
      var item = results[i];
      var title = (item.Title || '').toLowerCase();
      var foundRes = null;
      if (title.indexOf('4k') >= 0 || title.indexOf('2160') >= 0 || title.indexOf('uhd') >= 0) foundRes = '4K';
      else if (title.indexOf('2k') >= 0 || title.indexOf('1440') >= 0) foundRes = '2K';
      else if (title.indexOf('1080') >= 0 || title.indexOf('fhd') >= 0 || title.indexOf('full hd') >= 0) foundRes = 'FULL HD';
      else if (title.indexOf('720') >= 0 || title.indexOf('hd') >= 0) foundRes = 'HD';
      if (foundRes && (!best.resolution || resOrder.indexOf(foundRes) > resOrder.indexOf(best.resolution))) best.resolution = foundRes;
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
    var sizeClass = 'qb-size-' + Lampa.Storage.field('quality_badge_size');
    var colorClass = 'qb-color-' + Lampa.Storage.field('quality_badge_color');
    return '<div class="' + className + ' ' + sizeClass + ' ' + colorClass + '" style="animation-delay: ' + (index * 0.08) + 's"><img src="' + iconPath + '"></div>';
  }

  function addCardBadges(card, best) {
    if (card.find('.card-quality-badges').length) return;
    var badges = [];
    if (best.resolution) badges.push(createBadgeImg(best.resolution, true, badges.length));
    if (best.hdr) badges.push(createBadgeImg('HDR', true, badges.length));
    if (best.dub) badges.push(createBadgeImg('DUB', true, badges.length));
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
    var description = $('.full-start-new__text');
    if (description.length) {
      $('.quality-badges-container').remove();
      description.after('<div class="quality-badges-container"></div>');
      Lampa.Parser.get({ search: e.data.movie.title || e.data.movie.name, movie: e.data.movie, page: 1 }, function(response) {
        if (response && response.Results) {
          var best = getBest(response.Results);
          var badges = [];
          if (best.resolution) badges.push(createBadgeImg(best.resolution, false, badges.length));
          if (best.hdr) badges.push(createBadgeImg('HDR', false, badges.length));
          if (best.dub) badges.push(createBadgeImg('DUB', false, badges.length));
          $('.quality-badges-container').html(badges.join(''));
        }
      });
    }
  });

  setInterval(processCards, 3000);

  var style = $('<style>\
    .quality-badges-container { display: flex; gap: 8px; margin: 10px 0; align-items: center; }\
    .card-quality-badges { position: absolute !important; top: 10px !important; right: 10px !important; display: flex !important; gap: 5px !important; z-index: 100 !important; pointer-events: none !important; }\
    \
    /* Настройки размеров */\
    .card-quality-badge.qb-size-small { height: 12px !important; }\
    .card-quality-badge.qb-size-medium { height: 18px !important; }\
    .card-quality-badge.qb-size-large { height: 24px !important; }\
    .quality-badge.qb-size-small { height: 20px !important; }\
    .quality-badge.qb-size-medium { height: 30px !important; }\
    .quality-badge.qb-size-large { height: 40px !important; }\
    \
    /* Настройки цветов */\
    .qb-color-white img { filter: brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.8)) !important; }\
    .qb-color-gold img { filter: sepia(1) saturate(5) hue-rotate(10deg) brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.8)) !important; }\
    .qb-color-original img { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)) !important; }\
    \
    .card-quality-badge img, .quality-badge img { height: 100% !important; width: auto !important; display: block !important; }\
    @keyframes qb_in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }\
    .card-quality-badge, .quality-badge { animation: qb_in 0.3s ease forwards; }\
  </style>');
  $('body').append(style);

})();
