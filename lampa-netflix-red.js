/*
 * Lampa RedFlix Theme Plugin
 * Черно-красный интерфейс с Netflix-подачей: hero, бейджи, подборки, нижняя навигация.
 * Установка: Lampa -> Настройки -> Расширения -> Добавить плагин -> URL этого файла.
 */
(function () {
  'use strict';

  var PLUGIN_KEY = 'redflix_lampa_plugin_loaded';
  var COMPONENT_NAME = 'redflix_home';
  var VERSION = '1.0.0';

  if (window[PLUGIN_KEY]) return;
  window[PLUGIN_KEY] = true;

  var heroImage = 'https://image.tmdb.org/t/p/w780/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg';

  var rows = [
    {
      title: 'СЕРИАЛЫ',
      items: [
        ['Закон природы', '2026', 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg'],
        ['Любимцы Америки', 'IMDb 7.1', 'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg'],
        ['Улыбсын', 'КП 8.3', 'https://image.tmdb.org/t/p/w500/6CoRTJTmijhBLJTUNoVSUNxZMEI.jpg'],
        ['Загадки Перри Мейсона', 'IMDb 6.7', 'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg']
      ]
    },
    {
      title: 'TV-ШОУ',
      items: [
        ['Пак Богом деревенский', 'IMDb 9.2', 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg'],
        ['Домохозяйки против кондитеров', 'IMDb 7.6', 'https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg'],
        ['Домохозяйки против шефов', 'IMDb 8.1', 'https://image.tmdb.org/t/p/w500/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg'],
        ['Большое шоу', '2025', 'https://image.tmdb.org/t/p/w500/5N7lkQ0k8FBn4e9KcEWeFhYJy2D.jpg']
      ]
    },
    {
      title: 'НОВЫЕ СЕРИИ',
      subtitle: 'Свежие эпизоды сериалов',
      items: [
        ['Первая ракетка', 'S1 - E8', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'NEW'],
        ['След Чикатило', 'S1 - E5', 'https://image.tmdb.org/t/p/w500/5N7lkQ0k8FBn4e9KcEWeFhYJy2D.jpg', 'NEW'],
        ['Фишер', 'S3 - E4', 'https://image.tmdb.org/t/p/w500/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg', 'NEW'],
        ['Ночная смена', 'S2 - E1', 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', 'NEW']
      ]
    },
    {
      title: 'ФИЛЬМЫ',
      items: [
        ['Холоп 3', 'КП 7.4', 'https://image.tmdb.org/t/p/w500/4Y1WNkd88JXmGfhtWR7dmDAo1T2.jpg'],
        ['Загадки Перри Мейсона', 'IMDb 6.7', 'https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg'],
        ['Мексика-86', 'IMDb 6.4', 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg'],
        ['Аватар: Пламя и пепел', 'КП 7.6', heroImage]
      ]
    }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function addStyle() {
    if (document.getElementById('redflix-lampa-style')) return;

    var css = document.createElement('style');
    css.id = 'redflix-lampa-style';
    css.textContent = `
      body.redflix-theme,
      body.redflix-theme .app,
      body.redflix-theme .activity,
      body.redflix-theme .main,
      body.redflix-theme .content,
      body.redflix-theme .background {
        background: #050000 !important;
        color: #fff !important;
      }

      body.redflix-theme .head,
      body.redflix-theme .menu,
      body.redflix-theme .modal,
      body.redflix-theme .selectbox {
        background: rgba(5, 0, 0, .92) !important;
        color: #fff !important;
      }

      body.redflix-theme .card__view,
      body.redflix-theme .card-more__box,
      body.redflix-theme .full-start-new__poster,
      body.redflix-theme .full-start__poster {
        background-color: #130003 !important;
        border-radius: 1.15em !important;
        box-shadow: 0 1.2em 2.4em rgba(0, 0, 0, .42) !important;
        overflow: hidden !important;
      }

      body.redflix-theme .selector.focus,
      body.redflix-theme .selector.hover,
      body.redflix-theme .card.focus .card__view,
      body.redflix-theme .card.hover .card__view {
        box-shadow: 0 0 0 .22em #e50914, 0 0 2.2em rgba(229, 9, 20, .45) !important;
        transform: translateY(-.12em) scale(1.02);
      }

      body.redflix-theme .full-start__button,
      body.redflix-theme .button--play,
      body.redflix-theme .button.active,
      body.redflix-theme .selector.active {
        background: linear-gradient(135deg, #e50914, #b20710) !important;
        color: #fff !important;
      }

      body.redflix-theme .menu__item.focus,
      body.redflix-theme .menu__item.hover,
      body.redflix-theme .menu__item.active,
      body.redflix-theme .redflix-menu-item.focus,
      body.redflix-theme .redflix-menu-item.hover {
        color: #fff !important;
        background: rgba(229, 9, 20, .16) !important;
        border-radius: 1.1em !important;
      }

      body.redflix-theme .redflix-menu-dot {
        background: #e50914;
        border-radius: 999px;
        box-shadow: 0 0 1em rgba(229, 9, 20, .75);
        display: inline-block;
        height: .55em;
        margin-right: .6em;
        vertical-align: middle;
        width: .55em;
      }

      .redflix-lampa-root {
        background:
          radial-gradient(circle at 20% 0%, rgba(229, 9, 20, .34), transparent 28em),
          radial-gradient(circle at 80% 10%, rgba(120, 0, 8, .26), transparent 22em),
          #050000;
        box-sizing: border-box;
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        height: 100%;
        min-height: 100vh;
        overflow-y: auto;
        padding: 2.2em 2.4em 8em;
      }

      .redflix-topbar {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-bottom: 1.4em;
      }

      .redflix-brand {
        color: #e50914;
        font-size: 1.05em;
        font-weight: 900;
        letter-spacing: .32em;
        text-transform: uppercase;
      }

      .redflix-hero {
        background-image: linear-gradient(180deg, rgba(0,0,0,.05), #050000 92%), linear-gradient(90deg, rgba(0,0,0,.6), transparent), url('${heroImage}');
        background-position: center top;
        background-size: cover;
        border-radius: 0;
        box-sizing: border-box;
        min-height: 31em;
        overflow: hidden;
        padding: 3em 2em 2em;
        position: relative;
      }

      .redflix-hero:after {
        animation: redflix-lampa-sheen 4.8s ease-in-out infinite;
        background: linear-gradient(110deg, transparent 0%, transparent 36%, rgba(255,255,255,.1) 47%, transparent 58%, transparent 100%);
        content: '';
        inset: 0;
        pointer-events: none;
        position: absolute;
        transform: translateX(-120%);
      }

      .redflix-hero-content {
        max-width: 44em;
        padding-top: 11em;
        position: relative;
        z-index: 2;
      }

      .redflix-title {
        font-size: 3.1em;
        font-weight: 950;
        letter-spacing: -.04em;
        line-height: .95;
        margin: 0 0 .22em;
        text-shadow: 0 .15em .55em rgba(0,0,0,.85);
      }

      .redflix-subtitle {
        color: rgba(255,255,255,.72);
        font-size: 1.1em;
        font-weight: 700;
        margin-bottom: .9em;
      }

      .redflix-badges {
        display: flex;
        flex-wrap: wrap;
        gap: .55em;
        margin: .75em 0;
      }

      .redflix-badge {
        background: rgba(255,255,255,.16);
        border-radius: 999px;
        color: #fff;
        font-size: .88em;
        font-weight: 900;
        padding: .55em .85em;
      }

      .redflix-badge.gold {
        background: #e6bf31;
        color: #070000;
      }

      .redflix-actions {
        align-items: center;
        display: flex;
        gap: .8em;
        margin-top: 1.25em;
      }

      .redflix-play {
        align-items: center;
        background: linear-gradient(135deg, #e50914, #b20710) !important;
        border-radius: 999px;
        color: #fff !important;
        display: inline-flex;
        font-size: 1.05em;
        font-weight: 950;
        gap: .55em;
        min-width: 15em;
        padding: 1em 2.1em;
      }

      .redflix-round {
        align-items: center;
        background: rgba(255,255,255,.13) !important;
        border-radius: 999px;
        color: #fff !important;
        display: inline-flex;
        font-size: 1.1em;
        height: 3em;
        justify-content: center;
        width: 3em;
      }

      .redflix-row {
        margin-top: 2.6em;
      }

      .redflix-row-head {
        align-items: end;
        display: flex;
        justify-content: space-between;
        margin-bottom: 1.1em;
      }

      .redflix-line {
        background: #e50914;
        border-radius: 999px;
        box-shadow: 0 0 1.1em rgba(229, 9, 20, .8);
        height: .23em;
        margin-bottom: .8em;
        width: 3.4em;
      }

      .redflix-row-title {
        font-size: 1.7em;
        font-weight: 950;
        line-height: 1;
      }

      .redflix-row-subtitle {
        color: rgba(255,255,255,.42);
        font-size: .95em;
        font-weight: 700;
        margin-top: .55em;
      }

      .redflix-all {
        background: rgba(255,255,255,.09) !important;
        border-radius: 999px;
        color: #e50914 !important;
        font-weight: 950;
        padding: .75em 1.2em;
      }

      .redflix-posters {
        display: flex;
        gap: 1em;
        overflow-x: auto;
        padding: .2em .2em 1em;
      }

      .redflix-poster {
        aspect-ratio: .68;
        background-color: #170004;
        background-position: center;
        background-size: cover;
        border-radius: 1.05em;
        box-shadow: 0 1.2em 2.4em rgba(0,0,0,.42);
        flex: 0 0 9.5em;
        overflow: hidden;
        position: relative;
        transition: transform .18s ease, box-shadow .18s ease;
      }

      .redflix-poster:after {
        background: linear-gradient(180deg, transparent 28%, rgba(0,0,0,.9));
        content: '';
        inset: 0;
        position: absolute;
      }

      .redflix-poster-title {
        bottom: .75em;
        box-sizing: border-box;
        color: #fff;
        font-size: .95em;
        font-weight: 950;
        left: 0;
        line-height: 1.08;
        padding: 0 .75em;
        position: absolute;
        right: 0;
        z-index: 2;
      }

      .redflix-meta {
        background: rgba(0,0,0,.72);
        border: .12em solid rgba(230,191,49,.55);
        border-radius: 999px;
        color: #f4d86b;
        font-size: .72em;
        font-weight: 950;
        left: .7em;
        padding: .45em .65em;
        position: absolute;
        top: .7em;
        z-index: 3;
      }

      .redflix-new {
        background: #e50914;
        border-radius: 999px;
        color: #fff;
        font-size: .72em;
        font-weight: 950;
        padding: .7em .58em;
        position: absolute;
        right: .65em;
        top: .65em;
        z-index: 3;
      }

      .redflix-bottom {
        align-items: center;
        background: rgba(0,0,0,.86);
        border-radius: 1.4em;
        bottom: 1.1em;
        display: flex;
        gap: .6em;
        justify-content: space-around;
        left: 2.4em;
        padding: .7em 1em;
        position: fixed;
        right: 2.4em;
        z-index: 9;
      }

      .redflix-navitem {
        color: rgba(255,255,255,.46) !important;
        font-weight: 900;
        padding: .55em .75em;
      }

      .redflix-navitem.active {
        color: #e50914 !important;
      }

      @keyframes redflix-lampa-sheen {
        0%, 44% { transform: translateX(-120%); }
        100% { transform: translateX(120%); }
      }

      @media screen and (max-width: 640px) {
        .redflix-lampa-root { padding: 1.2em 1em 6em; }
        .redflix-hero { margin-left: -1em; margin-right: -1em; min-height: 34em; padding-left: 1em; padding-right: 1em; }
        .redflix-title { font-size: 2.45em; }
        .redflix-play { min-width: 13em; }
        .redflix-poster { flex-basis: 8.5em; }
        .redflix-bottom { left: 1em; right: 1em; }
      }
    `;

    document.head.appendChild(css);
    document.body.classList.add('redflix-theme');
  }

  function posterHtml(item, index) {
    var title = escapeHtml(item[0]);
    var meta = escapeHtml(item[1]);
    var image = escapeHtml(item[2]);
    var isNew = item[3] ? '<div class="redflix-new">' + escapeHtml(item[3]) + '</div>' : '';

    return '<div class="redflix-poster selector" data-redflix-action="poster" data-index="' + index + '" style="background-image: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.25)), url(' + image + ')">' +
      '<div class="redflix-meta">' + meta + '</div>' +
      isNew +
      '<div class="redflix-poster-title">' + title + '</div>' +
      '</div>';
  }

  function rowHtml(row, rowIndex) {
    var items = row.items.map(function (item, index) {
      return posterHtml(item, rowIndex + '-' + index);
    }).join('');

    return '<section class="redflix-row">' +
      '<div class="redflix-row-head">' +
        '<div><div class="redflix-line"></div><div class="redflix-row-title">' + escapeHtml(row.title) + '</div>' +
        (row.subtitle ? '<div class="redflix-row-subtitle">' + escapeHtml(row.subtitle) + '</div>' : '') + '</div>' +
        '<div class="redflix-all selector" data-redflix-action="all">Все</div>' +
      '</div>' +
      '<div class="redflix-posters">' + items + '</div>' +
    '</section>';
  }

  function renderHome() {
    return '<div class="redflix-topbar">' +
        '<div><div class="redflix-brand">RedFlix</div><div style="font-size:2em;font-weight:950;margin-top:.15em">Главная</div></div>' +
        '<div class="redflix-round selector" data-redflix-action="favorite">♡</div>' +
      '</div>' +
      '<section class="redflix-hero">' +
        '<div class="redflix-hero-content">' +
          '<h1 class="redflix-title">Аватар: Пламя и пепел</h1>' +
          '<div class="redflix-subtitle">Avatar: Fire and Ash</div>' +
          '<div class="redflix-badges"><span class="redflix-badge gold">КП 7.6</span><span class="redflix-badge gold">IMDb 7.4</span><span class="redflix-badge">2025</span><span class="redflix-badge">03:17</span><span class="redflix-badge">HD</span></div>' +
          '<div class="redflix-badges"><span class="redflix-badge">боевик</span><span class="redflix-badge">приключения</span><span class="redflix-badge">фэнтези</span><span class="redflix-badge">фантастика</span><span class="redflix-badge">США</span><span class="redflix-badge">Канада</span></div>' +
          '<div class="redflix-actions"><div class="redflix-play selector" data-redflix-action="play">▶ Смотреть</div><div class="redflix-round selector" data-redflix-action="bookmark">▣</div><div class="redflix-round selector" data-redflix-action="like">♡</div><div class="redflix-round selector" data-redflix-action="share">↗</div></div>' +
        '</div>' +
      '</section>' +
      rows.map(rowHtml).join('') +
      '<nav class="redflix-bottom"><div class="redflix-navitem selector active" data-redflix-action="nav">Главная</div><div class="redflix-navitem selector" data-redflix-action="nav">TV</div><div class="redflix-navitem selector" data-redflix-action="nav">Поиск</div><div class="redflix-navitem selector" data-redflix-action="nav">Мое</div><div class="redflix-navitem selector" data-redflix-action="nav">Профиль</div></nav>';
  }

  function notify(message) {
    if (window.Lampa && Lampa.Noty && Lampa.Noty.show) {
      Lampa.Noty.show(message);
    } else {
      console.log('[RedFlix]', message);
    }
  }

  function bindActions(root) {
    root.addEventListener('click', function (event) {
      var target = event.target.closest('[data-redflix-action]');
      if (!target) return;

      var action = target.getAttribute('data-redflix-action');

      if (action === 'play') notify('RedFlix: подключите свой источник/онлайн-плагин для запуска фильма.');
      else if (action === 'poster') notify('RedFlix: карточка открыта в демо-витрине.');
      else if (action === 'all') notify('RedFlix: раздел можно связать с нужной категорией Lampa.');
      else notify('RedFlix: действие интерфейса выполнено.');
    });

    root.addEventListener('hover:enter', function (event) {
      var target = event.target.closest('[data-redflix-action]');
      if (target) target.click();
    });
  }

  function registerComponent() {
    if (!window.Lampa || !Lampa.Component || window.redflix_component_registered) return;

    window.redflix_component_registered = true;

    Lampa.Component.add(COMPONENT_NAME, function () {
      var root;

      this.create = function () {
        root = document.createElement('div');
        root.className = 'redflix-lampa-root';
        root.innerHTML = renderHome();
        bindActions(root);
        return root;
      };

      this.render = function () {
        return root;
      };

      this.start = function () {
        if (!root) this.create();

        if (window.Lampa && Lampa.Controller) {
          Lampa.Controller.add('content', {
            toggle: function () {
              try {
                Lampa.Controller.collectionSet(root);
                var first = root.querySelector('.selector');
                if (first && Lampa.Controller.collectionFocus) Lampa.Controller.collectionFocus(first, root);
              } catch (error) {}
            },
            left: function () {
              if (Lampa.Controller.toggle) Lampa.Controller.toggle('menu');
            },
            back: function () {
              if (Lampa.Activity && Lampa.Activity.backward) Lampa.Activity.backward();
            }
          });

          Lampa.Controller.toggle('content');
        }
      };

      this.pause = function () {};
      this.stop = function () {};
      this.destroy = function () {
        if (root && root.remove) root.remove();
      };
    });
  }

  function openRedFlix() {
    registerComponent();

    if (window.Lampa && Lampa.Activity && Lampa.Activity.push) {
      Lampa.Activity.push({
        url: COMPONENT_NAME,
        title: 'RedFlix',
        component: COMPONENT_NAME,
        page: 1
      });
    } else {
      notify('Lampa API не найден. Откройте файл как плагин внутри Lampa.');
    }
  }

  function addMenuItem() {
    var menu = document.querySelector('.menu__list') || document.querySelector('.menu .scroll') || document.querySelector('.menu');
    if (!menu || document.querySelector('.redflix-menu-item')) return;

    var item = document.createElement('div');
    item.className = 'menu__item selector redflix-menu-item';
    item.setAttribute('data-action', 'redflix');
    item.innerHTML = '<span class="redflix-menu-dot"></span><span>RedFlix</span>';
    item.addEventListener('click', openRedFlix);
    item.addEventListener('hover:enter', openRedFlix);
    menu.appendChild(item);
  }

  function startPlugin() {
    addStyle();
    registerComponent();
    addMenuItem();

    if (window.Lampa && Lampa.Listener && !window.redflix_listener_registered) {
      window.redflix_listener_registered = true;
      Lampa.Listener.follow('activity', function () {
        setTimeout(addMenuItem, 300);
      });
      Lampa.Listener.follow('menu', function () {
        setTimeout(addMenuItem, 300);
      });
    }

    window.RedFlixLampa = {
      version: VERSION,
      open: openRedFlix
    };
  }

  if (window.Lampa && Lampa.Listener) {
    Lampa.Listener.follow('app', function (event) {
      if (!event || event.type === 'ready') startPlugin();
    });
  }

  setTimeout(startPlugin, 500);
  setTimeout(addMenuItem, 1500);
})();