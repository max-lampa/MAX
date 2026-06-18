/*
 * Lampa RedFlix Theme — v2.0.0
 * ЧИСТАЯ ТЕМА: только CSS-стили + пункт меню.
 * Никаких Component.add / Activity.push / Controller — только визуальная тема.
 */
(function () {
  'use strict';

  if (window.__redflix_theme_loaded) return;
  window.__redflix_theme_loaded = true;

  /* ═══════════════════════════════════════════
     1. CSS — вставляем один раз
  ═══════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('redflix-theme-css')) return;

    var css = [
      /* ── Глобальный фон и текст ── */
      'body, .app, .app__body, .content, .activity, .activity__body,',
      '.main, .background, .background__img {',
      '  background-color: #050000 !important;',
      '  color: #fff !important;',
      '}',

      /* Шапка / меню */
      '.head, .menu, .menu__body, .menu__list, .modal, .selectbox,',
      '.selectbox__list, .settings, .settings__body {',
      '  background: rgba(5,0,0,0.95) !important;',
      '  color: #fff !important;',
      '}',

      /* Карточки */
      '.card__view, .card-more__box, .card__poster {',
      '  background-color: #130003 !important;',
      '  border-radius: 1.1em !important;',
      '  overflow: hidden !important;',
      '}',

      /* Фокус карточек */
      '.card.focus .card__view, .card.hover .card__view,',
      '.selector.focus, .selector.hover {',
      '  box-shadow: 0 0 0 0.22em #e50914, 0 0 2em rgba(229,9,20,0.5) !important;',
      '  transform: scale(1.03) !important;',
      '}',

      /* Кнопки play / активные */
      '.full-start__button, .button--play, .selector.active,',
      '.full-start__play, .full-start__play-icon {',
      '  background: linear-gradient(135deg,#e50914,#b20710) !important;',
      '  color: #fff !important;',
      '}',

      /* Пункты меню */
      '.menu__item { color: rgba(255,255,255,0.65) !important; }',
      '.menu__item.focus, .menu__item.hover, .menu__item.active {',
      '  color: #fff !important;',
      '  background: rgba(229,9,20,0.18) !important;',
      '  border-radius: 0.9em !important;',
      '}',

      /* Dot у нашего пункта */
      '.rf-menu-dot {',
      '  display: inline-block; width: 0.55em; height: 0.55em;',
      '  background: #e50914; border-radius: 50%;',
      '  box-shadow: 0 0 0.8em rgba(229,9,20,0.8);',
      '  margin-right: 0.65em; vertical-align: middle;',
      '}',

      /* Скроллбары */
      '::-webkit-scrollbar { width: 0.4em; height: 0.4em; }',
      '::-webkit-scrollbar-track { background: #0a0000; }',
      '::-webkit-scrollbar-thumb { background: #e50914; border-radius: 999px; }',

      /* Поля ввода */
      '.input, input, textarea {',
      '  background: #1a0005 !important;',
      '  color: #fff !important;',
      '  border-color: rgba(229,9,20,0.35) !important;',
      '}',

      /* Тайтлы, подписи */
      '.card__title, .card__age, .full-start__title, .full-start__tag,',
      '.title, .head__title {',
      '  color: #fff !important;',
      '}',

      /* Рейтинг звёзды / цифры */
      '.card__rate, .rate {',
      '  color: #e6bf31 !important;',
      '}',

      /* Прогресс-бар */
      '.timeline__line, .progress__filled, .player__timeline-filled {',
      '  background: #e50914 !important;',
      '}',

      /* Модалки, попапы */
      '.modal__content, .modal__body, .info, .info__body {',
      '  background: #0d0002 !important;',
      '  border: 1px solid rgba(229,9,20,0.2) !important;',
      '  border-radius: 1.2em !important;',
      '}',

      /* Вкладки / табы */
      '.tabs__item.active, .tabs__item.focus {',
      '  background: #e50914 !important;',
      '  color: #fff !important;',
      '  border-radius: 999px !important;',
      '}',

      /* Уведомления */
      '.noty { background: #1a0005 !important; border-left: 0.25em solid #e50914 !important; }',

      /* Плеер */
      '.player, .player__wrap { background: #000 !important; }',
      '.player__panel { background: linear-gradient(transparent, rgba(5,0,0,0.9)) !important; }',

      /* Оверлей hero full-start */
      '.full-start, .full-start__background { background: transparent !important; }',
      '.full-start__gradient {',
      '  background: linear-gradient(90deg, rgba(5,0,0,0.92) 38%, transparent) !important;',
      '}',

      /* Кнопки действий */
      '.full-start__buttons .selector {',
      '  background: rgba(255,255,255,0.1) !important;',
      '  border-radius: 999px !important;',
      '}',
      '.full-start__buttons .selector.focus, .full-start__buttons .selector.hover {',
      '  background: rgba(229,9,20,0.75) !important;',
      '}',

      /* Catalogue items */
      '.catalogue, .catalogue__body { background: transparent !important; }',

      /* Separator / divider */
      '.separator, .line { background: rgba(229,9,20,0.3) !important; }',
    ].join('\n');

    var style = document.createElement('style');
    style.id = 'redflix-theme-css';
    style.textContent = css;
    document.head.appendChild(style);
    document.body.classList.add('redflix-theme');
    console.log('[RedFlix Theme] CSS injected');
  }

  /* ═══════════════════════════════════════════
     2. Пункт меню (опционально)
  ═══════════════════════════════════════════ */
  function tryAddMenuItem() {
    if (document.querySelector('.rf-menu-item')) return true;

    var container = document.querySelector(
      '.menu__list, .menu .scroll__body, .menu__body'
    );
    if (!container) return false;

    var item = document.createElement('div');
    item.className = 'menu__item selector rf-menu-item';
    item.innerHTML = '<span class="rf-menu-dot"></span><span>RedFlix</span>';

    /* Нажатие OK на пульте или клик мышью */
    item.addEventListener('click', function () {
      if (window.Lampa && Lampa.Noty) Lampa.Noty.show('RedFlix тема активна!');
    });

    try {
      if (window.$) {
        $(item).on('hover:enter', function () {
          if (window.Lampa && Lampa.Noty) Lampa.Noty.show('RedFlix тема активна!');
        });
      }
    } catch(e) {}

    container.appendChild(item);
    return true;
  }

  var _menuObs;
  function watchForMenu() {
    if (_menuObs) return;
    _menuObs = new MutationObserver(function () {
      if (tryAddMenuItem()) {
        _menuObs.disconnect();
        _menuObs = null;
      }
    });
    _menuObs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     3. Запуск
  ═══════════════════════════════════════════ */
  function init() {
    injectCSS();
    if (!tryAddMenuItem()) watchForMenu();
    window.RedFlixTheme = { version: '2.0.0' };
    console.log('[RedFlix Theme] v2.0.0 ready');
  }

  /* Lampa ещё не загружена → ждём события */
  if (window.Lampa && Lampa.Listener) {
    var fired = false;
    Lampa.Listener.follow('app', function (e) {
      if (!fired && (!e || e.type === 'ready')) {
        fired = true;
        init();
      }
    });
  }

  /* Всегда запускаем через 300 мс как страховку */
  setTimeout(init, 300);
})();