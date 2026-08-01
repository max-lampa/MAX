// =========================================
// Радіо для Lampa
// Версія: 1.5.0 | 2026.07.26
// Опис: Плагін для прослуховування радіостанцій
// Aвтор - @ne3nayskas 
// =========================================

(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }

  // =========================================
  // СТАТИЧНИЙ СПИСОК УКРАЇНСЬКИХ СТАНЦІЙ
  // =========================================
  
  var UKRAINIAN_STATIONS = [
    {
      id: 'ukrradio',
      title: 'Українське Радіо',
      tooltip: 'UR1 Українське Радіо',
      stream: 'http://radio.ukr.radio/ur1-mp3',
      bg_image_mobile: 'https://cdn-profiles.tunein.com/s20311/images/logog.png',
      genre: [{ id: 'news', name: 'Новини' }]
    },
    {
      id: 'radiopromin',
      title: 'Радіо Промінь',
      tooltip: 'UR2 Радіо Промінь',
      stream: 'http://radio.ukr.radio/ur2-mp3',
      bg_image_mobile: 'https://static2.mytuner.mobi/media/tvos_radios/001/radio-promin-radio-promin.e8cbf570.jpg',
      genre: [{ id: 'ukr', name: 'Українське' }]
    },
    {
      id: 'radioculture',
      title: 'Радіо Культура',
      tooltip: 'UR3 Радіо Культура',
      stream: 'http://radio.ukr.radio/ur3-mp3',
      bg_image_mobile: 'https://savaryna.com/assets/images/blog/blog-10-20-03-10/blog-post-img-00.png',
      genre: [{ id: 'culture', name: 'Культура' }]
    },
    {
      id: 'pryamyi',
      title: 'Прямий FM',
      tooltip: 'Прямий. Новини',
      stream: 'https://cast.mediaonline.net.ua/prmfm',
      bg_image_mobile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZsNJiUSAS15iNFsj7YZQohEOmpLNssOD8Q11XxRka3o5thLkeEvFqf90_&s=10',
      genre: [{ id: 'news', name: 'Новини' }]
    },
    {
      id: 'edyninovyny',
      title: 'Єдині Новини',
      tooltip: 'Телемарафон',
      stream: 'https://online-news.radioplayer.ua/RadioNews',
      bg_image_mobile: 'https://static.mytuner.mobi/media/tvos_radios/ax5tb3vsm68z.png',
      genre: [{ id: 'news', name: 'Новини' }]
    },
    {
      id: 'replaynews',
      title: 'Replay News UA',
      tooltip: 'Новини кожні п’ять хвилин 24/7',
      stream: 'https://replaynewsuk.ice.infomaniak.ch/replaynewsuk-128.mp3',
      bg_image_mobile: 'https://static2.mytuner.mobi/media/tvos_radios/081/replay-news-ukrainian.6e66ec8c.png',
      genre: [{ id: 'news', name: 'Новини' }]
    },
    {
      id: 'radiobayraktar',
      title: 'Radio Bayraktar',
      tooltip: 'Музика української перемоги',
      stream: 'https://tavr.tvstitch.com/RadioBayraktar',
      bg_image_mobile: 'https://cdn-profiles.tunein.com/s124167/images/logog.png',
      genre: [{ id: 'ukr', name: 'Українське' }]
    },
    {
      id: 'radioroks',
      title: 'Radio ROKS',
      tooltip: 'Рок. Тільки рок.',
      stream: 'https://online.radioroks.ua/RadioROKS',
      bg_image_mobile: 'https://cdn-profiles.tunein.com/s103802/images/logog.png',
      genre: [{ id: 'rock', name: 'Rock' }]
    },
    {
      id: 'radioroks_ukr',
      title: 'Radio ROKS Український Рок',
      tooltip: 'Український Рок',
      stream: 'https://online.radioroks.ua/RadioROKS_Ukr',
      bg_image_mobile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtesQsQ5DBskK3mqAQiz5BwOuJmdzvh5F-G1bMtwzpzYgFGx3K90E-7F0&s=10',
      genre: [{ id: 'rock', name: 'Rock' }]
    },
    {
      id: 'radioroks_newrock',
      title: 'Radio ROKS New Rock',
      tooltip: 'New Rock',
      stream: 'https://online.radioroks.ua/RadioROKS_NewRock',
      bg_image_mobile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJCTnhKqQKrfWvVb2XkTZ3mTbjWPxQnZjeQJ8ombhwyr3ISwRtYS0GEaE&s=10',
      genre: [{ id: 'rock', name: 'Rock' }]
    },
    {
      id: 'radioroks_heavy',
      title: 'Radio ROKS Hard & Heavy',
      tooltip: 'Hard & Heavy',
      stream: 'https://online.radioroks.ua/RadioROKS_HardnHeavy',
      bg_image_mobile: 'https://static2.mytuner.mobi/media/tvos_radios/zzbcb8umtadm.webp',
      genre: [{ id: 'rock', name: 'Rock' }]
    },
    {
      id: 'radioroks_ballads',
      title: 'Radio ROKS Ballads',
      tooltip: 'Ballads',
      stream: 'https://online.radioroks.ua/RadioROKS_Ballads',
      bg_image_mobile: 'https://cdn-profiles.tunein.com/s212936/images/logog.png?t=636403',
      genre: [{ id: 'rock', name: 'Rock' }]
    },
    {
      id: 'rock_radio_ua',
      title: 'Рок Радіо UA',
      tooltip: 'Територія українського року.',
      stream: 'https://rockradioua.online:8433/rock_256',
      bg_image_mobile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSviXbB8x79o-23_8n7vvhVsjtdg3hz1uCR-rENRXV5D25-Y9K1Anrz1adD&s=10',
      genre: [{ id: 'rock', name: 'Rock' }]
    },
    {
      id: 'rock_radio_metal',
      title: 'Рок Радіо Metal',
      tooltip: 'Територія українського металу.',
      stream: 'https://rockradioua.online:8433/metal_256',
      bg_image_mobile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmbRsscUXNQ-xEezj9iumfLlCdlrLuAmawsz0sC97XROMHkupdLCViPKo&s=10',
      genre: [{ id: 'rock', name: 'Rock' }]
    },
    {
      id: 'djfm',
      title: 'Dj FM',
      tooltip: 'Твій діджей завжди з тобою!',
      stream: 'https://cast.brg.ua/djfm_main_public_mp3_hq',
      bg_image_mobile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ--8_GgyNF76-me7Y792ex_F8nGIMDKU1wqL1xQYZD083a4jdWOeVDMVY&s=10',
      genre: [{ id: 'dance', name: 'Dance' }]
    },
    {
      id: 'kissfm',
      title: 'Kiss FM',
      tooltip: 'The Best Dance Radio',
      stream: 'https://online.kissfm.ua/KissFM_HD',
      bg_image_mobile: 'https://static2.mytuner.mobi/media/tvos_radios/96yXWbMDkH.png',
      genre: [{ id: 'dance', name: 'Dance' }]
    },
    {
      id: 'kissfm_ukr',
      title: 'Kiss FM (Україна)',
      tooltip: 'Тільки український Dance',
      stream: 'https://online.kissfm.ua/KissFM_Ukr_HD',
      bg_image_mobile: 'https://dvw7f7sqjk3ag.cloudfront.net/images/radio/59463.jpg',
      genre: [{ id: 'dance', name: 'Dance' }]
    },
    {
      id: 'nostalgie',
      title: 'Nostalgie Україна',
      tooltip: 'Скоро перемога! Радіо Ностальжі Україна',
      stream: 'https://lux.radio.tvstitch.com/kyiv/nst_adv_hd',
      bg_image_mobile: 'https://static.mytuner.mobi/media/tvos_radios/ezzpmbnsag7h.png',
      genre: [{ id: 'nst', name: 'Nostalgie' }]
    },
    {
      id: 'avtoradioua',
      title: 'Avtoradio Ukraine',
      tooltip: 'Авторадіо Україна - твій рух вперед!',
      stream: 'https://cast.mediaonline.net.ua/avtoradio',
      bg_image_mobile: 'https://images.seeklogo.com/logo-png/47/2/avtoradio-ukraine-logo-png_seeklogo-474663.png',
      genre: [{ id: 'ukr', name: 'Українське' }]
    },
    {
      id: '109fm',
      title: '109 FM Ukraine',
      tooltip: 'Stand With Ukraine',
      stream: 'http://solid48.streamupsolutions.com:8077/109fm_live',
      bg_image_mobile: 'https://pbs.twimg.com/profile_images/655761683911081984/U2R0dNJn_400x400.png',
      genre: [{ id: 'ukr', name: 'Українське' }]
    },
    {
      id: 'urcradio',
      title: 'URC Radio US',
      tooltip: 'Інноваційне медіа, яке об’єднує українців',
      stream: 'https://streamer.radio.co/sdff2fd6a8/listen',
      bg_image_mobile: 'https://play-lh.googleusercontent.com/IESZkp0TDY8ihjm1V6Uwg3Pc83vjzJG4CzHzNohHUte-EqRk3A-zaiDW7eKbucI5CNp1LNn0i9sd6FzVqTia1w',
      genre: [{ id: 'ukr', name: 'Українське' }]
    },
    {
      id: 'studradio',
      title: 'STUD RADIO',
      tooltip: 'Independent Student Radio from Ukraine',
      stream: 'https://stream.mjoy.ua:8443/kredens-cafe-radio_mp3',
      bg_image_mobile: 'https://static.mytuner.mobi/media/tvos_radios/rwejrfrxghk4.png',
      genre: [{ id: 'ukr', name: 'Українське' }]
    },
    {
      id: 'nrj',
      title: 'NRJ Україна',
      tooltip: 'Енергія музики',
      stream: 'https://cast.mediaonline.net.ua/nrj320',
      bg_image_mobile: 'https://upload.wikimedia.org/wikipedia/commons/4/44/NRJ_Radio.png',
      genre: [{ id: 'pop', name: 'Pop' }]
    },
    {
      id: 'luxfm',
      title: 'Lux FM',
      tooltip: 'Включай настрій!',
      stream: 'https://lux.radio.tvstitch.com/rock-24-sd?npa=1',
      bg_image_mobile: 'https://cdn-profiles.tunein.com/s55142/images/logog.png?t=1',
      genre: [{ id: 'pop', name: 'Pop' }]
    },
    {
      id: 'radioindie',
      title: 'Radio Indie UA',
      tooltip: 'Незалежна музика',
      stream: 'https://online.radioplayer.ua/RadioIndieUA',
      bg_image_mobile: 'https://play.tavr.media/static/image/header_menu/Radio_IndieUA_logo_220x220.png',
      genre: [{ id: 'indie', name: 'Indie' }]
    },
    {
      id: 'regenbogen2',
      title: 'REGENBOGEN 2 Indie-Rock',
      tooltip: 'Maximum Indie Rock',
      stream: 'https://stream.regenbogen2.de/indierock/mp3-128/',
      bg_image_mobile: 'https://www.radio.de/300/rockfmdeindierock.png?version=130d3f79207dc7bced9de4728875013916422e13',
      genre: [{ id: 'indie', name: 'Indie' }]
    },
    {
      id: 'melodiafm',
      title: 'Мелодія FM',
      tooltip: 'Найкращі хіти 90-х і 2000-х!',
      stream: 'https://tavr.tvstitch.com/MelodiaFM',
      bg_image_mobile: 'https://static.radioplayer.ua/radioplayer/logo/melodiafm/logo_melodiafm.png',
      genre: [{ id: 'nst', name: 'Nostalgie' }]
    },
    {
      id: 'hitfm',
      title: 'Хіт FM',
      tooltip: 'Найкращі хіти',
      stream: 'https://online.hitfm.ua/HitFM',
      bg_image_mobile: 'https://static2.mytuner.mobi/media/tvos_radios/9tfwwwb9hkc2.png',
      genre: [{ id: 'pop', name: 'Pop' }]
    },
    {
      id: 'hitfm_ukr',
      title: 'Хіт FM Українські Хіти',
      tooltip: 'Тільки українські хіти',
      stream: 'https://online.hitfm.ua/HitFM_Ukr',
      bg_image_mobile: 'https://cdn-profiles.tunein.com/s6122/images/logog.png',
      genre: [{ id: 'pop', name: 'Pop' }]
    },
    {
      id: 'nasheradio',
      title: 'Наше Радіо',
      tooltip: 'Все буде добре',
      stream: 'https://online.nasheradio.ua/NasheRadio',
      bg_image_mobile: 'https://cdn-profiles.tunein.com/s9542/images/logog.jpg',
      genre: [{ id: 'pop', name: 'Pop' }]
    },
    {
      id: 'radiorelax',
      title: 'Radio Relax',
      tooltip: 'Музика для відпочинку',
      stream: 'https://online.radiorelax.ua/RadioRelax',
      bg_image_mobile: 'https://static2.mytuner.mobi/media/tvos_radios/nzlwtbcukj7y.png',
      genre: [{ id: 'relax', name: 'Relax' }]
    },
    {
      id: 'wandafm',
      title: 'Ванда FM',
      tooltip: 'Радіо чарівного настрою',
      stream: 'https://icecast.xtvmedia.pp.ua/radiowandafm_HD.mp3',
      bg_image_mobile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFEHRN_KEOoJzpO0rTB2eMWoZrPLf1rBevOTsA_jQ4cGLjahEnMWhbT30&s=10',
      genre: [{ id: 'pop', name: 'Pop' }]
    },
    {
      id: 'radiojazz',
      title: 'RadioJazz',
      tooltip: 'Джазова хвиля',
      stream: 'https://online.radiojazz.ua/RadioJazz_Gold',
      bg_image_mobile: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Radio_Jazz.svg/1280px-Radio_Jazz.svg.png',
      genre: [{ id: 'jazz', name: 'Jazz' }]
    },
    {
      id: 'radiojazz_light',
      title: 'RadioJazz Light',
      tooltip: 'Легкий джаз',
      stream: 'https://online.radiojazz.ua/RadioJazz_Light',
      bg_image_mobile: 'https://cdn.103fm.com.ua/images/51-radio-jazz-light.jpg',
      genre: [{ id: 'jazz', name: 'Jazz' }]
    },
    {
      id: 'classicradio',
      title: 'Classic Radio',
      tooltip: 'Класична музика',
      stream: 'https://online.classicradio.ua/ClassicRadio',
      bg_image_mobile: 'https://cdn-profiles.tunein.com/s224284/images/logog.jpg',
      genre: [{ id: 'classical', name: 'Classic' }]
    },
    {
      id: 'raiclassicradio',
      title: 'Rai Radio Classica',
      tooltip: 'Radio Classica Italia',
      stream: 'https://icestreaming.rai.it/5.mp3',
      bg_image_mobile: 'https://static.mytuner.mobi/media/tvos_radios/535/rai-radio-classica.dc930915.png',
      genre: [{ id: 'classical', name: 'Classic' }]
    },
    {
      id: 'technobucharadio',
      title: 'Techno-Bucha Radio',
      tooltip: 'The Air Symphony of Bucha',
      stream: 'https://a4.asurahosting.com:7230/radio.mp3',
      bg_image_mobile: 'https://cdn-profiles.tunein.com/s335554/images/logog.png',
      genre: [{ id: 'Techno', name: 'Techno' }]
    },
    {
      id: 'technolovers',
      title: 'Technolovers',
      tooltip: 'Psy & Goa Trance Non-Stop!',
      stream: 'https://stream.technolovers.fm/psytrance',
      bg_image_mobile: 'https://i1.sndcdn.com/artworks-000167796203-imv5x9-t500x500.png',
      genre: [{ id: 'psytrance', name: 'Psy Trance' }]
    },
    {
      id: 'goafm',
      title: 'GOA FM',
      tooltip: '24H Goa & Psy Trance',
      stream: 'https://stream.laut.fm/goafm',
      bg_image_mobile: 'https://f4.bcbits.com/img/a0725902081_16.jpg',
      genre: [{ id: 'psytrance', name: 'Psy Trance' }]
    },
    {
      id: 'groovesalad',
      title: 'SomaFM Groove Salad',
      tooltip: 'Ambient & Downtempo',
      stream: 'https://ice2.somafm.com/groovesalad-128-mp3',
      bg_image_mobile: 'https://somafm.com/img3/groovesalad-400.jpg',
      genre: [{ id: 'ambient', name: 'Ambient' }]
    },
    {
      id: 'lush',
      title: 'SomaFM Lush',
      tooltip: 'Vocal Chillout',
      stream: 'https://ice2.somafm.com/lush-128-mp3',
      bg_image_mobile: 'https://somafm.com/img3/lush-400.jpg',
      genre: [{ id: 'chillout', name: 'Chillout' }]
    },
    {
      id: 'rockabilly',
      title: 'ROCKABILLY',
      tooltip: 'Rockabilly Music On The World',
      stream: 'https://hemnos.cdnstream.com/1881_128',
      bg_image_mobile: 'https://www.vintagerockmag.com/wp-content/uploads/2018/05/image35.png',
      genre: [{ id: 'rock', name: 'Rock' }]
    },
    {
      id: 'rockantenne',
      title: 'Rock Antenne',
      tooltip: 'Classic Rock',
      stream: 'https://stream.rockantenne.de/rockantenne',
      bg_image_mobile: 'https://play-lh.googleusercontent.com/n0mhe1PN0laXoH6xlNw4tbuL7qpplcqL6OUGGwAk31hgZDiCiwW41P8N1zr2nrSjpJK2Yb0ywCIr4xENwqaK',
      genre: [{ id: 'rock', name: 'Rock' }]
    },
    {
      id: 'fluxfm',
      title: 'Flux FM',
      tooltip: 'Radio so bunt wie Berlin',
      stream: 'https://51-210-189-143-c12fb8.sfn.edge-ovh-gra5.streams.radiosphere.io/557b7263-9216-46b5-a813-a156ffbc9acb/channels/7efc3ff2-4804-431f-aaa9-7d1f8a7727c7/stream.mp3',
      bg_image_mobile: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqAVprso82mL2srFIccIX2i4H-7evFQ91AK4fMXZtuUQ&s=10',
      genre: [{ id: 'altrock', name: 'Alternative Rock' }]
    },
    {
      id: 'bigfm',
      title: 'bigFM Deep',
      tooltip: 'Deep House',
      stream: 'https://streams.bigfm.de/bigfm-deep-128-mp3',
      bg_image_mobile: 'https://play-lh.googleusercontent.com/3ATVux_tlzrYTEq6GdEy4Oh80u_Zi5f0Cprp-eugEBibKwtvBXb43GsiGEYiwCs-BQdB6eK0rjNClWy_LCQXug',
      genre: [{ id: 'deephouse', name: 'Deep House' }]
    },
    {
      id: 'ibizaglobal',
      title: 'Ibiza Global Radio',
      tooltip: 'House & Electronic',
      stream: 'https://ibizaglobalradio.streaming-pro.com:8024/stream',
      bg_image_mobile: 'https://www.ibizabynight.net/wp-content/uploads/2017/12/ibiza-global-radio-2.png',
      genre: [{ id: 'house', name: 'House' }]
    },
    {
      id: 'aniradio',
      title: 'Anime Radio',
      tooltip: '24/7 Anime Music',
      stream: 'https://stream.laut.fm/anime-radio-switzerland',
      bg_image_mobile: 'https://play-lh.googleusercontent.com/MK5WKhVHZvZOyb9AnxOhWomvYNgq-HQ-MPsqu9FXG0GAdgODAm0nLQEhVofwqwBdToSdhkDp4PWAOt8hBIzp',
      genre: [{ id: 'altrock', name: 'Alternative Rock' }]
    },
    {
      id: 'classicfmsoundtrack',
      title: 'Classic FM Soundtracks',
      tooltip: 'Klassiek voor iedereen',
      stream: 'https://stream.classic.nl/classicnl-soundtracks.mp3',
      bg_image_mobile: 'https://tse1.mm.bing.net/th/id/OIP.Set457vs4fh4_oWOgtgYEQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      genre: [{ id: 'soundtrack', name: 'Soundtrack' }]
    },
    {
      id: 'soundtrack',
      title: 'Soundtracks',
      tooltip: 'Hier gibt es die besten TV und Film musik',
      stream: 'https://stream.laut.fm/soundtrack',
      bg_image_mobile: 'https://www.allradio.net/500/ZslQmAyzjgPZvdObXlNbS.webp',
      genre: [{ id: 'soundtrack', name: 'Soundtrack' }]
    },
    {
      id: 'ukrpisnia',
      title: 'Українська пісня',
      tooltip: 'Радіо пісенної класики України',
      stream: 'https://listen6.myradio24.com/50904',
      bg_image_mobile: 'https://noni.org.ua/sites/default/files/pelych8.jpg',
      genre: [{ id: 'ukr', name: 'Українське' }]
    }
  ];

  // =========================================
  // API
  // =========================================
  
  var Api = /*#__PURE__*/function () {
    function Api() {
      _classCallCheck(this, Api);
    }

    _createClass(Api, null, [{
      key: "list",
      value: function list() {
        var genres = [];
        var seen = {};

        UKRAINIAN_STATIONS.forEach(function (s) {
          (s.genre || []).forEach(function (g) {
            if (!seen[g.id]) {
              seen[g.id] = true;
              genres.push(g);
            }
          });
        });

        return Promise.resolve({
          stations: UKRAINIAN_STATIONS,
          genre: genres
        });
      }
    }]);

    return Api;
  }();

  // =========================================
  // FAVORITES
  // =========================================
  
  var Favorites = /*#__PURE__*/function () {
    function Favorites() {
      _classCallCheck(this, Favorites);
    }

    _createClass(Favorites, null, [{
      key: "get",
      value: function get() {
        var all = Lampa.Storage.get('radio_favorite_stations', '[]');
        all.sort(function (a, b) {
          return a.added > b.added ? -1 : a.added < b.added ? 1 : 0;
        });
        return all;
      }
    }, {
      key: "find",
      value: function find(favorite) {
        return this.get().find(function (a) {
          return a.id == favorite.id;
        });
      }
    }, {
      key: "remove",
      value: function remove(favorite) {
        var list = this.get();
        var find = this.find(favorite);
        if (find) {
          Lampa.Arrays.remove(list, find);
          Lampa.Storage.set('radio_favorite_stations', list);
        }
      }
    }, {
      key: "add",
      value: function add(favorite) {
        var list = this.get();
        var find = this.find(favorite);
        if (!find) {
          Lampa.Arrays.extend(favorite, {
            id: Lampa.Utils.uid(),
            added: Date.now()
          });
          list.push(favorite);
          Lampa.Storage.set('radio_favorite_stations', list);
        }
      }
    }, {
      key: "update",
      value: function update(favorite) {
        var list = this.get();
        var find = this.find(favorite);
        if (find) {
          Lampa.Storage.set('radio_favorite_stations', list);
        }
      }
    }, {
      key: "toggle",
      value: function toggle(favorite) {
        return this.find(favorite) ? this.remove(favorite) : this.add(favorite);
      }
    }]);

    return Favorites;
  }();

  // =========================================
  // ГЛОБАЛЬНИЙ ПЛЕЄР
  // =========================================
  
  var globalAudio = null;
  var globalStation = null;
  var globalPlayerHtml = null;
  var globalScreenReset = null;
  var globalHls = null;
  var globalNotyInterval = null;

  function clearPlayingClass() {
    document.querySelectorAll('.radio-item.playing').forEach(function(el) {
      el.classList.remove('playing');
    });
  }

  function hideNoty() {
    try {
      if (typeof $ !== 'undefined') {
        $('.noty, .noty_layout, .noty_effects, .noty_message, .noty_container, .noty_bar').hide();
        $('[class*="noty"]').hide();
      }
      if (Lampa.Noty) {
        if (Lampa.Noty.hide) Lampa.Noty.hide();
        if (Lampa.Noty.close) Lampa.Noty.close();
      }
      var notyElements = document.querySelectorAll('.noty, .noty_layout, [class*="noty"]');
      for (var i = 0; i < notyElements.length; i++) {
        notyElements[i].style.display = 'none';
        notyElements[i].style.opacity = '0';
        notyElements[i].style.visibility = 'hidden';
      }
    } catch(e) {}
  }

  function startHidingNoty() {
    if (globalNotyInterval) {
      clearInterval(globalNotyInterval);
      globalNotyInterval = null;
    }
    hideNoty();
    globalNotyInterval = setInterval(function() {
      hideNoty();
    }, 300);
  }

  function stopHidingNoty() {
    if (globalNotyInterval) {
      clearInterval(globalNotyInterval);
      globalNotyInterval = null;
    }
  }

  function stopGlobalAudio() {
    stopHidingNoty();
    if (globalHls) {
      globalHls.destroy();
      globalHls = false;
    }
    if (globalAudio) {
      try {
        globalAudio.pause();
        globalAudio.src = '';
      } catch(e) {}
      globalAudio = null;
    }
    if (globalScreenReset) {
      clearInterval(globalScreenReset);
      globalScreenReset = null;
    }
    if (globalPlayerHtml) {
      globalPlayerHtml.toggleClass('stop', true);
      globalPlayerHtml.toggleClass('loading', false);
      globalPlayerHtml.toggleClass('hide', true);
      globalPlayerHtml = null;
    }
    clearPlayingClass();
    globalStation = null;
  }

  function setPlayingClass(station) {
    clearPlayingClass();
    document.querySelectorAll('.radio-item').forEach(function(el) {
      var titleEl = el.querySelector('.radio-item__title');
      if (titleEl && titleEl.textContent === station.title) {
        el.classList.add('playing');
      }
    });
  }

  function playGlobalAudio(station) {
    stopGlobalAudio();
    
    globalStation = station;
    var url = station.stream_320 ? station.stream_320 : station.stream_128 ? station.stream_128 : station.stream ? station.stream : station.stream_hls ? station.stream_hls : '';
    
    setPlayingClass(station);
    
    globalAudio = new Audio();
    
    updateMiniPlayer(station, 'loading');
    
    function startPlay() {
      var playPromise;
      try {
        playPromise = globalAudio.play();
      } catch(e) {}
      if (playPromise !== undefined) {
        playPromise.then(function() {
          updateMiniPlayer(station, 'play');
          startHidingNoty();
        })["catch"](function() {});
      }
    }

    function loadPlay() {
      globalAudio.src = url;
      globalAudio.load();
      startPlay();
    }

    globalAudio.addEventListener("playing", function() {
      updateMiniPlayer(station, 'play');
      if (!globalScreenReset) {
        globalScreenReset = setInterval(function() {
          Lampa.Screensaver.resetTimer();
        }, 5000);
      }
    });
    
    globalAudio.addEventListener("waiting", function() {
      updateMiniPlayer(station, 'loading');
    });
    
    globalAudio.addEventListener("ended", function() {
      stopGlobalAudio();
    });

    globalAudio.addEventListener("error", function() {
      console.log('Audio error');
    });

    if (globalAudio.canPlayType('application/vnd.apple.mpegurl') || url.indexOf('.aacp') > 0 || station.stream) {
      loadPlay();
    } else if (Hls.isSupported()) {
      try {
        globalHls = new Hls();
        globalHls.attachMedia(globalAudio);
        globalHls.loadSource(url);
        globalHls.on(Hls.Events.ERROR, function(event, data) {
          if (data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
            if (data.reason === "no EXTM3U delimiter") {
              Lampa.Noty.show(Lampa.Lang.translate('radio_load_error'));
              setTimeout(hideNoty, 100);
            }
          }
        });
        globalHls.on(Hls.Events.MANIFEST_LOADED, function() {
          startPlay();
        });
      } catch(e) {
        Lampa.Noty.show(Lampa.Lang.translate('radio_load_error'));
        setTimeout(hideNoty, 100);
      }
    } else {
      loadPlay();
    }
  }

  // =========================================
  // МІНІ-ПЛЕЄР В ГОЛОВІ
  // =========================================
  
  function updateMiniPlayer(station, state) {
    if (!globalPlayerHtml) {
      globalPlayerHtml = Lampa.Template.get('radio_mini_player', {});
      $('.head__actions .open--search').before(globalPlayerHtml);
      
      globalPlayerHtml.on('hover:enter', function() {
        if (globalAudio && !globalAudio.paused) {
          stopGlobalAudio();
        }
      });
    }
    
    globalPlayerHtml.toggleClass('hide', false);
    globalPlayerHtml.toggleClass('stop', state === 'stop');
    globalPlayerHtml.toggleClass('loading', state === 'loading');
    globalPlayerHtml.toggleClass('play', state === 'play');
    
    // ПРИБИРАЄМО НАЗВУ СТАНЦІЇ В МІНІ-ПЛЕЄРІ
    // globalPlayerHtml.find('.radio-mini-player__name').text(station.title || '');
    globalPlayerHtml.find('.radio-mini-player__name').text('');
    
    var btn = globalPlayerHtml.find('.radio-mini-player__button');
    if (btn) {
      btn.css({
        "background-image": "url('" + station.bg_image_mobile + "')",
        "background-size": "cover",
        "background-position": "center"
      });
    }
  }

  // =========================================
  // PLAYER (повноекранний)
  // =========================================
  
  function Player(station) {
    var html = Lampa.Template.js('radio_player');
    var isDestroyed = false;

    function changeWave(class_name) {
      var lines = html.find('.radio-player__wave').querySelectorAll('div');
      for (var i = 0; i < lines.length; i++) {
        lines[i].removeClass('play loading').addClass(class_name);
        lines[i].style['animation-duration'] = (class_name == 'loading' ? 400 : 200 + Math.random() * 200) + 'ms';
        lines[i].style['animation-delay'] = (class_name == 'loading' ? Math.round(400 / lines.length * i) : 0) + 'ms';
      }
    }

    function createWave() {
      var box = html.find('.radio-player__wave');
      for (var i = 0; i < 15; i++) {
        var div = document.createElement('div');
        box.append(div);
      }
      changeWave(globalAudio && !globalAudio.paused ? 'play' : 'loading');
    }

    if (globalAudio) {
      globalAudio.addEventListener("playing", function() {
        if (!isDestroyed) changeWave('play');
      });
      globalAudio.addEventListener("waiting", function() {
        if (!isDestroyed) changeWave('loading');
      });
    }

    this.create = function () {
      var cover = Lampa.Template.js('radio_cover');
      cover.find('.radio-cover__title').text(station.title || '');
      cover.find('.radio-cover__tooltip').text(station.tooltip || '');
      var img_box = cover.find('.radio-cover__img-box');
      var img_elm = img_box.find('img');
      img_box.removeClass('loaded loaded-icon');

      img_elm.onload = function () {
        img_box.addClass('loaded');
      };
      img_elm.onerror = function () {
        img_elm.src = './img/icons/menu/movie.svg';
        img_box.addClass('loaded-icon');
      };
      img_elm.src = station.bg_image_mobile;

      html.find('.radio-player__cover').append(cover);
      html.find('.radio-player__close').on('click', function () {
        window.history.back();
      });
      document.body.append(html);
      createWave();

      if (globalStation && globalStation.id !== station.id) {
        stopGlobalAudio();
        setPlayingClass(station);
      }
      
      if (!globalAudio || globalAudio.paused) {
        playGlobalAudio(station);
      } else {
        updateMiniPlayer(station, 'play');
      }
    };

    this.destroy = function () {
      isDestroyed = true;
      html.remove();
    };
  }

  // =========================================
  // COMPONENT
  // =========================================
  
  function Component() {
    var _this6 = this;
    var last, scroll, played, filtred = [], page = 0;
    var html = document.createElement('div');
    var img_bg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC';

    this.create = function () {
      var _this = this;
      this.activity.loader(true);
      Api.list().then(function (result) {
        _this.data = result;
        filtred = _this.data.stations;
        _this.build();
      })["catch"](function (e) {
        _this.data = { stations: [], genre: [] };
        _this.build();
      });
      return this.render();
    };

    this.background = function () {
      Lampa.Background.immediately(last ? last.background || img_bg : img_bg);
    };

    this.build = function () {
      var _this2 = this;
      this.activity.loader(false);
      html.append(Lampa.Template.js('radio_content'));
      scroll = new Lampa.Scroll({ mask: true, over: true });

      scroll.onEnd = function () {
        page++;
        _this2.next();
      };

      html.find('.radio-content__list').append(scroll.render(true));
      scroll.minus(html.find('.radio-content__head'));
      this.buildCatalog();
      this.buildSearch();
      this.buildAdd();
      this.display();
      Lampa.Layer.update(html);
    };

    this.clearButtons = function (category, search) {
      var btn_catalog = html.find('.button--catalog');
      var btn_search = html.find('.button--search');
      btn_catalog.find('div').addClass('hide').text('');
      btn_search.find('div').addClass('hide').text('');

      if (category) btn_catalog.find('div').removeClass('hide').text(category);
      else btn_search.find('div').removeClass('hide').text(search);
    };

    this.buildCatalog = function () {
      var _this3 = this;
      var btn = html.find('.button--catalog');
      var items = [];
      var favs = Favorites.get().length;

      items.push({
        title: Lampa.Lang.translate('settings_input_links'),
        ghost: !favs,
        noenter: !favs,
        favorite: true
      });

      if (this.data.stations.length) {
        items.push({
          title: Lampa.Lang.translate('settings_param_jackett_interview_all'),
          all: true
        });

        if (this.data.genre) {
          this.data.genre.forEach(function (g) {
            items.push({ title: g.name, id: g.id });
          });
        }
      }

      if (favs) {
        filtred = Favorites.get();
        this.clearButtons(items[0].title, false);
      }

      btn.on('hover:enter', function () {
        Lampa.Select.show({
          title: Lampa.Lang.translate('title_catalog'),
          items: items,
          onSelect: function onSelect(a) {
            if (a.favorite) {
              filtred = Favorites.get();
            } else if (a.all) filtred = _this3.data.stations;
            else {
              filtred = _this3.data.stations.filter(function (s) {
                return s.genre.find(function (g) { return g.id == a.id; });
              });
            }
            _this3.clearButtons(a.title, false);
            _this3.display();
          },
          onBack: function onBack() {
            Lampa.Controller.toggle('content');
          }
        });
      });
    };

    this.buildAdd = function () {
      var _this4 = this;
      var btn = html.find('.button--add');
      btn.on('hover:enter', function () {
        Lampa.Input.edit({
          title: Lampa.Lang.translate('radio_add_station'),
          free: true,
          nosave: true,
          nomic: true,
          value: ''
        }, function (url) {
          if (url) {
            Favorites.add({
              user: true,
              stream: url,
              title: Lampa.Lang.translate('radio_station')
            });
            filtred = Favorites.get();
            _this4.clearButtons(Lampa.Lang.translate('settings_input_links'), false);
            _this4.display();
          } else {
            Lampa.Controller.toggle('content');
          }
        });
      });
    };

    this.buildSearch = function () {
      var _this5 = this;
      var btn = html.find('.button--search');
      btn.on('hover:enter', function () {
        Lampa.Input.edit({
          free: true,
          nosave: true,
          nomic: true,
          value: ''
        }, function (val) {
          if (val) {
            val = val.toLowerCase();
            filtred = _this5.data.stations.filter(function (s) {
              return s.title.toLowerCase().indexOf(val) >= 0 || (s.tooltip || '').toLowerCase().indexOf(val) >= 0;
            });
            _this5.clearButtons(false, val);
            _this5.display();
          } else {
            Lampa.Controller.toggle('content');
          }
        });
      });
    };

    this.display = function () {
      scroll.clear();
      scroll.reset();
      last = false;
      page = 0;

      if (filtred.length) this.next();
      else {
        for (var i = 0; i < 3; i++) {
          var empty = Lampa.Template.js('radio_list_item');
          empty.addClass('empty--item');
          empty.style.opacity = 1 - 0.3 * i;
          scroll.append(empty);
        }
        Lampa.Layer.visible(scroll.render(true));
      }
      this.activity.toggle();
    };

    this.next = function () {
      var views = 10;
      var start = page * views;
      filtred.slice(start, start + views).forEach(_this6.append.bind(_this6));
      Lampa.Layer.visible(scroll.render(true));
    };

    this.play = function (station) {
      played = station;
      
      if (globalStation && globalStation.id !== station.id) {
        stopGlobalAudio();
      }
      
      playGlobalAudio(station);
      
      var player = new Player(station);
      player.create();
      document.body.addClass('ambience--enable');

      var move = function move(d) {
  var total = filtred.length;
  if (!total) return;
  var pos = filtred.indexOf(played) + d;
  if (pos < 0) pos = total - 1;
  if (pos >= total) pos = 0;
  player.destroy();
  _this6.play(filtred[pos]);
};

      Lampa.Background.change(station.bg_image_mobile || img_bg);
      Lampa.Controller.add('content', {
        invisible: true,
        toggle: function toggle() { Lampa.Controller.clear(); },
        back: function back() {
          document.body.removeClass('ambience--enable');
          player.destroy();
          _this6.activity.toggle();
          Lampa.Controller.toggle('content');
        },
        up: function up() { move(-1); },
        down: function down() { move(1); }
      });
      Lampa.Controller.toggle('content');
    };

    this.append = function (station) {
      var _this7 = this;
      var item = Lampa.Template.js('radio_list_item');
      item.find('.radio-item__num').text((filtred.indexOf(station) + 1).pad(2));
      item.find('.radio-item__title').text(station.title);
      item.find('.radio-item__tooltip').text(station.tooltip || station.stream);
      item.background = station.bg_image_mobile || img_bg;
      var img_box = item.find('.radio-item__cover-box');
      var img_elm = item.find('img');

      img_elm.onload = function () { img_box.addClass('loaded'); };
      img_elm.onerror = function () {
        img_elm.src = './img/icons/menu/movie.svg';
        img_box.addClass('loaded-icon');
      };
      img_elm.src = station.bg_image_mobile;

      if (globalStation && globalStation.id === station.id && globalAudio && !globalAudio.paused) {
        item.addClass('playing');
      } else {
        item.removeClass('playing');
      }

      item.on('hover:focus hover:hover', function () {
        if (item.background) Lampa.Background.change(item.background);
        else _this7.background();
        last = item;
      });
      item.on('hover:focus', function () { scroll.update(item); });
      item.on('hover:enter', function () { _this7.play(station); });
      item.on('hover:long', function () {
        if (station.user) {
          Lampa.Select.show({
            title: Lampa.Lang.translate('menu_settings'),
            items: [
              { title: Lampa.Lang.translate('extensions_change_name'), change: 'title' },
              { title: Lampa.Lang.translate('extensions_change_link'), change: 'stream' },
              { title: Lampa.Lang.translate('extensions_remove'), remove: true }
            ],
            onSelect: function onSelect(a) {
              if (a.remove) {
                Favorites.remove(station);
                item.remove();
                last = false;
                Lampa.Controller.toggle('content');
              } else {
                Lampa.Input.edit({
                  free: true, nosave: true, nomic: true, value: station[a.change] || ''
                }, function (val) {
                  if (val) {
                    station[a.change] = val;
                    Favorites.update(station);
                    item.find('.radio-item__' + (a.change == 'title' ? 'title' : 'tooltip')).text(val);
                  }
                  Lampa.Controller.toggle('content');
                });
              }
            },
            onBack: function onBack() { Lampa.Controller.toggle('content'); }
          });
        } else {
          Favorites.toggle(station);
          item.toggleClass('favorite', Boolean(Favorites.find(station)));
        }
      });
      item.toggleClass('favorite', Boolean(Favorites.find(station)));
      if (!last) last = item;
      if (Lampa.Controller.own(this)) Lampa.Controller.collectionAppend(item);
      scroll.append(item);
    };

this.start = function () {
  if (Lampa.Activity.active() && Lampa.Activity.active().activity !== this.activity) return;
  this.background();
  Lampa.Controller.add('content', {
    link: this,
    invisible: true,
toggle: function toggle() {
  Lampa.Controller.collectionSet(html);
  var playingEl = null;
  try {
    var found = html.find('.radio-item.playing');
    if (found && found.length) playingEl = found[0];
  } catch (e) {}
  Lampa.Controller.collectionFocus(playingEl || last, html);
  if (playingEl && playingEl.scrollIntoView) {
    setTimeout(function () {
      playingEl.scrollIntoView({ block: 'center', behavior: 'auto' });
    }, 50);
  }
},
    left: function left() {
      if (Navigator.canmove('left')) Navigator.move('left');
      else Lampa.Controller.toggle('menu');
    },
    right: function right() { Navigator.move('right'); },
    up: function up() {
      if (Navigator.canmove('up')) Navigator.move('up');
      else Lampa.Controller.toggle('head');
    },
    down: function down() { Navigator.move('down'); },
    back: function back() { Lampa.Activity.backward(); }
  });
  Lampa.Controller.toggle('content');
};

    this.pause = function () {};
    this.stop = function () {};
    this.render = function () { return html; };
    this.destroy = function () {
      if (scroll) scroll.destroy();
      html.remove();
    };
  }

  // =========================================
  // START PLUGIN
  // =========================================
  
  function startPlugin() {
    window.plugin_record_ready = true;

    Lampa.Lang.add({
      radio_station: {
        uk: 'Радіо',
        en: 'Radio'
      },
      radio_add_station: {
        uk: 'Введіть адресу радіостанції',
        en: 'Enter the radio station address'
      },
      radio_load_error: {
        uk: 'Помилка завантаження потоку',
        en: 'Error loading stream'
      }
    });

    var manifest = {
      type: 'audio',
      version: '1.4.0',
      name: Lampa.Lang.translate('radio_station'),
      description: 'Українські радіостанції',
      component: 'radio'
    };
    Lampa.Manifest.plugins = manifest;

    Lampa.Template.add('radio_content', "\n        <div class=\"radio-content\">\n            <div class=\"radio-content__head\">\n                <div class=\"simple-button simple-button--invisible simple-button--filter selector button--catalog\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" xml:space=\"preserve\">\n                        <path fill=\"currentColor\" d=\"M478.354,146.286H33.646c-12.12,0-21.943,9.823-21.943,21.943v321.829c0,12.12,9.823,21.943,21.943,21.943h444.709\n                            c12.12,0,21.943-9.823,21.943-21.943V168.229C500.297,156.109,490.474,146.286,478.354,146.286z M456.411,468.114H55.589V190.171\n                            h400.823V468.114z\"/>\n                        <path fill=\"currentColor\" d=\"M441.783,73.143H70.217c-12.12,0-21.943,9.823-21.943,21.943c0,12.12,9.823,21.943,21.943,21.943h371.566\n                            c12.12,0,21.943-9.823,21.943-21.943C463.726,82.966,453.903,73.143,441.783,73.143z\"/>\n                        <path fill=\"currentColor\" d=\"M405.211,0H106.789c-12.12,0-21.943,9.823-21.943,21.943c0,12.12,9.823,21.943,21.943,21.943h298.423\n                            c12.12,0,21.943-9.823,21.943-21.943C427.154,9.823,417.331,0,405.211,0z\"/>\n                    </svg>\n                    <div class=\"hide\"></div>\n                </div>\n                <div class=\"simple-button simple-button--invisible simple-button--filter selector button--add\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\"  viewBox=\"0 0 512 512\" xml:space=\"preserve\">\n                        <path d=\"M256 0C114.833 0 0 114.833 0 256s114.833 256 256 256 256-114.853 256-256S397.167 0 256 0zm0 472.341c-119.275 0-216.341-97.046-216.341-216.341S136.725 39.659 256 39.659 472.341 136.705 472.341 256 375.295 472.341 256 472.341z\" fill=\"currentColor\"></path>\n                        <path d=\"M355.148 234.386H275.83v-79.318c0-10.946-8.864-19.83-19.83-19.83s-19.83 8.884-19.83 19.83v79.318h-79.318c-10.966 0-19.83 8.884-19.83 19.83s8.864 19.83 19.83 19.83h79.318v79.318c0 10.946 8.864 19.83 19.83 19.83s19.83-8.884 19.83-19.83v-79.318h79.318c10.966 0 19.83-8.884 19.83-19.83s-8.864-19.83-19.83-19.83z\" fill=\"currentColor\"></path>\n                    </svg>\n                </div>\n                <div class=\"simple-button simple-button--invisible simple-button--filter selector button--search\">\n                    <svg width=\"23\" height=\"22\" viewBox=\"0 0 23 22\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" xml:space=\"preserve\">\n                        <circle cx=\"9.9964\" cy=\"9.63489\" r=\"8.43556\" stroke=\"currentColor\" stroke-width=\"2.4\"></circle>\n                        <path d=\"M20.7768 20.4334L18.2135 17.8701\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"></path>\n                    </svg>\n                    <div class=\"hide\"></div>\n                </div>\n            </div>\n            <div class=\"radio-content__body\">\n                <div class=\"radio-content__list\"></div>\n            </div>\n        </div>\n    ");
    
    Lampa.Template.add('radio_cover', "\n        <div class=\"radio-cover\">\n            <div class=\"radio-cover__img-container\">\n                <div class=\"radio-cover__img-box\">\n                    <img />\n                </div>\n            </div>\n            <div class=\"radio-cover__title\"></div>\n            <div class=\"radio-cover__tooltip\"></div>\n        </div>\n    ");
    
    Lampa.Template.add('radio_list_item', "\n        <div class=\"radio-item selector layer--visible\">\n            <div class=\"radio-item__num\"></div>\n            <div class=\"radio-item__cover\">\n                <div class=\"radio-item__cover-box\">\n                    <img />\n                </div>\n            </div>\n            <div class=\"radio-item__body\">\n                <div class=\"radio-item__title\"></div>\n                <div class=\"radio-item__tooltip\"></div>\n            </div>\n            <div class=\"radio-item__wave\">\n                <i></i><i></i><i></i><i></i><i></i>\n            </div>\n            <div class=\"radio-item__icons\">\n                <div class=\"radio-item__icon-favorite\">\n                    <svg version=\"1.1\" id=\"Capa_1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 477.534 477.534\" xml:space=\"preserve\">\n                        <path fill=\"currentColor\" d=\"M438.482,58.61c-24.7-26.549-59.311-41.655-95.573-41.711c-36.291,0.042-70.938,15.14-95.676,41.694l-8.431,8.909\n                            l-8.431-8.909C181.284,5.762,98.662,2.728,45.832,51.815c-2.341,2.176-4.602,4.436-6.778,6.778\n                            c-52.072,56.166-52.072,142.968,0,199.134l187.358,197.581c6.482,6.843,17.284,7.136,24.127,0.654\n                            c0.224-0.212,0.442-0.43,0.654-0.654l187.29-197.581C490.551,201.567,490.551,114.77,438.482,58.61z M413.787,234.226h-0.017\n                            L238.802,418.768L63.818,234.226c-39.78-42.916-39.78-109.233,0-152.149c36.125-39.154,97.152-41.609,136.306-5.484\n                            c1.901,1.754,3.73,3.583,5.484,5.484l20.804,21.948c6.856,6.812,17.925,6.812,24.781,0l20.804-21.931\n                            c36.125-39.154,97.152-41.609,136.306-5.484c1.901,1.754,3.73,3.583,5.484,5.484C453.913,125.078,454.207,191.516,413.787,234.226\n                            z\"/>\n                    </svg>\n                </div>\n                <div class=\"radio-item__icon-play\">\n                    <svg width=\"22\" height=\"25\" viewBox=\"0 0 22 25\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                        <path d=\"M21 10.7679C22.3333 11.5377 22.3333 13.4622 21 14.232L3.75 24.1913C2.41666 24.9611 0.75 23.9989 0.75 22.4593L0.750001 2.5407C0.750001 1.0011 2.41667 0.0388526 3.75 0.808653L21 10.7679Z\" fill=\"currentColor\"/>\n                    </svg>\n                </div>\n            </div>\n        </div>\n    ");
    
    Lampa.Template.add('radio_player', "\n        <div class=\"radio-player\">\n            <div class=\"radio-player__content\">\n                <div class=\"radio-player__cover\"></div>\n                <div class=\"radio-player__wave\"></div>\n            </div>\n            <div class=\"radio-player__close\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 329.269 329\" xml:space=\"preserve\">\n                    <path d=\"M194.8 164.77 323.013 36.555c8.343-8.34 8.343-21.825 0-30.164-8.34-8.34-21.825-8.34-30.164 0L164.633 134.605 36.422 6.391c-8.344-8.34-21.824-8.34-30.164 0-8.344 8.34-8.344 21.824 0 30.164l128.21 128.215L6.259 292.984c-8.344 8.34-8.344 21.825 0 30.164a21.266 21.266 0 0 0 15.082 6.25c5.46 0 10.922-2.09 15.082-6.25l128.21-128.214 128.216 128.214a21.273 21.273 0 0 0 15.082 6.25c5.46 0 10.922-2.09 15.082-6.25 8.343-8.34 8.343-21.824 0-30.164zm0 0\" fill=\"currentColor\"></path>\n                </svg>\n            </div>\n        </div>\n    ");
    
    Lampa.Template.add('radio_mini_player', "\n        <div class=\"selector radio-mini-player hide stop\">\n            <div class=\"radio-mini-player__button\">\n                <i></i>\n                <i></i>\n                <i></i>\n                <i></i>\n            </div>\n            <div class=\"radio-mini-player__name\"></div>\n        </div>\n    ");

    Lampa.Template.add('radio_style', "\n        <style>\n        .radio-content{padding:0 1.5em}.radio-content__head{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;padding:1.5em 0}.radio-content__body{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.radio-content__list{width:100%}@media screen and (max-width:576px){.radio-content__list{width:100%}}.radio-cover{text-align:center;line-height:1.4}.radio-cover__img-container{max-width:20em;margin:0 auto}.radio-cover__img-box{position:relative;padding-bottom:100%;background-color:rgba(0,0,0,0.3);-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em}.radio-cover__img-box>img{position:absolute;top:0;left:0;width:100%;height:100%;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;opacity:0}.radio-cover__img-box.loaded{background-color:transparent}.radio-cover__img-box.loaded>img{opacity:1}.radio-cover__img-box.loaded-icon{background-color:rgba(0,0,0,0.3)}.radio-cover__img-box.loaded-icon>img{left:20%;top:20%;width:60%;height:60%;opacity:.2}.radio-cover__title{font-weight:700;font-size:1.5em;margin-top:1em}.radio-cover__tooltip{font-weight:300;font-size:1.3em;margin-top:.2em}.radio-item{padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;line-height:1.4}.radio-item__num{font-weight:700;margin-right:1em;font-size:1.3em;opacity:.4;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}@media screen and (max-width:400px){.radio-item__num{display:none}}.radio-item__body{max-width:60%}.radio-item__cover{width:5em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;margin-right:2em}.radio-item__cover-box{position:relative;padding-bottom:100%;background-color:rgba(0,0,0,0.3);-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em}.radio-item__cover-box>img{position:absolute;top:0;left:0;width:100%;height:100%;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em;opacity:0}.radio-item__cover-box.loaded{background-color:transparent}.radio-item__cover-box.loaded>img{opacity:1}.radio-item__cover-box.loaded-icon{background-color:rgba(0,0,0,0.3)}.radio-item__cover-box.loaded-icon>img{left:20%;top:20%;width:60%;height:60%;opacity:.2}\n\n/* ===== ТЕКСТ У СПИСКУ - БЕЗ ПІДКЛАДКИ ===== */\n.radio-item__title {\n    font-weight:700;\n    font-size:1.2em;\n    text-shadow: 0 1px 4px rgba(0,0,0,0.8);\n    transition: color 0.3s ease;\n}\n.radio-item__tooltip {\n    opacity:.5;\n    margin-top:.5em;\n    font-size:1.1em;\n    text-shadow: 0 1px 4px rgba(0,0,0,0.8);\n    transition: color 0.3s ease;\n}\n.radio-item__num {\n    transition: color 0.3s ease, opacity 0.3s ease;\n}\n\n/* ===== ЗЕЛЕНИЙ ТЕКСТ ДЛЯ АКТИВНОЇ СТАНЦІЇ ===== */\n.radio-item.playing .radio-item__title {\n    color: #00ff00 !important;\n    text-shadow: 0 0 20px rgba(0,255,0,0.3), 0 1px 4px rgba(0,0,0,0.8) !important;\n}\n.radio-item.playing .radio-item__tooltip {\n    color: #66ff66 !important;\n    text-shadow: 0 0 15px rgba(0,255,0,0.2), 0 1px 4px rgba(0,0,0,0.8) !important;\n    opacity: 0.9 !important;\n}\n.radio-item.playing .radio-item__num {\n    color: #00ff00 !important;\n    opacity: 1 !important;\n}\n\n.radio-item__icons{margin-left:auto;padding-left:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.radio-item__icons svg{width:1.4em !important;height:1.4em !important}.radio-item__icons>*+*{margin-left:1.5em}.radio-item__icons .radio-item__icon-favorite{display:none}.radio-item__icons .radio-item__icon-play{display:none}.radio-item.focus{background:white;color:#000;-webkit-border-radius:1em;-moz-border-radius:1em;border-radius:1em}.radio-item.focus .radio-item__icon-play{display:block}.radio-item.favorite .radio-item__icon-favorite{display:block}.radio-item.playing{background:rgba(0,255,0,0.08);border:1px solid rgba(0,255,0,0.25);border-radius:1em}.radio-item.empty--item .radio-item__title,.radio-item.empty--item .radio-item__num,.radio-item.empty--item .radio-item__tooltip{background-color:rgba(255,255,255,0.3);height:1.2em;-webkit-border-radius:.3em;-moz-border-radius:.3em;border-radius:.3em}.radio-item.empty--item .radio-item__num{width:1.4em}.radio-item.empty--item .radio-item__title{width:7em}.radio-item.empty--item .radio-item__tooltip{width:16em}.radio-item.empty--item .radio-item__icons{display:none}.radio-item.empty--item .radio-item__cover-box{background-color:rgba(255,255,255,0.3)}.radio-item.empty--item.focus{background-color:transparent;color:#fff}\n\n/* ===== ЕКВАЛАЙЗЕР В СПИСКУ ДЛЯ АКТИВНОЇ СТАНЦІЇ ===== */\n.radio-item__wave {\n    display: none;\n    -webkit-box-align: center;\n    -webkit-align-items: center;\n    -moz-box-align: center;\n    -ms-flex-align: center;\n    align-items: center;\n    -webkit-box-pack: center;\n    -webkit-justify-content: center;\n    -moz-box-pack: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n    margin-left: auto;\n    padding-left: 0.5em;\n    -webkit-flex-shrink: 0;\n    -ms-flex-negative: 0;\n    flex-shrink: 0;\n    height: 2.5em;\n    gap: 2px;\n}\n\n.radio-item.playing .radio-item__wave {\n    display: -webkit-box;\n    display: -webkit-flex;\n    display: -moz-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n\n.radio-item__wave i {\n    display: block;\n    width: 3px;\n    background-color: #00ff00;\n    border-radius: 1px;\n    box-shadow: 0 0 6px rgba(0,255,0,0.4);\n    height: 0.8em;\n    -webkit-animation: wavePlay 0.8s ease-in-out infinite alternate;\n    -moz-animation: wavePlay 0.8s ease-in-out infinite alternate;\n    -o-animation: wavePlay 0.8s ease-in-out infinite alternate;\n    animation: wavePlay 0.8s ease-in-out infinite alternate;\n}\n\n.radio-item__wave i:nth-child(1) { -webkit-animation-delay: 0s; animation-delay: 0s; height: 0.5em; }\n.radio-item__wave i:nth-child(2) { -webkit-animation-delay: 0.1s; animation-delay: 0.1s; height: 1.2em; }\n.radio-item__wave i:nth-child(3) { -webkit-animation-delay: 0.2s; animation-delay: 0.2s; height: 1.8em; }\n.radio-item__wave i:nth-child(4) { -webkit-animation-delay: 0.3s; animation-delay: 0.3s; height: 1.0em; }\n.radio-item__wave i:nth-child(5) { -webkit-animation-delay: 0.4s; animation-delay: 0.4s; height: 0.6em; }\n\n@-webkit-keyframes wavePlay {\n    0% { -webkit-transform: scaleY(0.3); transform: scaleY(0.3); opacity: 0.4; }\n    100% { -webkit-transform: scaleY(1); transform: scaleY(1); opacity: 1; }\n}\n@-moz-keyframes wavePlay {\n    0% { -moz-transform: scaleY(0.3); transform: scaleY(0.3); opacity: 0.4; }\n    100% { -moz-transform: scaleY(1); transform: scaleY(1); opacity: 1; }\n}\n@-o-keyframes wavePlay {\n    0% { -o-transform: scaleY(0.3); transform: scaleY(0.3); opacity: 0.4; }\n    100% { -o-transform: scaleY(1); transform: scaleY(1); opacity: 1; }\n}\n@keyframes wavePlay {\n    0% { -webkit-transform: scaleY(0.3); -moz-transform: scaleY(0.3); -o-transform: scaleY(0.3); transform: scaleY(0.3); opacity: 0.4; }\n    100% { -webkit-transform: scaleY(1); -moz-transform: scaleY(1); -o-transform: scaleY(1); transform: scaleY(1); opacity: 1; }\n}\n\n/* ===== ПОВНОЕКРАННИЙ ПЛЕЄР ===== */\n.radio-player {\n    position:fixed;\n    z-index:100;\n    left:0;\n    top:0;\n    width:100%;\n    height:100%;\n    display:-webkit-box;\n    display:-webkit-flex;\n    display:-moz-box;\n    display:-ms-flexbox;\n    display:flex;\n    -webkit-box-align:center;\n    -webkit-align-items:center;\n    -moz-box-align:center;\n    -ms-flex-align:center;\n    align-items:center;\n    -webkit-box-pack:center;\n    -webkit-justify-content:center;\n    -moz-box-pack:center;\n    -ms-flex-pack:center;\n    justify-content:center;\n}\n\n/* РОЗМИТИЙ ФОН */\n.radio-player::before {\n    content:'';\n    position:absolute;\n    top:0;\n    left:0;\n    right:0;\n    bottom:0;\n    background: inherit;\n    background-size: cover;\n    background-position: center;\n    -webkit-backdrop-filter: blur(12px);\n    backdrop-filter: blur(12px);\n    z-index:-1;\n}\n\n/* СУЦІЛЬНА ПІДКЛАДКА ДЛЯ ВСЬОГО КОНТЕНТУ */\n.radio-player__content {\n    position:relative;\n    background: rgba(0, 0, 0, 0.65);\n    padding: 2em 3em;\n    border-radius: 1.5em;\n    max-width: 30em;\n    width: 100%;\n    box-shadow: 0 20px 60px rgba(0,0,0,0.8);\n    border: 1px solid rgba(255,255,255,0.08);\n}\n\n.radio-player__cover{width:100%}.radio-player__wave{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;margin-top:1.5em;padding:1em 0}.radio-player__wave>div{width:3px;background-color:#00ff00;margin:0 0.4em;height:1em;opacity:0;border-radius:2px;box-shadow:0 0 10px rgba(0,255,0,0.3)}.radio-player__wave>div.loading{-webkit-animation:radioAnimationWaveLoading 400ms ease infinite;-moz-animation:radioAnimationWaveLoading 400ms ease infinite;-o-animation:radioAnimationWaveLoading 400ms ease infinite;animation:radioAnimationWaveLoading 400ms ease infinite}.radio-player__wave>div.play{-webkit-animation:radioAnimationWavePlay 50ms linear infinite alternate;-moz-animation:radioAnimationWavePlay 50ms linear infinite alternate;-o-animation:radioAnimationWavePlay 50ms linear infinite alternate;animation:radioAnimationWavePlay 50ms linear infinite alternate}.radio-player__close{position:fixed;top:1.5em;right:50%;margin-right:-2em;-webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;padding:1em;display:none;background-color:rgba(255,255,255,0.1)}.radio-player__close>svg{width:1.5em;height:1.5em}body.true--mobile .radio-player__close{display:block}\n\n/* МІНІ-ПЛЕЄР В ГОЛОВІ - БЕЗ НАЗВИ */\n.radio-mini-player {\n    display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;\n    -webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;\n    -webkit-border-radius:0.3em;-moz-border-radius:0.3em;border-radius:0.3em;\n    padding:0.2em 0.4em;\n    margin-left:0.5em;\n    margin-right:0.5em;\n    cursor:pointer;\n}\n.radio-mini-player__name {\n    display:none !important;\n}\n.radio-mini-player__button {\n    position:relative;\n    width:2.2em;\n    height:2.2em;\n    display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;\n    -webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;\n    -webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;\n    -webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;\n    -webkit-border-radius:0.3em;-moz-border-radius:0.3em;border-radius:0.3em;\n    border:0.15em solid rgba(255,255,255,0.8);\n    background-size:cover !important;\n    background-position:center !important;\n    cursor:pointer;\n}\n.radio-mini-player__button i {\n    display:block;\n    width:0.2em;\n    background-color:#00ff00;\n    margin:0 0.1em;\n    -webkit-animation:sound 0ms -800ms linear infinite alternate;\n    -moz-animation:sound 0ms -800ms linear infinite alternate;\n    -o-animation:sound 0ms -800ms linear infinite alternate;\n    animation:sound 0ms -800ms linear infinite alternate;\n    -webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;\n    border-radius:1px;\n    box-shadow:0 0 6px rgba(0,255,0,0.3);\n}\n.radio-mini-player__button i:nth-child(1){-webkit-animation-duration:474ms;-moz-animation-duration:474ms;-o-animation-duration:474ms;animation-duration:474ms}\n.radio-mini-player__button i:nth-child(2){-webkit-animation-duration:433ms;-moz-animation-duration:433ms;-o-animation-duration:433ms;animation-duration:433ms}\n.radio-mini-player__button i:nth-child(3){-webkit-animation-duration:407ms;-moz-animation-duration:407ms;-o-animation-duration:407ms;animation-duration:407ms}\n.radio-mini-player__button i:nth-child(4){-webkit-animation-duration:458ms;-moz-animation-duration:458ms;-o-animation-duration:458ms;animation-duration:458ms}\n.radio-mini-player.stop .radio-mini-player__button i{display:none}\n.radio-mini-player.stop .radio-mini-player__button:after{\n    content:\"\";\n    width:0.6em;\n    height:0.6em;\n    background-color:rgba(255,255,255,0.9);\n    border-radius:0.1em;\n}\n.radio-mini-player.loading .radio-mini-player__button i{display:none}\n.radio-mini-player.loading .radio-mini-player__button:before{\n    content:\"\";\n    display:block;\n    border-top:0.2em solid rgba(0,255,0,0.9);\n    border-left:0.2em solid transparent;\n    border-right:0.2em solid transparent;\n    border-bottom:0.2em solid transparent;\n    -webkit-animation:sound-loading 1s linear infinite;\n    -moz-animation:sound-loading 1s linear infinite;\n    -o-animation:sound-loading 1s linear infinite;\n    animation:sound-loading 1s linear infinite;\n    width:0.9em;height:0.9em;\n    -webkit-border-radius:100%;-moz-border-radius:100%;border-radius:100%;\n    -webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;\n}\n.radio-mini-player.focus{background-color:#fff;color:#000}\n.radio-mini-player.focus .radio-mini-player__button{border-color:#000}\n.radio-mini-player.focus .radio-mini-player__button i,\n.radio-mini-player.focus .radio-mini-player__button:after{background-color:#000}\n.radio-mini-player.focus .radio-mini-player__button:before{border-top-color:#000}\n.radio-mini-player.hide{display:none}\n\n@-webkit-keyframes sound{0%{height:0.1em}100%{height:1em}}\n@-moz-keyframes sound{0%{height:0.1em}100%{height:1em}}\n@-o-keyframes sound{0%{height:0.1em}100%{height:1em}}\n@keyframes sound{0%{height:0.1em}100%{height:1em}}\n@-webkit-keyframes sound-loading{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}\n@-moz-keyframes sound-loading{0%{-moz-transform:rotate(0deg);transform:rotate(0deg)}100%{-moz-transform:rotate(360deg);transform:rotate(360deg)}}\n@-o-keyframes sound-loading{0%{-o-transform:rotate(0deg);transform:rotate(0deg)}100%{-o-transform:rotate(360deg);transform:rotate(360deg)}}\n@keyframes sound-loading{0%{-webkit-transform:rotate(0deg);-moz-transform:rotate(0deg);-o-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-o-transform:rotate(360deg);transform:rotate(360deg)}}\n\n@-webkit-keyframes radioAnimationWaveLoading{0%{-webkit-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.5}10%{-webkit-transform:scale3d(1,1.5,1);transform:scale3d(1,1.5,1);opacity:1}20%{-webkit-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.5}100%{-webkit-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.5}}\n@-moz-keyframes radioAnimationWaveLoading{0%{-moz-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.5}10%{-moz-transform:scale3d(1,1.5,1);transform:scale3d(1,1.5,1);opacity:1}20%{-moz-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.5}100%{-moz-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.5}}\n@-o-keyframes radioAnimationWaveLoading{0%{transform:scale3d(1,0.3,1);opacity:0.5}10%{transform:scale3d(1,1.5,1);opacity:1}20%{transform:scale3d(1,0.3,1);opacity:0.5}100%{transform:scale3d(1,0.3,1);opacity:0.5}}\n@keyframes radioAnimationWaveLoading{0%{-webkit-transform:scale3d(1,0.3,1);-moz-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.5}10%{-webkit-transform:scale3d(1,1.5,1);-moz-transform:scale3d(1,1.5,1);transform:scale3d(1,1.5,1);opacity:1}20%{-webkit-transform:scale3d(1,0.3,1);-moz-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.5}100%{-webkit-transform:scale3d(1,0.3,1);-moz-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.5}}\n@-webkit-keyframes radioAnimationWavePlay{0%{-webkit-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.3}100%{-webkit-transform:scale3d(1,2,1);transform:scale3d(1,2,1);opacity:1}}\n@-moz-keyframes radioAnimationWavePlay{0%{-moz-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.3}100%{-moz-transform:scale3d(1,2,1);transform:scale3d(1,2,1);opacity:1}}\n@-o-keyframes radioAnimationWavePlay{0%{transform:scale3d(1,0.3,1);opacity:0.3}100%{transform:scale3d(1,2,1);opacity:1}}\n@keyframes radioAnimationWavePlay{0%{-webkit-transform:scale3d(1,0.3,1);-moz-transform:scale3d(1,0.3,1);transform:scale3d(1,0.3,1);opacity:0.3}100%{-webkit-transform:scale3d(1,2,1);-moz-transform:scale3d(1,2,1);transform:scale3d(1,2,1);opacity:1}}\n\n        /* ===== ТЕКСТ У ПЛЕЄРІ - БЕЗ ОКРЕМИХ ПІДКЛАДОК ===== */\n        .radio-cover__title,\n        .radio-cover__tooltip {\n            background: transparent !important;\n            padding: 0.2em 0 !important;\n            border-radius: 0 !important;\n            display: block !important;\n            text-shadow: 0 2px 8px rgba(0,0,0,0.9) !important;\n        }\n        .radio-cover__title {\n            font-size: 1.8em !important;\n            margin-top: 0.8em !important;\n        }\n        .radio-cover__tooltip {\n            font-size: 1.2em !important;\n            margin-top: 0.3em !important;\n            opacity: 0.9 !important;\n        }\n        </style>\n    ");

    function add() {
      var button = $("<li class=\"menu__item selector\">\n            <div class=\"menu__ico\">\n                <svg width=\"38\" height=\"31\" viewBox=\"0 0 38 31\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect x=\"17.613\" width=\"3\" height=\"16.3327\" rx=\"1.5\" transform=\"rotate(63.4707 17.613 0)\" fill=\"currentColor\"/>\n                    <circle cx=\"13\" cy=\"19\" r=\"6\" fill=\"currentColor\"/>\n                    <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M0 11C0 8.79086 1.79083 7 4 7H34C36.2091 7 38 8.79086 38 11V27C38 29.2091 36.2092 31 34 31H4C1.79083 31 0 29.2091 0 27V11ZM21 19C21 23.4183 17.4183 27 13 27C8.58173 27 5 23.4183 5 19C5 14.5817 8.58173 11 13 11C17.4183 11 21 14.5817 21 19ZM30.5 18C31.8807 18 33 16.8807 33 15.5C33 14.1193 31.8807 13 30.5 13C29.1193 13 28 14.1193 28 15.5C28 16.8807 29.1193 18 30.5 18Z\" fill=\"currentColor\"/>\n                </svg>\n            </div>\n            <div class=\"menu__text\">".concat(manifest.name, "</div>\n        </li>"));
      button.on('hover:enter', function () {
        Lampa.Activity.push({
          url: '',
          title: manifest.name,
          component: 'radio',
          page: 1
        });
      });
      $('.menu .menu__list').eq(0).append(button);
      $('body').append(Lampa.Template.get('radio_style', {}, true));
    }

    Lampa.Component.add('radio', Component);
    if (window.appready) add();
    else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') add();
      });
    }
  }

  if (!window.plugin_record_ready) startPlugin();

})();