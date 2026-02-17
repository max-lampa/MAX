(function () {
    'use strict';

    var DEFAULT_PLUGIN = 'default';

    // Общие стили для качества видео (будут добавлены ко всем темам)
    var qualityColorsCSS = `
        .card__quality, 
        .card-v2 .card__quality {
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        /* 4K */
        .card__quality[data-quality="4K"],
        .card-v2 .card__quality[data-quality="4K"] {
            background: linear-gradient(135deg, #8a2be2, #6a5acd) !important;
            color: white !important;
        }
        
        /* WEB-DL */
        .card__quality[data-quality="WEB-DL"],
        .card-v2 .card__quality[data-quality="WEB-DL"] {
            background: linear-gradient(135deg, #1e90ff, #4169e1) !important;
            color: black !important;
        }
        
        /* BD/BDRIP */
        .card__quality[data-quality="BD"],
        .card__quality[data-quality="BDRIP"],
        .card-v2 .card__quality[data-quality="BD"],
        .card-v2 .card__quality[data-quality="BDRIP"] {
            background: linear-gradient(135deg, #ffd700, #daa520) !important;
            color: black !important;
        }
        
        /* HDTV */
        .card__quality[data-quality="HDTV"],
        .card-v2 .card__quality[data-quality="HDTV"] {
            background: linear-gradient(135deg, #2ecc71, #27ae60) !important;
            color: white !important;
        }
        
        /* TC/TS/TELECINE */
        .card__quality[data-quality="TC"],
        .card__quality[data-quality="TS"],
        .card__quality[data-quality="TELECINE"],
        .card-v2 .card__quality[data-quality="TC"],
        .card-v2 .card__quality[data-quality="TS"],
        .card-v2 .card__quality[data-quality="TELECINE"] {
            background: linear-gradient(135deg, #ff6b6b, #e74c3c) !important;
            color: white !important;
        }
        
        /* VHS */
        .card__quality[data-quality="VHS"],
        .card-v2 .card__quality[data-quality="VHS"] {
            background: linear-gradient(135deg, #00cccc, #009999) !important;
            color: white !important;
        }
        
        /* DVDRIP */
        .card__quality[data-quality="DVDRIP"],
        .card-v2 .card__quality[data-quality="DVDRIP"] {
            background: linear-gradient(135deg, #88ff88, #aaffaa) !important;
            color: black !important;
        }
        
        /* DVB */
        .card__quality[data-quality="DVB"],
        .card-v2 .card__quality[data-quality="DVB"] {
            background: linear-gradient(135deg, #ffddbb, #ff99cc) !important;
            color: black !important;
        }
        
        /* По умолчанию */
        .card__quality:not([data-quality]),
        .card-v2 .card__quality:not([data-quality]) {
            background: #fff816 !important;
            color: black !important;
        }
    `;

    // Встроенные темы CSS
    var themes = {
        prisma: `
        
/* =========== КАРТОЧКИ КОНТЕНТА =========== */
.card.focus, .card.hover {
    /* Анимация увеличения при фокусе */
    z-index: 2;
    transform: scale(1.1);
    outline: none;
}

.card--tv .card__type {
    /* Бейдж типа контента (ТВ) */
    position: absolute;
    background: linear-gradient(90deg, #69ffbd, #62a3c9);
    color: #000;
    z-index: 4;
}

/* =========== ЭФФЕКТЫ ВЫДЕЛЕНИЯ =========== */
.card.focus .card__view::before,
.card.hover .card__view::before {
    /* Элемент свечения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border-radius: 1.4em;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0 0 0 #6666ff;
    animation: glow-pulse 1s 0.4s infinite ease-in-out;
}
.full-episode.focus::after,
.extensions__item.focus::after,
.explorer-card__head-img.focus::after,
.torrent-item.focus::after {
    /* Общий стиль рамки выделения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid #69ffbd;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
}

.card.focus .card__view::after, 
.card.hover .card__view::after {
    /* Элемент рамки */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid transparent;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
    clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    animation: 
        border-draw 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards,
        border-glow 0.5s 0.5s ease-out forwards;
}

@keyframes border-draw {
    0% {
        border-color: transparent;
        clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    }
    25% {
        border-top-color: #69ffbd;
        clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0);
    }
    50% {
        border-right-color: #69ffbd;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%);
    }
    75% {
        border-bottom-color: #69ffbd;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
    }
    100% {
        border-color: #69ffbd;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
}

@keyframes border-glow {
    0% {
        border-color: #69ffbd;
    }
    100% {
        border-color: #69ffbd;
    }
}

@keyframes glow-pulse {
    0%, 100% {
        opacity: 0.8;
        box-shadow: 0 0 16px #6666ff;
    }
    50% {
        opacity: 1;
        box-shadow: 0 0 16px #77ffff;
    }
}
/* Микрофон и клавиатура */
.search-source.active {
  opacity: 1;
  background-color: #62a3c9;
  color: #fff;
}

.simple-keyboard .hg-button[data-skbtn="{MIC}"] {
  color: #62a3c9;
}

/* =========== РЕЙТИНГИ И ГОЛОСОВАНИЕ =========== */
.card__vote {
    /* Контейнер рейтинга */
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 3px 3px;
    margin: 2px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #fff;
    align-items: center;
}

.card__vote::before {
    /* Иконка звезды */
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 -960 960 960'%3E%3Cpath fill='%2362a3c9' d='M349.923-241.308 480-320.077l131.077 79.769-34.615-148.307 115.384-99.924L540.077-502 480-642.308 420.923-503l-151.769 13.461 115.384 99.693-34.615 148.538ZM283-150.076l52.615-223.539-173.923-150.847 229.231-18.846L480-754.693l90.077 211.385 228.231 18.846-173.923 150.847L677-150.076 480-268.923 283-150.076Zm197-281.616Z'/%3E%3C/svg%3E");
    width: 24px;
    height: 24px;
    margin-bottom: 1px;
    display: flex;
    justify-content: center;
}

.card__vote-count {
    /* Число рейтинга */
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
}

.explorer-card__head-rate {
    /* Рейтинг в карточке */
    color: #62a3c9;
}

.explorer-card__head-rate > svg {
    /* Иконка звезды */
    width: 1.5em !important;
    height: 1.5em !important;
    margin-right: 0.5em;
}

.explorer-card__head-rate > span {
    /* Число рейтинга */
    font-size: 1.5em;
    font-weight: 600;
}

.full-start__rate {
    /* Облик рейтинга в описании карточки */
  background: rgb(98 163 201 / 3%);
  -webkit-border-radius: 0.3em;
  -moz-border-radius: 0.3em;
  border-radius: 0.3em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: 1.45em;
  margin-right: 1em;
}

/* Общие стили для всех иконок рейтингов */
.full-start__rate > div:last-child,
.full-start__rate .source--name {
  font-size: 0; /* Скрываем текст */
  color: transparent;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

/* TMDB из официального лого */
.rate--tmdb .source--name {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 185.04 133.4'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:url(%23linear-gradient);%7D%3C/style%3E%3ClinearGradient id='linear-gradient' y1='66.7' x2='185.04' y2='66.7' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2390cea1'/%3E%3Cstop offset='0.56' stop-color='%233cbec9'/%3E%3Cstop offset='1' stop-color='%2300b3e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctitle%3EAsset 4%3C/title%3E%3Cg id='Layer_2' data-name='Layer 2'%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Cpath class='cls-1' d='M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h-.1A17.67,17.67,0,0,1,86.3,66.7h0A17.67,17.67,0,0,1,68.63,84.37h.1A17.67,17.67,0,0,1,51.06,66.7Zm82.67-31.33h32.9A17.67,17.67,0,0,0,184.3,17.7h0A17.67,17.67,0,0,0,166.63,0h-32.9A17.67,17.67,0,0,0,116.06,17.7h0A17.67,17.67,0,0,0,133.73,35.37Zm-113,98h63.9A17.67,17.67,0,0,0,102.3,115.7h0A17.67,17.67,0,0,0,84.63,98H20.73A17.67,17.67,0,0,0,3.06,115.7h0A17.67,17.67,0,0,0,20.73,133.37Zm83.92-49h6.25L125.5,49h-8.35l-8.9,23.2h-.1L99.4,49H90.5Zm32.45,0h7.8V49h-7.8Zm22.2,0h24.95V77.2H167.1V70h15.35V62.8H167.1V56.2h16.25V49h-24ZM10.1,35.4h7.8V6.9H28V0H0V6.9H10.1ZM39,35.4h7.8V20.1H61.9V35.4h7.8V0H61.9V13.2H46.75V0H39Zm41.25,0h25V28.2H88V21h15.35V13.8H88V7.2h16.25V0h-24Zm-79,49H9V57.25h.1l9,27.15H24l9.3-27.15h.1V84.4h7.8V49H29.45l-8.2,23.1h-.1L13,49H1.2Zm112.09,49H126a24.59,24.59,0,0,0,7.56-1.15,19.52,19.52,0,0,0,6.35-3.37,16.37,16.37,0,0,0,4.37-5.5A16.91,16.91,0,0,0,146,115.8a18.5,18.5,0,0,0-1.68-8.25,15.1,15.1,0,0,0-4.52-5.53A18.55,18.55,0,0,0,133.07,99,33.54,33.54,0,0,0,125,98H113.29Zm7.81-28.2h4.6a17.43,17.43,0,0,1,4.67.62,11.68,11.68,0,0,1,3.88,1.88,9,9,0,0,1,2.62,3.18,9.87,9.87,0,0,1,1,4.52,11.92,11.92,0,0,1-1,5.08,8.69,8.69,0,0,1-2.67,3.34,10.87,10.87,0,0,1-4,1.83,21.57,21.57,0,0,1-5,.55H121.1Zm36.14,28.2h14.5a23.11,23.11,0,0,0,4.73-.5,13.38,13.38,0,0,0,4.27-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68,9.16,9.16,0,0,0-.55-3.2,7.79,7.79,0,0,0-1.57-2.62,8.38,8.38,0,0,0-2.45-1.85,10,10,0,0,0-3.18-1v-.1a9.28,9.28,0,0,0,4.43-2.82,7.42,7.42,0,0,0,1.67-5,8.34,8.34,0,0,0-1.15-4.65,7.88,7.88,0,0,0-3-2.73,12.9,12.9,0,0,0-4.17-1.3,34.42,34.42,0,0,0-4.63-.32h-13.2Zm7.8-28.8h5.3a10.79,10.79,0,0,1,1.85.17,5.77,5.77,0,0,1,1.7.58,3.33,3.33,0,0,1,1.23,1.13,3.22,3.22,0,0,1,.47,1.82,3.63,3.63,0,0,1-.42,1.8,3.34,3.34,0,0,1-1.13,1.2,4.78,4.78,0,0,1-1.57.65,8.16,8.16,0,0,1-1.78.2H165Zm0,14.15h5.9a15.12,15.12,0,0,1,2.05.15,7.83,7.83,0,0,1,2,.55,4,4,0,0,1,1.58,1.17,3.13,3.13,0,0,1,.62,2,3.71,3.71,0,0,1-.47,1.95,4,4,0,0,1-1.23,1.3,4.78,4.78,0,0,1-1.67.7,8.91,8.91,0,0,1-1.83.2h-7Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* IMDb из официального лого */
.rate--imdb > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg fill='%23ffcc00' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
}

/* Кинопоиск из официального лого */
.rate--kp > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0_1_69' style='mask-type:alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='300' height='300'%3E%3Ccircle cx='150' cy='150' r='150' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_1_69)'%3E%3Ccircle cx='150' cy='150' r='150' fill='black'/%3E%3Cpath d='M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z' fill='url(%23paint0_radial_1_69)'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint0_radial_1_69' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(89.9999 45) rotate(45) scale(296.985)'%3E%3Cstop offset='0.5' stop-color='%23FF5500'/%3E%3Cstop offset='1' stop-color='%23BBFF00'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E");
}

/* =========== КНОПКИ И ФОКУС =========== */
.full-start__button {
  margin-right: 0.75em;
  font-size: 1.3em;
  background-color: rgb(98 163 201 / 20%);
  padding: 0.3em 1em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 2.8em;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

/* Стиль для состояния кнопок при фокусе focus */
.full-start__button.focus {
  background: linear-gradient(90deg, #69ffbd, #62a3c9);
  color: #fff;
}

/* =========== НАВИГАЦИЯ И МЕНЮ =========== */
.menu__item.focus, 
.menu__item.traverse, 
.menu__item.hover,
.menuitem.focus.red,
.menuitem.traverse.red,
.menu__item.hover.red,
.broadcast__scan > div,
.broadcast__device.focus,
.head__action.focus, 
.head__action.hover,
.settings-param.focus,
.simple-button.focus,
.selectbox-item.focus,
.full-person.focus {
    /* Общие стили для активных элементов */
    background: linear-gradient(90deg, #69ffbd, #62a3c9);
    color: #000;
    border-radius: 1em;
}

.tag-count.focus {
    /* Особый стиль для тегов */
    background: linear-gradient(90deg, #69ffbd, #62a3c9);
    color: #000;
}

.settings-folder.focus {
    /* Папка в настройках */
    background: linear-gradient(90deg, #69ffbd, #62a3c9);
    border-radius: 1em;
    color: #000;
}

.head__action {
    /* Радиус фокуса */
    border-radius: 20%;
}

/* =========== ИНДИКАТОРЫ И БЕЙДЖИ =========== */
.extensions__cub {
    /* Бейдж расширений */
    position: absolute;
    top: 1em;
    right: 1em;
    background-color: rgba(34, 229, 10, 0.32);
    border-radius: 0.3em;
    padding: 0.3em 0.4em;
    font-size: 0.78em;
}

.head__action.active::after {
    /* Индикатор активности */
    content: "";
    display: block;
    width: 0.5em;
    height: 0.5em;
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(90deg, #69ffbd, #62a3c9);
    border: 0.1em solid #fff;
    border-radius: 100%;
}

.explorer-card__head-age {
    /* Бейдж возраста */
    border: 1px solid #ffff77;
    border-radius: 0.2em;
    padding: 0.2em 0.3em;
    margin-top: 1.4em;
    font-size: 0.9em;
}

/* =========== ЛОАДЕРЫ =========== */
.activity__loader {
    /* Полноэкранный лоадер */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100px' height='100px' viewBox='0 0 100 100'%3E%3Crect y='25' width='10' height='50' rx='4' ry='4' fill='%23fff'%3E%3Canimate attributeName='x' values='10;100' dur='1.2s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 10 70' to='-60 100 70' dur='1.2s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0;1;0' dur='1.2s' repeatCount='indefinite'/%3E%3C/rect%3E%3Crect y='25' width='10' height='50' rx='4' ry='4' fill='%23fff'%3E%3Canimate attributeName='x' values='10;100' dur='1.2s' begin='0.4s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 10 70' to='-60 100 70' dur='1.2s' begin='0.4s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0;1;0' dur='1.2s' begin='0.4s' repeatCount='indefinite'/%3E%3C/rect%3E%3Crect y='25' width='10' height='50' rx='4' ry='4' fill='%23fff'%3E%3Canimate attributeName='x' values='10;100' dur='1.2s' begin='0.8s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 10 70' to='-60 100 70' dur='1.2s' begin='0.8s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0;1;0' dur='1.2s' begin='0.8s' repeatCount='indefinite'/%3E%3C/rect%3E%3C/svg%3E") no-repeat 50% 50%;
}

.modal-loading {
    /* Лоадер в модальном окне */
    height: 6em;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100px' height='100px' viewBox='0 0 100 100'%3E%3Crect y='25' width='10' height='50' rx='4' ry='4' fill='%23fff'%3E%3Canimate attributeName='x' values='10;100' dur='1.2s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 10 70' to='-60 100 70' dur='1.2s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0;1;0' dur='1.2s' repeatCount='indefinite'/%3E%3C/rect%3E%3Crect y='25' width='10' height='50' rx='4' ry='4' fill='%23fff'%3E%3Canimate attributeName='x' values='10;100' dur='1.2s' begin='0.4s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 10 70' to='-60 100 70' dur='1.2s' begin='0.4s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0;1;0' dur='1.2s' begin='0.4s' repeatCount='indefinite'/%3E%3C/rect%3E%3Crect y='25' width='10' height='50' rx='4' ry='4' fill='%23fff'%3E%3Canimate attributeName='x' values='10;100' dur='1.2s' begin='0.8s' repeatCount='indefinite'/%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 10 70' to='-60 100 70' dur='1.2s' begin='0.8s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' values='0;1;0' dur='1.2s' begin='0.8s' repeatCount='indefinite'/%3E%3C/rect%3E%3C/svg%3E") no-repeat 50% 50%;
    background-size: contain;
}

/* =========== ПАНЕЛЬ НАСТРОЕК =========== */
.settings__content {
  position: fixed;
  top: 35;
  left: 100%;
  -webkit-transition: -webkit-transform 0.2s;
  transition: -webkit-transform 0.2s;
  -o-transition: -o-transform 0.2s;
  -moz-transition: transform 0.2s, -moz-transform 0.2s;
  transition: transform 0.2s;
  transition: transform 0.2s, -webkit-transform 0.2s, -moz-transform 0.2s, -o-transform 0.2s;
  background: #262829;
  width: 35%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -webkit-border-top-left-radius: 2em;
  -webkit-border-top-right-radius: 2em;
  -moz-box-orient: vertical;
  -moz-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  will-change: transform;
  /* Единственное добавление */
  max-height: 95vh;
  overflow-y: auto;
}

@media screen and (max-width: 767px) {
  .settings__content {
    width: 50%;
  }
}
@media screen and (max-width: 580px) {
  .settings__content {
    width: 70%;
  }
}
@media screen and (max-width: 480px) {
  .settings__content {
    width: 100%;
    left: 0;
    top: unset;
    bottom: 0;
    height: auto !important;
    -webkit-transition: none;
    -o-transition: none;
    -moz-transition: none;
    transition: none;
    -webkit-transform: translate3d(0, 100%, 0);
       -moz-transform: translate3d(0, 100%, 0);
            transform: translate3d(0, 100%, 0);
    -webkit-border-top-left-radius: 2em;
       -moz-border-radius-topleft: 2em;
            border-top-left-radius: 2em;
    -webkit-border-top-right-radius: 2em;
       -moz-border-radius-topright: 2em;
            border-top-right-radius: 2em;
    /* Единственное добавление для мобилок */
    max-height: 85vh;
  }
}

.head__action.open-settings {
  position: relative;
  display: inline-block;
}

.head__action.open-settings::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 40%, white 50%, transparent 60%);
  background-size: 400% 400%;
  animation: blink-effect 1s ease;
  pointer-events: none;
}

/* =========== ТОП-5 КАРТОЧКИ =========== */
.items-line--type-top .items-cards .card:nth-child(1)::before {
    /* Стиль для 1-го места */
    content: "1";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #62a3c9;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(2)::before {
    /* Стиль для 2-го места */
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #62a3c9;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(3)::before {
    /* Стиль для 3-го места */
    content: "3";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #62a3c9;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(4)::before {
    /* Стиль для 4-го места */
    content: "4";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #62a3c9;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(5)::before {
    /* Стиль для 5-го места */
    content: "5";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #62a3c9;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}
    /*Изменение расстояния 4 и 5 карточки */
.items-line--type-top .items-cards .card:nth-child(5) {
  margin-left: 3.7em;
}
.items-line--type-top .items-cards .card:nth-child(4) {
  margin-left: 3.7em;
}

.items-line__more.focus {
  background-color: #62a3c9;
  color: #000;
}

/* =========== ПЕРСОНЫ =========== */
.full-person__photo {
    /* Аватар персоны */
    width: 7em;
    height: 7em;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 1em;
    background-size: cover;
    background-position: 50% 50%;
    display: flex;
    align-items: center;
}

.full-start__pg, .full-start__status {
    /* Статус просмотра */
    font-size: 1.2em;
    border: 1px solid #ffeb3b;
    border-radius: 0.2em;
    padding: 0.3em;
}

/* =========== ВЫБОР ЭЛЕМЕНТОВ =========== */
.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Индикатор выбора */
    content: "";
    display: block;
    width: 1.2em;
    height: 1.2em;
    border: 0.15em solid #ccc;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 1.4em;
    transform: translateY(-50%);
}

.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Анимация заполнения круга */
    border-color: #fff;
    border-top-color: transparent; /* Начинаем с прозрачной верхней границы */
    animation: circle-fill 3s ease-in-out forwards; /* Плавная анимация с фиксацией конечного состояния */
}

@keyframes circle-fill {
    /* 
     * Анимация имитирует "заполнение" круга по часовой стрелке 
     * с одновременным изменением цвета границ
     */
    0% {
        transform: translateY(-50%) rotate(0deg);
        border-color: #ccc; /* Начальный цвет - серый */
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
    }
    25% {
        border-right-color: #fff; /* Появление правой границы */
    }
    50% {
        border-bottom-color: #fff; /* Появление нижней границы */
    }
    75% {
        border-left-color: #fff; /* Появление левой границы */
    }
    100% {
        transform: translateY(-50%) rotate(360deg); /* Полный оборот */
        border-color: #fff; /* Все границы белые */
        border-top-color: #fff; /* Верхняя граница становится видимой в конце */
        box-shadow: 0 0 0 3px rgba(98, 163, 201, 0.3); /* Дополнительный эффект свечения */
    }
}

/* Дополнительные состояния для лучшей визуализации */
.selectbox-item {
    position: relative;
    transition: all 0.3s ease;
}

.selectbox-item:hover {
    background-color: rgba(98, 163, 201, 0.1); /* Подсветка при наведении */
}

/* Не удалять, обводка рамки в модуле, действует как показатель какой цвет выбран */
            :root {
            --theme-accent-color: #69ffbd;
            }
            .button--primary {
                background-color: var(--theme-base-color);
            }
            
            ${qualityColorsCSS}
        `,
        blue: `
        
/* =========== КАРТОЧКИ КОНТЕНТА =========== */
.card.focus, .card.hover {
    /* Анимация увеличения при фокусе */
    z-index: 2;
    transform: scale(1.1);
    outline: none;
}

.card--tv .card__type {
    /* Бейдж типа контента (ТВ) */
    position: absolute;
    background: linear-gradient(90deg, #5555ff, #3333ff);
    color: #fff;
    z-index: 4;
}

/* =========== ЭФФЕКТЫ ВЫДЕЛЕНИЯ =========== */
.card.focus .card__view::before,
.card.hover .card__view::before {
    /* Элемент свечения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border-radius: 1.4em;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0 0 0 #6666ff;
    animation: glow-pulse 1s 0.4s infinite ease-in-out;
}
.full-episode.focus::after,
.extensions__item.focus::after,
.explorer-card__head-img.focus::after,
.torrent-item.focus::after {
    /* Общий стиль рамки выделения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid #3333ff;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
}

.card.focus .card__view::after, 
.card.hover .card__view::after {
    /* Элемент рамки */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid transparent;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
    clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    animation: 
        border-draw 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards,
        border-glow 0.5s 0.5s ease-out forwards;
}

@keyframes border-draw {
    0% {
        border-color: transparent;
        clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    }
    25% {
        border-top-color: #3333ff;
        clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0);
    }
    50% {
        border-right-color: #3333ff;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%);
    }
    75% {
        border-bottom-color: #3333ff;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
    }
    100% {
        border-color: #3333ff;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
}

@keyframes border-glow {
    0% {
        border-color: #3333ff;
    }
    100% {
        border-color: #3333ff;
    }
}

@keyframes glow-pulse {
    0%, 100% {
        opacity: 0.8;
        box-shadow: 0 0 16px #6666ff;
    }
    50% {
        opacity: 1;
        box-shadow: 0 0 16px #8888ff;
    }
}

/* Микрофон и клавиатура */
.search-source.active {
  opacity: 1;
  background-color: #3333ff;
  color: #fff;
}

.simple-keyboard .hg-button[data-skbtn="{MIC}"] {
  color: #3333ff;
}

/* =========== РЕЙТИНГИ И ГОЛОСОВАНИЕ =========== */
.card__vote {
    /* Контейнер рейтинга */
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 3px 3px;
    margin: 2px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #fff;
    align-items: center;
}

.card__vote::before {
    /* Иконка звезды */
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 -960 960 960'%3E%3Cpath fill='%233333ff' d='M349.923-241.308 480-320.077l131.077 79.769-34.615-148.307 115.384-99.924L540.077-502 480-642.308 420.923-503l-151.769 13.461 115.384 99.693-34.615 148.538ZM283-150.076l52.615-223.539-173.923-150.847 229.231-18.846L480-754.693l90.077 211.385 228.231 18.846-173.923 150.847L677-150.076 480-268.923 283-150.076Zm197-281.616Z'/%3E%3C/svg%3E");
    width: 24px;
    height: 24px;
    margin-bottom: 1px;
    display: flex;
    justify-content: center;
}

.card__vote-count {
    /* Число рейтинга */
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
}

.explorer-card__head-rate {
    /* Рейтинг в карточке */
    color: #3333ff;
}

.explorer-card__head-rate > svg {
    /* Иконка звезды */
    width: 1.5em !important;
    height: 1.5em !important;
    margin-right: 0.5em;
}

.explorer-card__head-rate > span {
    /* Число рейтинга */
    font-size: 1.5em;
    font-weight: 600;
}

.full-start__rate {
    /* Облик рейтинга в описании карточки */
  background: rgb(0 0 255 / 3%);
  -webkit-border-radius: 0.3em;
  -moz-border-radius: 0.3em;
  border-radius: 0.3em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: 1.45em;
  margin-right: 1em;
}

/* Общие стили для всех иконок рейтингов */
.full-start__rate > div:last-child,
.full-start__rate .source--name {
  font-size: 0; /* Скрываем текст */
  color: transparent;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

/* TMDB из официального лого */
.rate--tmdb .source--name {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 185.04 133.4'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:url(%23linear-gradient);%7D%3C/style%3E%3ClinearGradient id='linear-gradient' y1='66.7' x2='185.04' y2='66.7' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2390cea1'/%3E%3Cstop offset='0.56' stop-color='%233cbec9'/%3E%3Cstop offset='1' stop-color='%2300b3e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctitle%3EAsset 4%3C/title%3E%3Cg id='Layer_2' data-name='Layer 2'%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Cpath class='cls-1' d='M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h-.1A17.67,17.67,0,0,1,86.3,66.7h0A17.67,17.67,0,0,1,68.63,84.37h.1A17.67,17.67,0,0,1,51.06,66.7Zm82.67-31.33h32.9A17.67,17.67,0,0,0,184.3,17.7h0A17.67,17.67,0,0,0,166.63,0h-32.9A17.67,17.67,0,0,0,116.06,17.7h0A17.67,17.67,0,0,0,133.73,35.37Zm-113,98h63.9A17.67,17.67,0,0,0,102.3,115.7h0A17.67,17.67,0,0,0,84.63,98H20.73A17.67,17.67,0,0,0,3.06,115.7h0A17.67,17.67,0,0,0,20.73,133.37Zm83.92-49h6.25L125.5,49h-8.35l-8.9,23.2h-.1L99.4,49H90.5Zm32.45,0h7.8V49h-7.8Zm22.2,0h24.95V77.2H167.1V70h15.35V62.8H167.1V56.2h16.25V49h-24ZM10.1,35.4h7.8V6.9H28V0H0V6.9H10.1ZM39,35.4h7.8V20.1H61.9V35.4h7.8V0H61.9V13.2H46.75V0H39Zm41.25,0h25V28.2H88V21h15.35V13.8H88V7.2h16.25V0h-24Zm-79,49H9V57.25h.1l9,27.15H24l9.3-27.15h.1V84.4h7.8V49H29.45l-8.2,23.1h-.1L13,49H1.2Zm112.09,49H126a24.59,24.59,0,0,0,7.56-1.15,19.52,19.52,0,0,0,6.35-3.37,16.37,16.37,0,0,0,4.37-5.5A16.91,16.91,0,0,0,146,115.8a18.5,18.5,0,0,0-1.68-8.25,15.1,15.1,0,0,0-4.52-5.53A18.55,18.55,0,0,0,133.07,99,33.54,33.54,0,0,0,125,98H113.29Zm7.81-28.2h4.6a17.43,17.43,0,0,1,4.67.62,11.68,11.68,0,0,1,3.88,1.88,9,9,0,0,1,2.62,3.18,9.87,9.87,0,0,1,1,4.52,11.92,11.92,0,0,1-1,5.08,8.69,8.69,0,0,1-2.67,3.34,10.87,10.87,0,0,1-4,1.83,21.57,21.57,0,0,1-5,.55H121.1Zm36.14,28.2h14.5a23.11,23.11,0,0,0,4.73-.5,13.38,13.38,0,0,0,4.27-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68,9.16,9.16,0,0,0-.55-3.2,7.79,7.79,0,0,0-1.57-2.62,8.38,8.38,0,0,0-2.45-1.85,10,10,0,0,0-3.18-1v-.1a9.28,9.28,0,0,0,4.43-2.82,7.42,7.42,0,0,0,1.67-5,8.34,8.34,0,0,0-1.15-4.65,7.88,7.88,0,0,0-3-2.73,12.9,12.9,0,0,0-4.17-1.3,34.42,34.42,0,0,0-4.63-.32h-13.2Zm7.8-28.8h5.3a10.79,10.79,0,0,1,1.85.17,5.77,5.77,0,0,1,1.7.58,3.33,3.33,0,0,1,1.23,1.13,3.22,3.22,0,0,1,.47,1.82,3.63,3.63,0,0,1-.42,1.8,3.34,3.34,0,0,1-1.13,1.2,4.78,4.78,0,0,1-1.57.65,8.16,8.16,0,0,1-1.78.2H165Zm0,14.15h5.9a15.12,15.12,0,0,1,2.05.15,7.83,7.83,0,0,1,2,.55,4,4,0,0,1,1.58,1.17,3.13,3.13,0,0,1,.62,2,3.71,3.71,0,0,1-.47,1.95,4,4,0,0,1-1.23,1.3,4.78,4.78,0,0,1-1.67.7,8.91,8.91,0,0,1-1.83.2h-7Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* IMDb из официального лого */
.rate--imdb > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg fill='%23ffcc00' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
}

/* Кинопоиск из официального лого */
.rate--kp > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0_1_69' style='mask-type:alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='300' height='300'%3E%3Ccircle cx='150' cy='150' r='150' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_1_69)'%3E%3Ccircle cx='150' cy='150' r='150' fill='black'/%3E%3Cpath d='M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z' fill='url(%23paint0_radial_1_69)'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint0_radial_1_69' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(89.9999 45) rotate(45) scale(296.985)'%3E%3Cstop offset='0.5' stop-color='%23FF5500'/%3E%3Cstop offset='1' stop-color='%23BBFF00'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E");
}

/* =========== КНОПКИ И ФОКУС =========== */
.full-start__button {
  margin-right: 0.75em;
  font-size: 1.3em;
  background-color: rgb(0 0 255 / 24%);
  padding: 0.3em 1em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 2.8em;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

/* Стиль для состояния кнопок при фокусе focus */
.full-start__button.focus {
  background: linear-gradient(90deg, #5555ff, #3333ff);
  color: #fff;
}

/* =========== НАВИГАЦИЯ И МЕНЮ =========== */
.menu__item.focus, 
.menu__item.traverse, 
.menu__item.hover,
.menuitem.focus.red,
.menuitem.traverse.red,
.menu__item.hover.red,
.broadcast__scan > div,
.broadcast__device.focus,
.head__action.focus, 
.head__action.hover,
.settings-param.focus,
.simple-button.focus,
.selectbox-item.focus,
.full-person.focus {
    /* Общие стили для активных элементов */
    background: linear-gradient(90deg, #5555ff, #3333ff);
    color: #fff;
    border-radius: 1em;
}

.tag-count.focus {
    /* Особый стиль для тегов */
    background: linear-gradient(90deg, #5555ff, #3333ff);
    color: #000;
}

.settings-folder.focus {
    /* Папка в настройках */
    background: linear-gradient(90deg, #5555ff, #3333ff);
    border-radius: 1em;
}

.head__action {
    /* Радиус фокуса */
    border-radius: 20%;
}

/* =========== ИНДИКАТОРЫ И БЕЙДЖИ =========== */
.extensions__cub {
    /* Бейдж расширений */
    position: absolute;
    top: 1em;
    right: 1em;
    background-color: rgba(34, 229, 10, 0.32);
    border-radius: 0.3em;
    padding: 0.3em 0.4em;
    font-size: 0.78em;
}

.head__action.active::after {
    /* Индикатор активности */
    content: "";
    display: block;
    width: 0.5em;
    height: 0.5em;
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(90deg, #5555ff, #3333ff);
    border: 0.1em solid #fff;
    border-radius: 100%;
}

.explorer-card__head-age {
    /* Бейдж возраста */
    border: 1px solid #ffff77;
    border-radius: 0.2em;
    padding: 0.2em 0.3em;
    margin-top: 1.4em;
    font-size: 0.9em;
}

/* =========== ЛОАДЕРЫ =========== */
.activity__loader {
    /* Полноэкранный лоадер */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%233333ff' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='0.7s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
}

.modal-loading {
    /* Лоадер в модальном окне */
    height: 6em;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%233333ff' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='0.7s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
    background-size: contain;
}

/* =========== ПАНЕЛЬ НАСТРОЕК =========== */
.settings__content {
  position: fixed;
  top: 35;
  left: 100%;
  -webkit-transition: -webkit-transform 0.2s;
  transition: -webkit-transform 0.2s;
  -o-transition: -o-transform 0.2s;
  -moz-transition: transform 0.2s, -moz-transform 0.2s;
  transition: transform 0.2s;
  transition: transform 0.2s, -webkit-transform 0.2s, -moz-transform 0.2s, -o-transform 0.2s;
  background: #262829;
  width: 35%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -webkit-border-top-left-radius: 2em;
  -webkit-border-top-right-radius: 2em;
  -moz-box-orient: vertical;
  -moz-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  will-change: transform;
  /* Единственное добавление */
  max-height: 95vh;
  overflow-y: auto;
}

@media screen and (max-width: 767px) {
  .settings__content {
    width: 50%;
  }
}
@media screen and (max-width: 580px) {
  .settings__content {
    width: 70%;
  }
}
@media screen and (max-width: 480px) {
  .settings__content {
    width: 100%;
    left: 0;
    top: unset;
    bottom: 0;
    height: auto !important;
    -webkit-transition: none;
    -o-transition: none;
    -moz-transition: none;
    transition: none;
    -webkit-transform: translate3d(0, 100%, 0);
       -moz-transform: translate3d(0, 100%, 0);
            transform: translate3d(0, 100%, 0);
    -webkit-border-top-left-radius: 2em;
       -moz-border-radius-topleft: 2em;
            border-top-left-radius: 2em;
    -webkit-border-top-right-radius: 2em;
       -moz-border-radius-topright: 2em;
            border-top-right-radius: 2em;
    /* Единственное добавление для мобилок */
    max-height: 85vh;
  }
}

.head__action.open-settings {
  position: relative;
  display: inline-block;
}

.head__action.open-settings::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 40%, white 50%, transparent 60%);
  background-size: 400% 400%;
  animation: blink-effect 1s ease;
  pointer-events: none;
}

/* =========== ТОП-5 КАРТОЧКИ =========== */
.items-line--type-top .items-cards .card:nth-child(1)::before {
    /* Стиль для 1-го места */
    content: "1";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(2)::before {
    /* Стиль для 2-го места */
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(3)::before {
    /* Стиль для 3-го места */
    content: "3";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(4)::before {
    /* Стиль для 4-го места */
    content: "4";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(5)::before {
    /* Стиль для 5-го места */
    content: "5";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}
    /*Изменение расстояния 4 и 5 карточки */
.items-line--type-top .items-cards .card:nth-child(5) {
  margin-left: 3.7em;
}
.items-line--type-top .items-cards .card:nth-child(4) {
  margin-left: 3.7em;
}

.items-line__more.focus {
  background-color: #3333ff;
  color: #000;
}

/* =========== ПЕРСОНЫ =========== */
.full-person__photo {
    /* Аватар персоны */
    width: 7em;
    height: 7em;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 1em;
    background-size: cover;
    background-position: 50% 50%;
    display: flex;
    align-items: center;
}

.full-start__pg, .full-start__status {
    /* Статус просмотра */
    font-size: 1.2em;
    border: 1px solid #ffeb3b;
    border-radius: 0.2em;
    padding: 0.3em;
}

/* =========== ВЫБОР ЭЛЕМЕНТОВ =========== */
.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Индикатор выбора */
    content: "";
    display: block;
    width: 1.2em;
    height: 1.2em;
    border: 0.15em solid #ccc;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 1.4em;
    transform: translateY(-50%);
}

.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Анимация заполнения круга */
    border-color: #fff;
    border-top-color: transparent; /* Начинаем с прозрачной верхней границы */
    animation: circle-fill 3s ease-in-out forwards; /* Плавная анимация с фиксацией конечного состояния */
}

@keyframes circle-fill {
    /* 
     * Анимация имитирует "заполнение" круга по часовой стрелке 
     * с одновременным изменением цвета границ
     */
    0% {
        transform: translateY(-50%) rotate(0deg);
        border-color: #ccc; /* Начальный цвет - серый */
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
    }
    25% {
        border-right-color: #fff; /* Появление правой границы */
    }
    50% {
        border-bottom-color: #fff; /* Появление нижней границы */
    }
    75% {
        border-left-color: #fff; /* Появление левой границы */
    }
    100% {
        transform: translateY(-50%) rotate(360deg); /* Полный оборот */
        border-color: #fff; /* Все границы белые */
        border-top-color: #fff; /* Верхняя граница становится видимой в конце */
        box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.3); /* Дополнительный эффект свечения */
    }
}

/* Дополнительные состояния для лучшей визуализации */
.selectbox-item {
    position: relative;
    transition: all 0.3s ease;
}

.selectbox-item:hover {
    background-color: rgba(0, 0, 255, 0.1); /* Подсветка при наведении */
}

/* Не удалять, обводка рамки в модуле, действует как показатель какой цвет выбран */
            :root {
            --theme-accent-color: #3333ff;
            }
            .button--primary {
                background-color: var(--theme-base-color);
            }
            
            ${qualityColorsCSS}
        `,
        green: `
        
/* =========== КАРТОЧКИ КОНТЕНТА =========== */
.card.focus, .card.hover {
    /* Анимация увеличения при фокусе */
    z-index: 2;
    transform: scale(1.1);
    outline: none;
}

.card--tv .card__type {
    /* Бейдж типа контента (ТВ) */
    position: absolute;
    background: linear-gradient(90deg, #004400, #00aa00);
    color: #fff;
    z-index: 4;
}

/* =========== ЭФФЕКТЫ ВЫДЕЛЕНИЯ =========== */
.card.focus .card__view::before,
.card.hover .card__view::before {
    /* Элемент свечения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border-radius: 1.4em;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0 0 0 #55ff55;
    animation: glow-pulse 1s 0.4s infinite ease-in-out;
}
.full-episode.focus::after,
.extensions__item.focus::after,
.explorer-card__head-img.focus::after,
.torrent-item.focus::after {
    /* Общий стиль рамки выделения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid #00aa00;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
}

.card.focus .card__view::after, 
.card.hover .card__view::after {
    /* Элемент рамки */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid transparent;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
    clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    animation: 
        border-draw 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards,
        border-glow 0.5s 0.5s ease-out forwards;
}

@keyframes border-draw {
    0% {
        border-color: transparent;
        clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    }
    25% {
        border-top-color: #004400;
        clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0);
    }
    50% {
        border-right-color: #004400;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%);
    }
    75% {
        border-bottom-color: #004400;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
    }
    100% {
        border-color: #00aa00;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
}

@keyframes border-glow {
    0% {
        border-color: #00aa00;
    }
    100% {
        border-color: #00aa00;
    }
}

@keyframes glow-pulse {
    0%, 100% {
        opacity: 0.8;
        box-shadow: 0 0 16px #33ff33;
    }
    50% {
        opacity: 1;
        box-shadow: 0 0 16px #55ff55;
    }
}
/* Микрофон и клавиатура */
.search-source.active {
  opacity: 1;
  background-color: #00aa00;
  color: #fff;
}

.simple-keyboard .hg-button[data-skbtn="{MIC}"] {
  color: #00aa00;
}

/* =========== РЕЙТИНГИ И ГОЛОСОВАНИЕ =========== */
.card__vote {
    /* Контейнер рейтинга */
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 3px 3px;
    margin: 2px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #fff;
    align-items: center;
}

.card__vote::before {
    /* Иконка звезды */
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 -960 960 960'%3E%3Cpath fill='%2300aa00' d='M349.923-241.308 480-320.077l131.077 79.769-34.615-148.307 115.384-99.924L540.077-502 480-642.308 420.923-503l-151.769 13.461 115.384 99.693-34.615 148.538ZM283-150.076l52.615-223.539-173.923-150.847 229.231-18.846L480-754.693l90.077 211.385 228.231 18.846-173.923 150.847L677-150.076 480-268.923 283-150.076Zm197-281.616Z'/%3E%3C/svg%3E");
    width: 24px;
    height: 24px;
    margin-bottom: 1px;
    display: flex;
    justify-content: center;
}

.card__vote-count {
    /* Число рейтинга */
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
}

.explorer-card__head-rate {
    /* Рейтинг в карточке */
    color: #00aa00;
}

.explorer-card__head-rate > svg {
    /* Иконка звезды */
    width: 1.5em !important;
    height: 1.5em !important;
    margin-right: 0.5em;
}

.explorer-card__head-rate > span {
    /* Число рейтинга */
    font-size: 1.5em;
    font-weight: 600;
}

.full-start__rate {
    /* Облик рейтинга в описании карточки */
  background: rgb(50 205 50 / 3%);
  -webkit-border-radius: 0.3em;
  -moz-border-radius: 0.3em;
  border-radius: 0.3em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: 1.45em;
  margin-right: 1em;
}

/* Общие стили для всех иконок рейтингов */
.full-start__rate > div:last-child,
.full-start__rate .source--name {
  font-size: 0; /* Скрываем текст */
  color: transparent;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

/* TMDB из официального лого */
.rate--tmdb .source--name {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 185.04 133.4'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:url(%23linear-gradient);%7D%3C/style%3E%3ClinearGradient id='linear-gradient' y1='66.7' x2='185.04' y2='66.7' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2390cea1'/%3E%3Cstop offset='0.56' stop-color='%233cbec9'/%3E%3Cstop offset='1' stop-color='%2300b3e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctitle%3EAsset 4%3C/title%3E%3Cg id='Layer_2' data-name='Layer 2'%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Cpath class='cls-1' d='M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h-.1A17.67,17.67,0,0,1,86.3,66.7h0A17.67,17.67,0,0,1,68.63,84.37h.1A17.67,17.67,0,0,1,51.06,66.7Zm82.67-31.33h32.9A17.67,17.67,0,0,0,184.3,17.7h0A17.67,17.67,0,0,0,166.63,0h-32.9A17.67,17.67,0,0,0,116.06,17.7h0A17.67,17.67,0,0,0,133.73,35.37Zm-113,98h63.9A17.67,17.67,0,0,0,102.3,115.7h0A17.67,17.67,0,0,0,84.63,98H20.73A17.67,17.67,0,0,0,3.06,115.7h0A17.67,17.67,0,0,0,20.73,133.37Zm83.92-49h6.25L125.5,49h-8.35l-8.9,23.2h-.1L99.4,49H90.5Zm32.45,0h7.8V49h-7.8Zm22.2,0h24.95V77.2H167.1V70h15.35V62.8H167.1V56.2h16.25V49h-24ZM10.1,35.4h7.8V6.9H28V0H0V6.9H10.1ZM39,35.4h7.8V20.1H61.9V35.4h7.8V0H61.9V13.2H46.75V0H39Zm41.25,0h25V28.2H88V21h15.35V13.8H88V7.2h16.25V0h-24Zm-79,49H9V57.25h.1l9,27.15H24l9.3-27.15h.1V84.4h7.8V49H29.45l-8.2,23.1h-.1L13,49H1.2Zm112.09,49H126a24.59,24.59,0,0,0,7.56-1.15,19.52,19.52,0,0,0,6.35-3.37,16.37,16.37,0,0,0,4.37-5.5A16.91,16.91,0,0,0,146,115.8a18.5,18.5,0,0,0-1.68-8.25,15.1,15.1,0,0,0-4.52-5.53A18.55,18.55,0,0,0,133.07,99,33.54,33.54,0,0,0,125,98H113.29Zm7.81-28.2h4.6a17.43,17.43,0,0,1,4.67.62,11.68,11.68,0,0,1,3.88,1.88,9,9,0,0,1,2.62,3.18,9.87,9.87,0,0,1,1,4.52,11.92,11.92,0,0,1-1,5.08,8.69,8.69,0,0,1-2.67,3.34,10.87,10.87,0,0,1-4,1.83,21.57,21.57,0,0,1-5,.55H121.1Zm36.14,28.2h14.5a23.11,23.11,0,0,0,4.73-.5,13.38,13.38,0,0,0,4.27-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68,9.16,9.16,0,0,0-.55-3.2,7.79,7.79,0,0,0-1.57-2.62,8.38,8.38,0,0,0-2.45-1.85,10,10,0,0,0-3.18-1v-.1a9.28,9.28,0,0,0,4.43-2.82,7.42,7.42,0,0,0,1.67-5,8.34,8.34,0,0,0-1.15-4.65,7.88,7.88,0,0,0-3-2.73,12.9,12.9,0,0,0-4.17-1.3,34.42,34.42,0,0,0-4.63-.32h-13.2Zm7.8-28.8h5.3a10.79,10.79,0,0,1,1.85.17,5.77,5.77,0,0,1,1.7.58,3.33,3.33,0,0,1,1.23,1.13,3.22,3.22,0,0,1,.47,1.82,3.63,3.63,0,0,1-.42,1.8,3.34,3.34,0,0,1-1.13,1.2,4.78,4.78,0,0,1-1.57.65,8.16,8.16,0,0,1-1.78.2H165Zm0,14.15h5.9a15.12,15.12,0,0,1,2.05.15,7.83,7.83,0,0,1,2,.55,4,4,0,0,1,1.58,1.17,3.13,3.13,0,0,1,.62,2,3.71,3.71,0,0,1-.47,1.95,4,4,0,0,1-1.23,1.3,4.78,4.78,0,0,1-1.67.7,8.91,8.91,0,0,1-1.83.2h-7Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* IMDb из официального лого */
.rate--imdb > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg fill='%23ffcc00' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
}

/* Кинопоиск из официального лого */
.rate--kp > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0_1_69' style='mask-type:alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='300' height='300'%3E%3Ccircle cx='150' cy='150' r='150' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_1_69)'%3E%3Ccircle cx='150' cy='150' r='150' fill='black'/%3E%3Cpath d='M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z' fill='url(%23paint0_radial_1_69)'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint0_radial_1_69' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(89.9999 45) rotate(45) scale(296.985)'%3E%3Cstop offset='0.5' stop-color='%23FF5500'/%3E%3Cstop offset='1' stop-color='%23BBFF00'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E");
}

/* =========== КНОПКИ И ФОКУС =========== */
.full-start__button {
  margin-right: 0.75em;
  font-size: 1.3em;
  background-color: rgb(50 205 50 / 24%);
  padding: 0.3em 1em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 2.8em;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

/* Стиль для состояния кнопок при наведении focus */
.full-start__button.focus {
  background: linear-gradient(90deg, #004400, #00aa00);
  color: #fff;
}

/* =========== НАВИГАЦИЯ И МЕНЮ =========== */
.menu__item.focus, 
.menu__item.traverse, 
.menu__item.hover,
.menuitem.focus.red,
.menuitem.traverse.red,
.menu__item.hover.red,
.broadcast__scan > div,
.broadcast__device.focus,
.head__action.focus, 
.head__action.hover,
.settings-param.focus,
.simple-button.focus,
.selectbox-item.focus,
.full-person.focus {
    /* Общие стили для активных элементов */
    background: linear-gradient(90deg, #004400, #00aa00);
    color: #fff;
    border-radius: 1em;
}

.tag-count.focus {
    /* Особый стиль для тегов */
    background: linear-gradient(90deg, #004400, #00aa00);
    color: #000;
}

.settings-folder.focus {
    /* Папка в настройках */
    background: linear-gradient(90deg, #004400, #00aa00);
    border-radius: 1em;
}

.head__action {
    /* Радиус фокуса */
    border-radius: 20%;
}

/* =========== ИНДИКАТОРЫ И БЕЙДЖИ =========== */
.extensions__cub {
    /* Бейдж расширений */
    position: absolute;
    top: 1em;
    right: 1em;
    background-color: rgba(34, 229, 10, 0.32);
    border-radius: 0.3em;
    padding: 0.3em 0.4em;
    font-size: 0.78em;
}

.head__action.active::after {
    /* Индикатор активности */
    content: "";
    display: block;
    width: 0.5em;
    height: 0.5em;
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(90deg, #004400, #00aa00);
    border: 0.1em solid #fff;
    border-radius: 100%;
}

.explorer-card__head-age {
    /* Бейдж возраста */
    border: 1px solid #ffff77;
    border-radius: 0.2em;
    padding: 0.2em 0.3em;
    margin-top: 1.4em;
    font-size: 0.9em;
}

/* =========== ЛОАДЕРЫ =========== */
.activity__loader {
    /* Полноэкранный лоадер */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%2300aa00' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='1s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
}

.modal-loading {
    /* Лоадер в модальном окне */
    height: 6em;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%2300aa00' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='1s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
    background-size: contain;
}

/* =========== ПАНЕЛЬ НАСТРОЕК =========== */
.settings__content {
  position: fixed;
  top: 35;
  left: 100%;
  -webkit-transition: -webkit-transform 0.2s;
  transition: -webkit-transform 0.2s;
  -o-transition: -o-transform 0.2s;
  -moz-transition: transform 0.2s, -moz-transform 0.2s;
  transition: transform 0.2s;
  transition: transform 0.2s, -webkit-transform 0.2s, -moz-transform 0.2s, -o-transform 0.2s;
  background: #262829;
  color: #fff;
  width: 35%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -webkit-border-top-left-radius: 2em;
  -webkit-border-top-right-radius: 2em;
  -moz-box-orient: vertical;
  -moz-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  will-change: transform;
  /* Единственное добавление */
  max-height: 95vh;
  overflow-y: auto;
}

@media screen and (max-width: 767px) {
  .settings__content {
    width: 50%;
  }
}
@media screen and (max-width: 580px) {
  .settings__content {
    width: 70%;
  }
}
@media screen and (max-width: 480px) {
  .settings__content {
    width: 100%;
    left: 0;
    top: unset;
    bottom: 0;
    height: auto !important;
    -webkit-transition: none;
    -o-transition: none;
    -moz-transition: none;
    transition: none;
    -webkit-transform: translate3d(0, 100%, 0);
       -moz-transform: translate3d(0, 100%, 0);
            transform: translate3d(0, 100%, 0);
    -webkit-border-top-left-radius: 2em;
       -moz-border-radius-topleft: 2em;
            border-top-left-radius: 2em;
    -webkit-border-top-right-radius: 2em;
       -moz-border-radius-topright: 2em;
            border-top-right-radius: 2em;
    /* Единственное добавление для мобилок */
    max-height: 85vh;
  }
}

.head__action.open-settings {
  position: relative;
  display: inline-block;
}

.head__action.open-settings::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 40%, white 50%, transparent 60%);
  background-size: 400% 400%;
  animation: blink-effect 1s ease;
  pointer-events: none;
}

/* =========== ТОП-5 КАРТОЧКИ =========== */
.items-line--type-top .items-cards .card:nth-child(1)::before {
    /* Стиль для 1-го места */
    content: "1";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #00aa00;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(2)::before {
    /* Стиль для 2-го места */
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #00aa00;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(3)::before {
    /* Стиль для 3-го места */
    content: "3";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #00aa00;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(4)::before {
    /* Стиль для 4-го места */
    content: "4";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #00aa00;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(5)::before {
    /* Стиль для 5-го места */
    content: "5";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #00aa00;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}
    /*Изменение расстояния 4 и 5 карточки */
.items-line--type-top .items-cards .card:nth-child(5) {
  margin-left: 3.7em;
}
.items-line--type-top .items-cards .card:nth-child(4) {
  margin-left: 3.7em;
}

.items-line__more.focus {
  background-color: #00aa00;
  color: #000;
}

/* =========== ПЕРСОНЫ =========== */
.full-person__photo {
    /* Аватар персоны */
    width: 7em;
    height: 7em;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 1em;
    background-size: cover;
    background-position: 50% 50%;
    display: flex;
    align-items: center;
}

.full-start__pg, .full-start__status {
    /* Статус просмотра */
    font-size: 1.2em;
    border: 1px solid #ffeb3b;
    border-radius: 0.2em;
    padding: 0.3em;
}

/* =========== ВЫБОР ЭЛЕМЕНТОВ =========== */
.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Индикатор выбора */
    content: "";
    display: block;
    width: 1.2em;
    height: 1.2em;
    border: 0.15em solid #ccc;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 1.4em;
    transform: translateY(-50%);
}

.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Анимация заполнения круга */
    border-color: #fff;
    border-top-color: transparent; /* Начинаем с прозрачной верхней границы */
    animation: circle-fill 3s ease-in-out forwards; /* Плавная анимация с фиксацией конечного состояния */
}

@keyframes circle-fill {
    /* 
     * Анимация имитирует "заполнение" круга по часовой стрелке 
     * с одновременным изменением цвета границ
     */
    0% {
        transform: translateY(-50%) rotate(0deg);
        border-color: #ccc; /* Начальный цвет - серый */
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
    }
    25% {
        border-right-color: #fff; /* Появление правой границы */
    }
    50% {
        border-bottom-color: #fff; /* Появление нижней границы */
    }
    75% {
        border-left-color: #fff; /* Появление левой границы */
    }
    100% {
        transform: translateY(-50%) rotate(360deg); /* Полный оборот */
        border-color: #fff; /* Все границы белые */
        border-top-color: #fff; /* Верхняя граница становится видимой в конце */
        box-shadow: 0 0 0 3px rgba(50, 205, 50, 0.3); /* Дополнительный эффект свечения */
    }
}

/* Дополнительные состояния для лучшей визуализации */
.selectbox-item {
    position: relative;
    transition: all 0.3s ease;
}

.selectbox-item:hover {
    background-color: rgba(50, 205, 50, 0.1); /* Подсветка при наведении */
}

/* Не удалять, обводка рамки в модуле, действует как показатель какой цвет выбран */
            :root {
            --theme-accent-color: #00aa00;
            }
            .button--primary {
                background-color: var(--theme-base-color);
            }
            
            ${qualityColorsCSS}
        `,
        orange: `
/* =========== КАРТОЧКИ КОНТЕНТА =========== */
.card.focus, .card.hover {
    /* Анимация увеличения при фокусе */
    z-index: 2;
    transform: scale(1.1);
    outline: none;
}

.card--tv .card__type {
    /* Бейдж типа контента (ТВ) */
    position: absolute;
    background: linear-gradient(90deg, #ee7700, #cc6600);
    color: #fff;
    z-index: 4;
}

/* =========== ЭФФЕКТЫ ВЫДЕЛЕНИЯ =========== */
.card.focus .card__view::before,
.card.hover .card__view::before {
    /* Элемент свечения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border-radius: 1.4em;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0 0 0 #ffd600;
    animation: glow-pulse 1s 0.4s infinite ease-in-out;
}
.full-episode.focus::after,
.extensions__item.focus::after,
.explorer-card__head-img.focus::after,
.torrent-item.focus::after {
    /* Общий стиль рамки выделения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid #cc6600;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
}

.card.focus .card__view::after, 
.card.hover .card__view::after {
    /* Элемент рамки */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid transparent;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
    clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    animation: 
        border-draw 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards,
        border-glow 0.5s 0.5s ease-out forwards;
}

@keyframes border-draw {
    0% {
        border-color: transparent;
        clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    }
    25% {
        border-top-color: #ff8c00;
        clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0);
    }
    50% {
        border-right-color: #ff8c00;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%);
    }
    75% {
        border-bottom-color: #ff8c00;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
    }
    100% {
        border-color: #cc6600;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
}

@keyframes border-glow {
    0% {
        border-color: #cc6600;
    }
    100% {
        border-color: #cc6600;
    }
}

@keyframes glow-pulse {
    0%, 100% {
        opacity: 0.8;
        box-shadow: 0 0 16px #ff9933;
    }
    50% {
        opacity: 1;
        box-shadow: 0 0 16px #ffcc99;
    }
}

/* Микрофон и клавиатура */
.search-source.active {
  opacity: 1;
  background-color: #ec750f;
  color: #000;
}

.simple-keyboard .hg-button[data-skbtn="{MIC}"] {
  color: #f35b06;
}

/* =========== РЕЙТИНГИ И ГОЛОСОВАНИЕ =========== */
.card__vote {
    /* Контейнер рейтинга */
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 3px 3px;
    margin: 2px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #fff;
    align-items: center;
}

.card__vote::before {
    /* Иконка звезды */
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 -960 960 960'%3E%3Cpath fill='%23cc6600' d='M349.923-241.308 480-320.077l131.077 79.769-34.615-148.307 115.384-99.924L540.077-502 480-642.308 420.923-503l-151.769 13.461 115.384 99.693-34.615 148.538ZM283-150.076l52.615-223.539-173.923-150.847 229.231-18.846L480-754.693l90.077 211.385 228.231 18.846-173.923 150.847L677-150.076 480-268.923 283-150.076Zm197-281.616Z'/%3E%3C/svg%3E");
    width: 24px;
    height: 24px;
    margin-bottom: 1px;
    display: flex;
    justify-content: center;
}

.card__vote-count {
    /* Число рейтинга */
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
}

.explorer-card__head-rate {
    /* Рейтинг в карточке */
    color: #cc6600;
}

.explorer-card__head-rate > svg {
    /* Иконка звезды */
    width: 1.5em !important;
    height: 1.5em !important;
    margin-right: 0.5em;
}

.explorer-card__head-rate > span {
    /* Число рейтинга */
    font-size: 1.5em;
    font-weight: 600;
}

.full-start__rate {
    /* Облик рейтинга в описании карточки */
  background: rgb(243 104 4 / 5%);
  -webkit-border-radius: 0.3em;
  -moz-border-radius: 0.3em;
  border-radius: 0.3em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: 1.45em;
  margin-right: 1em;
}

/* Общие стили для всех иконок рейтингов */
.full-start__rate > div:last-child,
.full-start__rate .source--name {
  font-size: 0; /* Скрываем текст */
  color: transparent;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

/* TMDB из официального лого */
.rate--tmdb .source--name {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 185.04 133.4'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:url(%23linear-gradient);%7D%3C/style%3E%3ClinearGradient id='linear-gradient' y1='66.7' x2='185.04' y2='66.7' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2390cea1'/%3E%3Cstop offset='0.56' stop-color='%233cbec9'/%3E%3Cstop offset='1' stop-color='%2300b3e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctitle%3EAsset 4%3C/title%3E%3Cg id='Layer_2' data-name='Layer 2'%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Cpath class='cls-1' d='M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h-.1A17.67,17.67,0,0,1,86.3,66.7h0A17.67,17.67,0,0,1,68.63,84.37h.1A17.67,17.67,0,0,1,51.06,66.7Zm82.67-31.33h32.9A17.67,17.67,0,0,0,184.3,17.7h0A17.67,17.67,0,0,0,166.63,0h-32.9A17.67,17.67,0,0,0,116.06,17.7h0A17.67,17.67,0,0,0,133.73,35.37Zm-113,98h63.9A17.67,17.67,0,0,0,102.3,115.7h0A17.67,17.67,0,0,0,84.63,98H20.73A17.67,17.67,0,0,0,3.06,115.7h0A17.67,17.67,0,0,0,20.73,133.37Zm83.92-49h6.25L125.5,49h-8.35l-8.9,23.2h-.1L99.4,49H90.5Zm32.45,0h7.8V49h-7.8Zm22.2,0h24.95V77.2H167.1V70h15.35V62.8H167.1V56.2h16.25V49h-24ZM10.1,35.4h7.8V6.9H28V0H0V6.9H10.1ZM39,35.4h7.8V20.1H61.9V35.4h7.8V0H61.9V13.2H46.75V0H39Zm41.25,0h25V28.2H88V21h15.35V13.8H88V7.2h16.25V0h-24Zm-79,49H9V57.25h.1l9,27.15H24l9.3-27.15h.1V84.4h7.8V49H29.45l-8.2,23.1h-.1L13,49H1.2Zm112.09,49H126a24.59,24.59,0,0,0,7.56-1.15,19.52,19.52,0,0,0,6.35-3.37,16.37,16.37,0,0,0,4.37-5.5A16.91,16.91,0,0,0,146,115.8a18.5,18.5,0,0,0-1.68-8.25,15.1,15.1,0,0,0-4.52-5.53A18.55,18.55,0,0,0,133.07,99,33.54,33.54,0,0,0,125,98H113.29Zm7.81-28.2h4.6a17.43,17.43,0,0,1,4.67.62,11.68,11.68,0,0,1,3.88,1.88,9,9,0,0,1,2.62,3.18,9.87,9.87,0,0,1,1,4.52,11.92,11.92,0,0,1-1,5.08,8.69,8.69,0,0,1-2.67,3.34,10.87,10.87,0,0,1-4,1.83,21.57,21.57,0,0,1-5,.55H121.1Zm36.14,28.2h14.5a23.11,23.11,0,0,0,4.73-.5,13.38,13.38,0,0,0,4.27-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68,9.16,9.16,0,0,0-.55-3.2,7.79,7.79,0,0,0-1.57-2.62,8.38,8.38,0,0,0-2.45-1.85,10,10,0,0,0-3.18-1v-.1a9.28,9.28,0,0,0,4.43-2.82,7.42,7.42,0,0,0,1.67-5,8.34,8.34,0,0,0-1.15-4.65,7.88,7.88,0,0,0-3-2.73,12.9,12.9,0,0,0-4.17-1.3,34.42,34.42,0,0,0-4.63-.32h-13.2Zm7.8-28.8h5.3a10.79,10.79,0,0,1,1.85.17,5.77,5.77,0,0,1,1.7.58,3.33,3.33,0,0,1,1.23,1.13,3.22,3.22,0,0,1,.47,1.82,3.63,3.63,0,0,1-.42,1.8,3.34,3.34,0,0,1-1.13,1.2,4.78,4.78,0,0,1-1.57.65,8.16,8.16,0,0,1-1.78.2H165Zm0,14.15h5.9a15.12,15.12,0,0,1,2.05.15,7.83,7.83,0,0,1,2,.55,4,4,0,0,1,1.58,1.17,3.13,3.13,0,0,1,.62,2,3.71,3.71,0,0,1-.47,1.95,4,4,0,0,1-1.23,1.3,4.78,4.78,0,0,1-1.67.7,8.91,8.91,0,0,1-1.83.2h-7Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* IMDb из официального лого */
.rate--imdb > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg fill='%23ffcc00' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
}

/* Кинопоиск из официального лого */
.rate--kp > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0_1_69' style='mask-type:alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='300' height='300'%3E%3Ccircle cx='150' cy='150' r='150' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_1_69)'%3E%3Ccircle cx='150' cy='150' r='150' fill='black'/%3E%3Cpath d='M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z' fill='url(%23paint0_radial_1_69)'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint0_radial_1_69' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(89.9999 45) rotate(45) scale(296.985)'%3E%3Cstop offset='0.5' stop-color='%23FF5500'/%3E%3Cstop offset='1' stop-color='%23BBFF00'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E");
}

/* =========== КНОПКИ И ФОКУС =========== */
.full-start__button {
  margin-right: 0.75em;
  font-size: 1.3em;
  background-color: rgb(245 138 6 / 20%);
  padding: 0.3em 1em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 2.8em;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

/* Стиль для состояния focus */
.full-start__button.focus {
  background: linear-gradient(90deg, #ee7700, #cc6600);
  color: #fff;
}

/* =========== НАВИГАЦИЯ И МЕНЮ =========== */
.menu__item.focus, 
.menu__item.traverse, 
.menu__item.hover,
.menuitem.focus.red,
.menuitem.traverse.red,
.menu__item.hover.red,
.broadcast__scan > div,
.broadcast__device.focus,
.head__action.focus, 
.head__action.hover,
.settings-param.focus,
.simple-button.focus,
.selectbox-item.focus,
.full-person.focus {
    /* Общие стили для активных элементов */
    background: linear-gradient(90deg, #ee7700, #cc6600);
    color: #fff;
    border-radius: 1em;
}

.tag-count.focus {
    /* Особый стиль для тегов */
    background: linear-gradient(90deg, #ee7700, #cc6600);
    color: #000;
}

.settings-folder.focus {
    /* Папка в настройках */
    background: linear-gradient(90deg, #ee7700, #cc6600);
    border-radius: 1em;
}

.head__action {
    /* Радиус фокуса */
    border-radius: 20%;
}

/* =========== ИНДИКАТОРЫ И БЕЙДЖИ =========== */
.extensions__cub {
    /* Бейдж расширений */
    position: absolute;
    top: 1em;
    right: 1em;
    background-color: rgba(34, 229, 10, 0.32);
    border-radius: 0.3em;
    padding: 0.3em 0.4em;
    font-size: 0.78em;
}

.head__action.active::after {
    /* Индикатор активности */
    content: "";
    display: block;
    width: 0.5em;
    height: 0.5em;
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(90deg, #ee7700, #cc6600);
    border: 0.1em solid #ffe082;
    border-radius: 100%;
}

.explorer-card__head-age {
    /* Бейдж возраста */
    border: 1px solid #ffff77;
    border-radius: 0.2em;
    padding: 0.2em 0.3em;
    margin-top: 1.4em;
    font-size: 0.9em;
}

/* =========== ЛОАДЕРЫ =========== */
.activity__loader {
    /* Полноэкранный лоадер */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='orange' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='0.7s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
}

.modal-loading {
    /* Лоадер в модальном окне */
    height: 6em;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='orange' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='0.7s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
    background-size: contain;
}

/* =========== ПАНЕЛЬ НАСТРОЕК =========== */
.settings__content {
  position: fixed;
  top: 35;
  left: 100%;
  -webkit-transition: -webkit-transform 0.2s;
  transition: -webkit-transform 0.2s;
  -o-transition: -o-transform 0.2s;
  -moz-transition: transform 0.2s, -moz-transform 0.2s;
  transition: transform 0.2s;
  transition: transform 0.2s, -webkit-transform 0.2s, -moz-transform 0.2s, -o-transform 0.2s;
  background: #262829;
  width: 35%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -webkit-border-top-left-radius: 2em;
  -webkit-border-top-right-radius: 2em;
  -moz-box-orient: vertical;
  -moz-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  will-change: transform;
  /* Единственное добавление */
  max-height: 95vh;
  overflow-y: auto;
}

@media screen and (max-width: 767px) {
  .settings__content {
    width: 50%;
  }
}
@media screen and (max-width: 580px) {
  .settings__content {
    width: 70%;
  }
}
@media screen and (max-width: 480px) {
  .settings__content {
    width: 100%;
    left: 0;
    top: unset;
    bottom: 0;
    height: auto !important;
    -webkit-transition: none;
    -o-transition: none;
    -moz-transition: none;
    transition: none;
    -webkit-transform: translate3d(0, 100%, 0);
       -moz-transform: translate3d(0, 100%, 0);
            transform: translate3d(0, 100%, 0);
    -webkit-border-top-left-radius: 2em;
       -moz-border-radius-topleft: 2em;
            border-top-left-radius: 2em;
    -webkit-border-top-right-radius: 2em;
       -moz-border-radius-topright: 2em;
            border-top-right-radius: 2em;
    /* Единственное добавление для мобилок */
    max-height: 85vh;
  }
}

.head__action.open-settings {
  position: relative;
  display: inline-block;
}

.head__action.open-settings::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 40%, white 50%, transparent 60%);
  background-size: 400% 400%;
  animation: blink-effect 1s ease;
  pointer-events: none;
}

/* =========== ТОП-5 КАРТОЧКИ =========== */
.items-line--type-top .items-cards .card:nth-child(1)::before {
    /* Стиль для 1-го места */
    content: "1";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(2)::before {
    /* Стиль для 2-го места */
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(3)::before {
    /* Стиль для 3-го места */
    content: "3";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(4)::before {
    /* Стиль для 4-го места */
    content: "4";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(5)::before {
    /* Стиль для 5-го места */
    content: "5";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f55f06;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}
    /*Изменение расстояния 4 и 5 карточки */
.items-line--type-top .items-cards .card:nth-child(5) {
  margin-left: 3.7em;
}
.items-line--type-top .items-cards .card:nth-child(4) {
  margin-left: 3.7em;
}

.items-line__more.focus {
  background-color: #cc6600;
  color: #000;
}

/* =========== ПЕРСОНЫ =========== */
.full-person__photo {
    /* Аватар персоны */
    width: 7em;
    height: 7em;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 1em;
    background-size: cover;
    background-position: 50% 50%;
    display: flex;
    align-items: center;
}

.full-start__pg, .full-start__status {
    /* Статус просмотра */
    font-size: 1.2em;
    border: 1px solid #ffeb3b;
    border-radius: 0.2em;
    padding: 0.3em;
}

/* =========== ВЫБОР ЭЛЕМЕНТОВ =========== */
.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Индикатор выбора */
    content: "";
    display: block;
    width: 1.2em;
    height: 1.2em;
    border: 0.15em solid #ccc;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 1.4em;
    transform: translateY(-50%);
}

.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Анимация заполнения круга */
    border-color: #fff;
    border-top-color: transparent; /* Начинаем с прозрачной верхней границы */
    animation: circle-fill 3s ease-in-out forwards; /* Плавная анимация с фиксацией конечного состояния */
}

@keyframes circle-fill {
    /* 
     * Анимация имитирует "заполнение" круга по часовой стрелке 
     * с одновременным изменением цвета границ
     */
    0% {
        transform: translateY(-50%) rotate(0deg);
        border-color: #ccc; /* Начальный цвет - серый */
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
    }
    25% {
        border-right-color: #fff; /* Появление правой границы */
    }
    50% {
        border-bottom-color: #fff; /* Появление нижней границы */
    }
    75% {
        border-left-color: #fff; /* Появление левой границы */
    }
    100% {
        transform: translateY(-50%) rotate(360deg); /* Полный оборот */
        border-color: #fff; /* Все границы белые */
        border-top-color: #fff; /* Верхняя граница становится видимой в конце */
        box-shadow: 0 0 0 3px rgba(204, 102, 0, 0.3); /* Дополнительный эффект свечения */
    }
}

/* Дополнительные состояния для лучшей визуализации */
.selectbox-item {
    position: relative;
    transition: all 0.3s ease;
}

.selectbox-item:hover {
    background-color: rgba(238, 119, 0, 0.1); /* Подсветка при наведении */
}

/* Не удалять, обводка рамки в модуле, действует как показатель какой цвет выбран */
            :root {
            --theme-accent-color: #cc6600;
            }
            .button--primary {
                background-color: var(--theme-base-color);
            }

            ${qualityColorsCSS}
        `,
        purple: `

/* =========== КАРТОЧКИ КОНТЕНТА =========== */
.card.focus, .card.hover {
    /* Анимация увеличения при фокусе */
    z-index: 2;
    transform: scale(1.1);
    outline: none;
}

.card--tv .card__type {
    /* Бейдж типа контента (ТВ) */
    position: absolute;
    background: linear-gradient(90deg, #e8738f, #f81894);
    color: #fff;
    z-index: 4;
}

/* =========== ЭФФЕКТЫ ВЫДЕЛЕНИЯ =========== */
.card.focus .card__view::before,
.card.hover .card__view::before {
    /* Элемент свечения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border-radius: 1.4em;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0 0 0 #f8bac5;
    animation: glow-pulse 1s 0.4s infinite ease-in-out;
}
.full-episode.focus::after,
.extensions__item.focus::after,
.explorer-card__head-img.focus::after,
.torrent-item.focus::after {
    /* Общий стиль рамки выделения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid #e8738f;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
}

.card.focus .card__view::after, 
.card.hover .card__view::after {
    /* Элемент рамки */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid transparent;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
    clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    animation: 
        border-draw 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards,
        border-glow 0.5s 0.5s ease-out forwards;
}

@keyframes border-draw {
    0% {
        border-color: transparent;
        clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    }
    25% {
        border-top-color: #e8738f;
        clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0);
    }
    50% {
        border-right-color: #e8738f;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%);
    }
    75% {
        border-bottom-color: #e8738f;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
    }
    100% {
        border-color: #e8738f;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
}

@keyframes border-glow {
    0% {
        border-color: #e8738f;
    }
    100% {
        border-color: #e8738f;
    }
}

@keyframes glow-pulse {
    0%, 100% {
        opacity: 0.8;
        box-shadow: 0 0 16px #f19cbb;
    }
    50% {
        opacity: 1;
        box-shadow: 0 0 16px #f8bac5;
    }
}

/* Микрофон и клавиатура */
.search-source.active {
  opacity: 1;
  background-color: #f81894;
  color: #fff;
}

.simple-keyboard .hg-button[data-skbtn="{MIC}"] {
  color: #f81894;
}

/* =========== РЕЙТИНГИ И ГОЛОСОВАНИЕ =========== */
.card__vote {
    /* Контейнер рейтинга */
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 3px 3px;
    margin: 2px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #fff;
    align-items: center;
}

.card__vote::before {
    /* Иконка звезды */
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 -960 960 960'%3E%3Cpath fill='%23f81894' d='M349.923-241.308 480-320.077l131.077 79.769-34.615-148.307 115.384-99.924L540.077-502 480-642.308 420.923-503l-151.769 13.461 115.384 99.693-34.615 148.538ZM283-150.076l52.615-223.539-173.923-150.847 229.231-18.846L480-754.693l90.077 211.385 228.231 18.846-173.923 150.847L677-150.076 480-268.923 283-150.076Zm197-281.616Z'/%3E%3C/svg%3E");
    width: 24px;
    height: 24px;
    margin-bottom: 1px;
    display: flex;
    justify-content: center;
}

.card__vote-count {
    /* Число рейтинга */
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
}

.explorer-card__head-rate {
    /* Рейтинг в карточке */
    color: #f81894;
}

.explorer-card__head-rate > svg {
    /* Иконка звезды */
    width: 1.5em !important;
    height: 1.5em !important;
    margin-right: 0.5em;
}

.explorer-card__head-rate > span {
    /* Число рейтинга */
    font-size: 1.5em;
    font-weight: 600;
}

.full-start__rate {
    /* Облик рейтинга в описании карточки */
  background: rgb(248 24 148 / 3%);
  -webkit-border-radius: 0.3em;
  -moz-border-radius: 0.3em;
  border-radius: 0.3em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: 1.45em;
  margin-right: 1em;
}

/* Общие стили для всех иконок рейтингов */
.full-start__rate > div:last-child,
.full-start__rate .source--name {
  font-size: 0; /* Скрываем текст */
  color: transparent;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

/* TMDB из официального лого */
.rate--tmdb .source--name {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 185.04 133.4'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:url(%23linear-gradient);%7D%3C/style%3E%3ClinearGradient id='linear-gradient' y1='66.7' x2='185.04' y2='66.7' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2390cea1'/%3E%3Cstop offset='0.56' stop-color='%233cbec9'/%3E%3Cstop offset='1' stop-color='%2300b3e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctitle%3EAsset 4%3C/title%3E%3Cg id='Layer_2' data-name='Layer 2'%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Cpath class='cls-1' d='M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h-.1A17.67,17.67,0,0,1,86.3,66.7h0A17.67,17.67,0,0,1,68.63,84.37h.1A17.67,17.67,0,0,1,51.06,66.7Zm82.67-31.33h32.9A17.67,17.67,0,0,0,184.3,17.7h0A17.67,17.67,0,0,0,166.63,0h-32.9A17.67,17.67,0,0,0,116.06,17.7h0A17.67,17.67,0,0,0,133.73,35.37Zm-113,98h63.9A17.67,17.67,0,0,0,102.3,115.7h0A17.67,17.67,0,0,0,84.63,98H20.73A17.67,17.67,0,0,0,3.06,115.7h0A17.67,17.67,0,0,0,20.73,133.37Zm83.92-49h6.25L125.5,49h-8.35l-8.9,23.2h-.1L99.4,49H90.5Zm32.45,0h7.8V49h-7.8Zm22.2,0h24.95V77.2H167.1V70h15.35V62.8H167.1V56.2h16.25V49h-24ZM10.1,35.4h7.8V6.9H28V0H0V6.9H10.1ZM39,35.4h7.8V20.1H61.9V35.4h7.8V0H61.9V13.2H46.75V0H39Zm41.25,0h25V28.2H88V21h15.35V13.8H88V7.2h16.25V0h-24Zm-79,49H9V57.25h.1l9,27.15H24l9.3-27.15h.1V84.4h7.8V49H29.45l-8.2,23.1h-.1L13,49H1.2Zm112.09,49H126a24.59,24.59,0,0,0,7.56-1.15,19.52,19.52,0,0,0,6.35-3.37,16.37,16.37,0,0,0,4.37-5.5A16.91,16.91,0,0,0,146,115.8a18.5,18.5,0,0,0-1.68-8.25,15.1,15.1,0,0,0-4.52-5.53A18.55,18.55,0,0,0,133.07,99,33.54,33.54,0,0,0,125,98H113.29Zm7.81-28.2h4.6a17.43,17.43,0,0,1,4.67.62,11.68,11.68,0,0,1,3.88,1.88,9,9,0,0,1,2.62,3.18,9.87,9.87,0,0,1,1,4.52,11.92,11.92,0,0,1-1,5.08,8.69,8.69,0,0,1-2.67,3.34,10.87,10.87,0,0,1-4,1.83,21.57,21.57,0,0,1-5,.55H121.1Zm36.14,28.2h14.5a23.11,23.11,0,0,0,4.73-.5,13.38,13.38,0,0,0,4.27-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68,9.16,9.16,0,0,0-.55-3.2,7.79,7.79,0,0,0-1.57-2.62,8.38,8.38,0,0,0-2.45-1.85,10,10,0,0,0-3.18-1v-.1a9.28,9.28,0,0,0,4.43-2.82,7.42,7.42,0,0,0,1.67-5,8.34,8.34,0,0,0-1.15-4.65,7.88,7.88,0,0,0-3-2.73,12.9,12.9,0,0,0-4.17-1.3,34.42,34.42,0,0,0-4.63-.32h-13.2Zm7.8-28.8h5.3a10.79,10.79,0,0,1,1.85.17,5.77,5.77,0,0,1,1.7.58,3.33,3.33,0,0,1,1.23,1.13,3.22,3.22,0,0,1,.47,1.82,3.63,3.63,0,0,1-.42,1.8,3.34,3.34,0,0,1-1.13,1.2,4.78,4.78,0,0,1-1.57.65,8.16,8.16,0,0,1-1.78.2H165Zm0,14.15h5.9a15.12,15.12,0,0,1,2.05.15,7.83,7.83,0,0,1,2,.55,4,4,0,0,1,1.58,1.17,3.13,3.13,0,0,1,.62,2,3.71,3.71,0,0,1-.47,1.95,4,4,0,0,1-1.23,1.3,4.78,4.78,0,0,1-1.67.7,8.91,8.91,0,0,1-1.83.2h-7Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* IMDb из официального лого */
.rate--imdb > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg fill='%23ffcc00' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
}

/* Кинопоиск из официального лого */
.rate--kp > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0_1_69' style='mask-type:alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='300' height='300'%3E%3Ccircle cx='150' cy='150' r='150' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_1_69)'%3E%3Ccircle cx='150' cy='150' r='150' fill='black'/%3E%3Cpath d='M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z' fill='url(%23paint0_radial_1_69)'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint0_radial_1_69' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(89.9999 45) rotate(45) scale(296.985)'%3E%3Cstop offset='0.5' stop-color='%23FF5500'/%3E%3Cstop offset='1' stop-color='%23BBFF00'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E");
}

/* =========== КНОПКИ И ФОКУС =========== */
.full-start__button {
  margin-right: 0.75em;
  font-size: 1.3em;
  background-color: rgb(248 24 148 / 20%);
  padding: 0.3em 1em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 2.8em;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

/* Стиль для состояния кнопок при фокусе focus */
.full-start__button.focus {
  background: linear-gradient(90deg, #e8738f, #f81894);
  color: #fff;
}

/* =========== НАВИГАЦИЯ И МЕНЮ =========== */
.menu__item.focus, 
.menu__item.traverse, 
.menu__item.hover,
.menuitem.focus.red,
.menuitem.traverse.red,
.menu__item.hover.red,
.broadcast__scan > div,
.broadcast__device.focus,
.head__action.focus, 
.head__action.hover,
.settings-param.focus,
.simple-button.focus,
.selectbox-item.focus,
.full-person.focus {
    /* Общие стили для активных элементов */
    background: linear-gradient(90deg, #e8738f, #f81894);
    color: #fff;
    border-radius: 1em;
}

.tag-count.focus {
    /* Особый стиль для тегов */
    background: linear-gradient(90deg, #e8738f, #f81894);
    color: #fff;
}

.settings-folder.focus {
    /* Папка в настройках */
    background: linear-gradient(90deg, #e8738f, #f81894);
    border-radius: 1em;
    color: #fff;
}

.head__action {
    /* Радиус фокуса */
    border-radius: 20%;
}

/* =========== ИНДИКАТОРЫ И БЕЙДЖИ =========== */
.extensions__cub {
    /* Бейдж расширений */
    position: absolute;
    top: 1em;
    right: 1em;
    background-color: rgba(34, 229, 10, 0.32);
    border-radius: 0.3em;
    padding: 0.3em 0.4em;
    font-size: 0.78em;
}

.head__action.active::after {
    /* Индикатор активности */
    content: "";
    display: block;
    width: 0.5em;
    height: 0.5em;
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(90deg, #e8738f, #f81894);
    border: 0.1em solid #fff;
    border-radius: 100%;
}

.explorer-card__head-age {
    /* Бейдж возраста */
    border: 1px solid #ffff77;
    border-radius: 0.2em;
    padding: 0.2em 0.3em;
    margin-top: 1.4em;
    font-size: 0.9em;
}

/* =========== ЛОАДЕРЫ =========== */
.activity__loader {
    /* Полноэкранный лоадер */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%23f81894' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='0.7s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
}

.modal-loading {
    /* Лоадер в модальном окне */
    height: 6em;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%23f81894' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='0.7s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
    background-size: contain;
}

/* =========== ПАНЕЛЬ НАСТРОЕК =========== */
.settings__content {
  position: fixed;
  top: 35;
  left: 100%;
  -webkit-transition: -webkit-transform 0.2s;
  transition: -webkit-transform 0.2s;
  -o-transition: -o-transform 0.2s;
  -moz-transition: transform 0.2s, -moz-transform 0.2s;
  transition: transform 0.2s;
  transition: transform 0.2s, -webkit-transform 0.2s, -moz-transform 0.2s, -o-transform 0.2s;
  background: #262829;
  width: 35%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -webkit-border-top-left-radius: 2em;
  -webkit-border-top-right-radius: 2em;
  -moz-box-orient: vertical;
  -moz-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  will-change: transform;
  /* Единственное добавление */
  max-height: 95vh;
  overflow-y: auto;
}

@media screen and (max-width: 767px) {
  .settings__content {
    width: 50%;
  }
}
@media screen and (max-width: 580px) {
  .settings__content {
    width: 70%;
  }
}
@media screen and (max-width: 480px) {
  .settings__content {
    width: 100%;
    left: 0;
    top: unset;
    bottom: 0;
    height: auto !important;
    -webkit-transition: none;
    -o-transition: none;
    -moz-transition: none;
    transition: none;
    -webkit-transform: translate3d(0, 100%, 0);
       -moz-transform: translate3d(0, 100%, 0);
            transform: translate3d(0, 100%, 0);
    -webkit-border-top-left-radius: 2em;
       -moz-border-radius-topleft: 2em;
            border-top-left-radius: 2em;
    -webkit-border-top-right-radius: 2em;
       -moz-border-radius-topright: 2em;
            border-top-right-radius: 2em;
    /* Единственное добавление для мобилок */
    max-height: 85vh;
  }
}

.head__action.open-settings {
  position: relative;
  display: inline-block;
}

.head__action.open-settings::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 40%, white 50%, transparent 60%);
  background-size: 400% 400%;
  animation: blink-effect 1s ease;
  pointer-events: none;
}

/* =========== ТОП-5 КАРТОЧКИ =========== */
.items-line--type-top .items-cards .card:nth-child(1)::before {
    /* Стиль для 1-го места */
    content: "1";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f81894;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(2)::before {
    /* Стиль для 2-го места */
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f81894;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(3)::before {
    /* Стиль для 3-го места */
    content: "3";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f81894;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(4)::before {
    /* Стиль для 4-го места */
    content: "4";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f81894;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(5)::before {
    /* Стиль для 5-го места */
    content: "5";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #f81894;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}
    /*Изменение расстояния 4 и 5 карточки */
.items-line--type-top .items-cards .card:nth-child(5) {
  margin-left: 3.7em;
}
.items-line--type-top .items-cards .card:nth-child(4) {
  margin-left: 3.7em;
}

.items-line__more.focus {
  background-color: #f81894;
  color: #000;
}

/* =========== ПЕРСОНЫ =========== */
.full-person__photo {
    /* Аватар персоны */
    width: 7em;
    height: 7em;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 1em;
    background-size: cover;
    background-position: 50% 50%;
    display: flex;
    align-items: center;
}

.full-start__pg, .full-start__status {
    /* Статус просмотра */
    font-size: 1.2em;
    border: 1px solid #ffeb3b;
    border-radius: 0.2em;
    padding: 0.3em;
}

/* =========== ВЫБОР ЭЛЕМЕНТОВ =========== */
.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Индикатор выбора */
    content: "";
    display: block;
    width: 1.2em;
    height: 1.2em;
    border: 0.15em solid #ccc;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 1.4em;
    transform: translateY(-50%);
}

.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Анимация заполнения круга */
    border-color: #fff;
    border-top-color: transparent; /* Начинаем с прозрачной верхней границы */
    animation: circle-fill 3s ease-in-out forwards; /* Плавная анимация с фиксацией конечного состояния */
}

@keyframes circle-fill {
    /* 
     * Анимация имитирует "заполнение" круга по часовой стрелке 
     * с одновременным изменением цвета границ
     */
    0% {
        transform: translateY(-50%) rotate(0deg);
        border-color: #ccc; /* Начальный цвет - серый */
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
    }
    25% {
        border-right-color: #fff; /* Появление правой границы */
    }
    50% {
        border-bottom-color: #fff; /* Появление нижней границы */
    }
    75% {
        border-left-color: #fff; /* Появление левой границы */
    }
    100% {
        transform: translateY(-50%) rotate(360deg); /* Полный оборот */
        border-color: #fff; /* Все границы белые */
        border-top-color: #fff; /* Верхняя граница становится видимой в конце */
        box-shadow: 0 0 0 3px rgba(248, 24, 148, 0.3); /* Дополнительный эффект свечения */
    }
}

/* Дополнительные состояния для лучшей визуализации */
.selectbox-item {
    position: relative;
    transition: all 0.3s ease;
}

.selectbox-item:hover {
    background-color: rgba(248, 24, 148, 0.1); /* Подсветка при наведении */
}

/* Не удалять, обводка рамки в модуле, действует как показатель какой цвет выбран */
            :root {
            --theme-accent-color: #f8bac5;
            }
            .button--primary {
                background-color: var(--theme-base-color);
            }
            
            ${qualityColorsCSS}
        `,
        red: `

/* =========== КАРТОЧКИ КОНТЕНТА =========== */
.card--tv .card__type {
    /* Бейдж типа контента (ТВ) */
    position: absolute;
    background: linear-gradient(90deg, #ff3333, #ff3333);
    color: #fff;
    z-index: 4;
}

/* =========== ЭФФЕКТЫ ВЫДЕЛЕНИЯ =========== */
.card.focus .card__view::before,
.card.hover .card__view::before {
    /* Элемент свечения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border-radius: 1.4em;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0 0 0 #ff9999;
    animation: glow-pulse 1s 0.4s infinite ease-in-out;
}
.full-episode.focus::after,
.extensions__item.focus::after,
.explorer-card__head-img.focus::after,
.torrent-item.focus::after {
    /* Общий стиль рамки выделения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid #ff3333;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
}

.card.focus .card__view::after, 
.card.hover .card__view::after {
    /* Элемент рамки */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid transparent;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
    clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    animation: 
        border-draw 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards,
        border-glow 0.5s 0.5s ease-out forwards;
}

@keyframes border-draw {
    0% {
        border-color: transparent;
        clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    }
    25% {
        border-top-color: #ff3333;
        clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0);
    }
    50% {
        border-right-color: #ff3333;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%);
    }
    75% {
        border-bottom-color: #ff3333;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
    }
    100% {
        border-color: #ff3333;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
}

@keyframes border-glow {
    0% {
        border-color: #ff3333;
    }
    100% {
        border-color: #ff3333;
    }
}

@keyframes glow-pulse {
    0%, 100% {
        opacity: 0.8;
        box-shadow: 0 0 16px #ff4444;
    }
    50% {
        opacity: 1;
        box-shadow: 0 0 16px #ff9999;
    }
}

/* Микрофон и клавиатура */
.search-source.active {
  opacity: 1;
  background-color: #ff3333;
  color: #fff;
}

.simple-keyboard .hg-button[data-skbtn="{MIC}"] {
  color: #ff3333;
}

/* =========== РЕЙТИНГИ И ГОЛОСОВАНИЕ =========== */
.card__vote {
    /* Контейнер рейтинга */
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 3px 3px;
    margin: 2px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #fff;
    align-items: center;
}

.card__vote::before {
    /* Иконка звезды */
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 -960 960 960'%3E%3Cpath fill='%23ff3333' d='M349.923-241.308 480-320.077l131.077 79.769-34.615-148.307 115.384-99.924L540.077-502 480-642.308 420.923-503l-151.769 13.461 115.384 99.693-34.615 148.538ZM283-150.076l52.615-223.539-173.923-150.847 229.231-18.846L480-754.693l90.077 211.385 228.231 18.846-173.923 150.847L677-150.076 480-268.923 283-150.076Zm197-281.616Z'/%3E%3C/svg%3E");
    width: 24px;
    height: 24px;
    margin-bottom: 1px;
    display: flex;
    justify-content: center;
}

.card__vote-count {
    /* Число рейтинга */
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
}

.explorer-card__head-rate {
    /* Рейтинг в карточке */
    color: #ff3333;
}

.explorer-card__head-rate > svg {
    /* Иконка звезды */
    width: 1.5em !important;
    height: 1.5em !important;
    margin-right: 0.5em;
}

.explorer-card__head-rate > span {
    /* Число рейтинга */
    font-size: 1.5em;
    font-weight: 600;
}

.full-start__rate {
    /* Облик рейтинга в описании карточки */
  background: rgb(255 0 0 / 3%);
  -webkit-border-radius: 0.3em;
  -moz-border-radius: 0.3em;
  border-radius: 0.3em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: 1.45em;
  margin-right: 1em;
}

/* Общие стили для всех иконок рейтингов */
.full-start__rate > div:last-child,
.full-start__rate .source--name {
  font-size: 0; /* Скрываем текст */
  color: transparent;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

/* TMDB из официального лого */
.rate--tmdb .source--name {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 185.04 133.4'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:url(%23linear-gradient);%7D%3C/style%3E%3ClinearGradient id='linear-gradient' y1='66.7' x2='185.04' y2='66.7' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2390cea1'/%3E%3Cstop offset='0.56' stop-color='%233cbec9'/%3E%3Cstop offset='1' stop-color='%2300b3e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctitle%3EAsset 4%3C/title%3E%3Cg id='Layer_2' data-name='Layer 2'%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Cpath class='cls-1' d='M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h-.1A17.67,17.67,0,0,1,86.3,66.7h0A17.67,17.67,0,0,1,68.63,84.37h.1A17.67,17.67,0,0,1,51.06,66.7Zm82.67-31.33h32.9A17.67,17.67,0,0,0,184.3,17.7h0A17.67,17.67,0,0,0,166.63,0h-32.9A17.67,17.67,0,0,0,116.06,17.7h0A17.67,17.67,0,0,0,133.73,35.37Zm-113,98h63.9A17.67,17.67,0,0,0,102.3,115.7h0A17.67,17.67,0,0,0,84.63,98H20.73A17.67,17.67,0,0,0,3.06,115.7h0A17.67,17.67,0,0,0,20.73,133.37Zm83.92-49h6.25L125.5,49h-8.35l-8.9,23.2h-.1L99.4,49H90.5Zm32.45,0h7.8V49h-7.8Zm22.2,0h24.95V77.2H167.1V70h15.35V62.8H167.1V56.2h16.25V49h-24ZM10.1,35.4h7.8V6.9H28V0H0V6.9H10.1ZM39,35.4h7.8V20.1H61.9V35.4h7.8V0H61.9V13.2H46.75V0H39Zm41.25,0h25V28.2H88V21h15.35V13.8H88V7.2h16.25V0h-24Zm-79,49H9V57.25h.1l9,27.15H24l9.3-27.15h.1V84.4h7.8V49H29.45l-8.2,23.1h-.1L13,49H1.2Zm112.09,49H126a24.59,24.59,0,0,0,7.56-1.15,19.52,19.52,0,0,0,6.35-3.37,16.37,16.37,0,0,0,4.37-5.5A16.91,16.91,0,0,0,146,115.8a18.5,18.5,0,0,0-1.68-8.25,15.1,15.1,0,0,0-4.52-5.53A18.55,18.55,0,0,0,133.07,99,33.54,33.54,0,0,0,125,98H113.29Zm7.81-28.2h4.6a17.43,17.43,0,0,1,4.67.62,11.68,11.68,0,0,1,3.88,1.88,9,9,0,0,1,2.62,3.18,9.87,9.87,0,0,1,1,4.52,11.92,11.92,0,0,1-1,5.08,8.69,8.69,0,0,1-2.67,3.34,10.87,10.87,0,0,1-4,1.83,21.57,21.57,0,0,1-5,.55H121.1Zm36.14,28.2h14.5a23.11,23.11,0,0,0,4.73-.5,13.38,13.38,0,0,0,4.27-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68,9.16,9.16,0,0,0-.55-3.2,7.79,7.79,0,0,0-1.57-2.62,8.38,8.38,0,0,0-2.45-1.85,10,10,0,0,0-3.18-1v-.1a9.28,9.28,0,0,0,4.43-2.82,7.42,7.42,0,0,0,1.67-5,8.34,8.34,0,0,0-1.15-4.65,7.88,7.88,0,0,0-3-2.73,12.9,12.9,0,0,0-4.17-1.3,34.42,34.42,0,0,0-4.63-.32h-13.2Zm7.8-28.8h5.3a10.79,10.79,0,0,1,1.85.17,5.77,5.77,0,0,1,1.7.58,3.33,3.33,0,0,1,1.23,1.13,3.22,3.22,0,0,1,.47,1.82,3.63,3.63,0,0,1-.42,1.8,3.34,3.34,0,0,1-1.13,1.2,4.78,4.78,0,0,1-1.57.65,8.16,8.16,0,0,1-1.78.2H165Zm0,14.15h5.9a15.12,15.12,0,0,1,2.05.15,7.83,7.83,0,0,1,2,.55,4,4,0,0,1,1.58,1.17,3.13,3.13,0,0,1,.62,2,3.71,3.71,0,0,1-.47,1.95,4,4,0,0,1-1.23,1.3,4.78,4.78,0,0,1-1.67.7,8.91,8.91,0,0,1-1.83.2h-7Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* IMDb из официального лого */
.rate--imdb > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg fill='%23ffcc00' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
}

/* Кинопоиск из официального лого */
.rate--kp > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0_1_69' style='mask-type:alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='300' height='300'%3E%3Ccircle cx='150' cy='150' r='150' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_1_69)'%3E%3Ccircle cx='150' cy='150' r='150' fill='black'/%3E%3Cpath d='M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z' fill='url(%23paint0_radial_1_69)'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint0_radial_1_69' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(89.9999 45) rotate(45) scale(296.985)'%3E%3Cstop offset='0.5' stop-color='%23FF5500'/%3E%3Cstop offset='1' stop-color='%23BBFF00'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E");
}

/* =========== КНОПКИ И ФОКУС =========== */
.full-start__button {
  margin-right: 0.75em;
  font-size: 1.3em;
  background-color: rgb(255 0 0 / 20%);
  padding: 0.3em 1em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 2.8em;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

/* Стиль для состояния кнопок при фокусе focus */
.full-start__button.focus {
  background: linear-gradient(90deg, #ff3333, #ff3333);
  color: #fff;
}

/* =========== НАВИГАЦИЯ И МЕНЮ =========== */
.menu__item.focus, 
.menu__item.traverse, 
.menu__item.hover,
.menuitem.focus.red,
.menuitem.traverse.red,
.menu__item.hover.red,
.broadcast__scan > div,
.broadcast__device.focus,
.head__action.focus, 
.head__action.hover,
.settings-param.focus,
.simple-button.focus,
.selectbox-item.focus,
.full-person.focus {
    /* Общие стили для активных элементов */
    background: linear-gradient(90deg, #ff3333, #ff3333);
    color: #fff;
    border-radius: 1em;
}

.tag-count.focus {
    /* Особый стиль для тегов */
    background: linear-gradient(90deg, #ff3333, #ff3333);
    color: #000;
}

.settings-folder.focus {
    /* Папка в настройках */
    background: linear-gradient(90deg, #ff3333, #ff3333);
    border-radius: 1em;
}

.head__action {
    /* Радиус фокуса */
    border-radius: 20%;
}

/* =========== ИНДИКАТОРЫ И БЕЙДЖИ =========== */
.extensions__cub {
    /* Бейдж расширений */
    position: absolute;
    top: 1em;
    right: 1em;
    background-color: rgba(34, 229, 10, 0.32);
    border-radius: 0.3em;
    padding: 0.3em 0.4em;
    font-size: 0.78em;
}

.head__action.active::after {
    /* Индикатор активности */
    content: "";
    display: block;
    width: 0.5em;
    height: 0.5em;
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(90deg, #ff3333, #ff3333);
    border: 0.1em solid #fff;
    border-radius: 100%;
}

.explorer-card__head-age {
    /* Бейдж возраста */
    border: 1px solid #ffff77;
    border-radius: 0.2em;
    padding: 0.2em 0.3em;
    margin-top: 1.4em;
    font-size: 0.9em;
}

/* =========== ЛОАДЕРЫ =========== */
.activity__loader {
    /* Полноэкранный лоадер */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%23ff3333' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='0.7s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
}

.modal-loading {
    /* Лоадер в модальном окне */
    height: 6em;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%23ff3333' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='0.7s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
    background-size: contain;
}

/* =========== ПАНЕЛЬ НАСТРОЕК =========== */
.settings__content {
  position: fixed;
  top: 35;
  left: 100%;
  -webkit-transition: -webkit-transform 0.2s;
  transition: -webkit-transform 0.2s;
  -o-transition: -o-transform 0.2s;
  -moz-transition: transform 0.2s, -moz-transform 0.2s;
  transition: transform 0.2s;
  transition: transform 0.2s, -webkit-transform 0.2s, -moz-transform 0.2s, -o-transform 0.2s;
  background: #262829;
  width: 35%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -webkit-border-top-left-radius: 2em;
  -webkit-border-top-right-radius: 2em;
  -moz-box-orient: vertical;
  -moz-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  will-change: transform;
  /* Единственное добавление */
  max-height: 95vh;
  overflow-y: auto;
}

@media screen and (max-width: 767px) {
  .settings__content {
    width: 50%;
  }
}
@media screen and (max-width: 580px) {
  .settings__content {
    width: 70%;
  }
}
@media screen and (max-width: 480px) {
  .settings__content {
    width: 100%;
    left: 0;
    top: unset;
    bottom: 0;
    height: auto !important;
    -webkit-transition: none;
    -o-transition: none;
    -moz-transition: none;
    transition: none;
    -webkit-transform: translate3d(0, 100%, 0);
       -moz-transform: translate3d(0, 100%, 0);
            transform: translate3d(0, 100%, 0);
    -webkit-border-top-left-radius: 2em;
       -moz-border-radius-topleft: 2em;
            border-top-left-radius: 2em;
    -webkit-border-top-right-radius: 2em;
       -moz-border-radius-topright: 2em;
            border-top-right-radius: 2em;
    /* Единственное добавление для мобилок */
    max-height: 85vh;
  }
}

.head__action.open-settings {
  position: relative;
  display: inline-block;
}

.head__action.open-settings::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 40%, white 50%, transparent 60%);
  background-size: 400% 400%;
  animation: blink-effect 1s ease;
  pointer-events: none;
}

/* =========== ТОП-5 КАРТОЧКИ =========== */
.items-line--type-top .items-cards .card:nth-child(1)::before {
    /* Стиль для 1-го места */
    content: "1";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #ff3333;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(2)::before {
    /* Стиль для 2-го места */
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #ff3333;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(3)::before {
    /* Стиль для 3-го места */
    content: "3";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #ff3333;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(4)::before {
    /* Стиль для 4-го места */
    content: "4";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #ff3333;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(5)::before {
    /* Стиль для 5-го места */
    content: "5";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #ff3333;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}
    /*Изменение расстояния 4 и 5 карточки */
.items-line--type-top .items-cards .card:nth-child(5) {
  margin-left: 3.7em;
}
.items-line--type-top .items-cards .card:nth-child(4) {
  margin-left: 3.7em;
}

.items-line__more.focus {
  background-color: #ff3333;
  color: #000;
}

/* =========== ПЕРСОНЫ =========== */
.full-person__photo {
    /* Аватар персоны */
    width: 7em;
    height: 7em;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 1em;
    background-size: cover;
    background-position: 50% 50%;
    display: flex;
    align-items: center;
}

.full-start__pg, .full-start__status {
    /* Статус просмотра */
    font-size: 1.2em;
    border: 1px solid #ffeb3b;
    border-radius: 0.2em;
    padding: 0.3em;
}

/* =========== ВЫБОР ЭЛЕМЕНТОВ =========== */
.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Индикатор выбора */
    content: "";
    display: block;
    width: 1.2em;
    height: 1.2em;
    border: 0.15em solid #ccc;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 1.4em;
    transform: translateY(-50%);
}

.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Анимация заполнения круга */
    border-color: #fff;
    border-top-color: transparent; /* Начинаем с прозрачной верхней границы */
    animation: circle-fill 3s ease-in-out forwards; /* Плавная анимация с фиксацией конечного состояния */
}

@keyframes circle-fill {
    /* 
     * Анимация имитирует "заполнение" круга по часовой стрелке 
     * с одновременным изменением цвета границ
     */
    0% {
        transform: translateY(-50%) rotate(0deg);
        border-color: #ccc; /* Начальный цвет - серый */
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
    }
    25% {
        border-right-color: #fff; /* Появление правой границы */
    }
    50% {
        border-bottom-color: #fff; /* Появление нижней границы */
    }
    75% {
        border-left-color: #fff; /* Появление левой границы */
    }
    100% {
        transform: translateY(-50%) rotate(360deg); /* Полный оборот */
        border-color: #fff; /* Все границы белые */
        border-top-color: #fff; /* Верхняя граница становится видимой в конце */
        box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.3); /* Дополнительный эффект свечения */
    }
}

/* Дополнительные состояния для лучшей визуализации */
.selectbox-item {
    position: relative;
    transition: all 0.3s ease;
}

.selectbox-item:hover {
    background-color: rgba(255, 0, 0, 0.1); /* Подсветка при наведении */
}

/* Не удалять, обводка рамки в модуле, действует как показатель какой цвет выбран */
            :root {
            --theme-accent-color: #ff3333;
            }
            .button--primary {
                background-color: var(--theme-base-color);
            }
            
            ${qualityColorsCSS}
        `,
        turquoise: `

/* =========== КАРТОЧКИ КОНТЕНТА =========== */
.card.focus, .card.hover {
    /* Анимация увеличения при фокусе */
    z-index: 2;
    transform: scale(1.1);
    outline: none;
}

.card--tv .card__type {
    /* Бейдж типа контента (ТВ) */
    position: absolute;
    background: linear-gradient(90deg, #ee7700, #006666);
    color: #fff;
    z-index: 4;
}

/* =========== ЭФФЕКТЫ ВЫДЕЛЕНИЯ =========== */
.card.focus .card__view::before,
.card.hover .card__view::before {
    /* Элемент свечения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border-radius: 1.4em;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0 0 0 #009999;
    animation: glow-pulse 1s 0.4s infinite ease-in-out;
}
.full-episode.focus::after,
.extensions__item.focus::after,
.explorer-card__head-img.focus::after,
.torrent-item.focus::after {
    /* Общий стиль рамки выделения */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid #006666;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
}

.card.focus .card__view::after, 
.card.hover .card__view::after {
    /* Элемент рамки */
    content: "";
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    right: -0.5em;
    bottom: -0.5em;
    border: 0.3em solid transparent;
    border-radius: 1.4em;
    z-index: -1;
    pointer-events: none;
    clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    animation: 
        border-draw 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards,
        border-glow 0.5s 0.5s ease-out forwards;
}

@keyframes border-draw {
    0% {
        border-color: transparent;
        clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%);
    }
    25% {
        border-top-color: #006666;
        clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0);
    }
    50% {
        border-right-color: #006666;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 100% 100%);
    }
    75% {
        border-bottom-color: #006666;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
    }
    100% {
        border-color: #006666;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    }
}

@keyframes border-glow {
    0% {
        border-color: #009999;
    }
    100% {
        border-color: #009999;
    }
}

@keyframes glow-pulse {
    0%, 100% {
        opacity: 0.8;
        box-shadow: 0 0 16px #009999;
    }
    50% {
        opacity: 1;
        box-shadow: 0 0 16px #00ffff;
    }
}

/* Микрофон и источник */
.search-source.active {
  opacity: 1;
  background-color: #009999;
  color: #fff;
}

.simple-keyboard .hg-button[data-skbtn="{MIC}"] {
  color: #f35b06;
}

/* =========== РЕЙТИНГИ И ГОЛОСОВАНИЕ =========== */
.card__vote {
    /* Контейнер рейтинга */
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 3px 3px;
    margin: 2px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    color: #fff;
    align-items: center;
}

.card__vote::before {
    /* Иконка звезды */
    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 -960 960 960'%3E%3Cpath fill='%23006666' d='M349.923-241.308 480-320.077l131.077 79.769-34.615-148.307 115.384-99.924L540.077-502 480-642.308 420.923-503l-151.769 13.461 115.384 99.693-34.615 148.538ZM283-150.076l52.615-223.539-173.923-150.847 229.231-18.846L480-754.693l90.077 211.385 228.231 18.846-173.923 150.847L677-150.076 480-268.923 283-150.076Zm197-281.616Z'/%3E%3C/svg%3E");
    width: 24px;
    height: 24px;
    margin-bottom: 1px;
    display: flex;
    justify-content: center;
}

.card__vote-count {
    /* Число рейтинга */
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
}

.explorer-card__head-rate {
    /* Рейтинг в карточке */
    color: #006666;
}

.explorer-card__head-rate > svg {
    /* Иконка звезды */
    width: 1.5em !important;
    height: 1.5em !important;
    margin-right: 0.5em;
}

.explorer-card__head-rate > span {
    /* Число рейтинга */
    font-size: 1.5em;
    font-weight: 600;
}

.full-start__rate {
    /* Облик рейтинга в описании карточки */
  background: rgb(78 185 180 / 3%);
  -webkit-border-radius: 0.3em;
  -moz-border-radius: 0.3em;
  border-radius: 0.3em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  font-size: 1.45em;
  margin-right: 1em;
}

/* Общие стили для всех иконок рейтингов */
.full-start__rate > div:last-child,
.full-start__rate .source--name {
  font-size: 0; /* Скрываем текст */
  color: transparent;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

/* TMDB из официального лого */
.rate--tmdb .source--name {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 185.04 133.4'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:url(%23linear-gradient);%7D%3C/style%3E%3ClinearGradient id='linear-gradient' y1='66.7' x2='185.04' y2='66.7' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2390cea1'/%3E%3Cstop offset='0.56' stop-color='%233cbec9'/%3E%3Cstop offset='1' stop-color='%2300b3e5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ctitle%3EAsset 4%3C/title%3E%3Cg id='Layer_2' data-name='Layer 2'%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Cpath class='cls-1' d='M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h-.1A17.67,17.67,0,0,1,86.3,66.7h0A17.67,17.67,0,0,1,68.63,84.37h.1A17.67,17.67,0,0,1,51.06,66.7Zm82.67-31.33h32.9A17.67,17.67,0,0,0,184.3,17.7h0A17.67,17.67,0,0,0,166.63,0h-32.9A17.67,17.67,0,0,0,116.06,17.7h0A17.67,17.67,0,0,0,133.73,35.37Zm-113,98h63.9A17.67,17.67,0,0,0,102.3,115.7h0A17.67,17.67,0,0,0,84.63,98H20.73A17.67,17.67,0,0,0,3.06,115.7h0A17.67,17.67,0,0,0,20.73,133.37Zm83.92-49h6.25L125.5,49h-8.35l-8.9,23.2h-.1L99.4,49H90.5Zm32.45,0h7.8V49h-7.8Zm22.2,0h24.95V77.2H167.1V70h15.35V62.8H167.1V56.2h16.25V49h-24ZM10.1,35.4h7.8V6.9H28V0H0V6.9H10.1ZM39,35.4h7.8V20.1H61.9V35.4h7.8V0H61.9V13.2H46.75V0H39Zm41.25,0h25V28.2H88V21h15.35V13.8H88V7.2h16.25V0h-24Zm-79,49H9V57.25h.1l9,27.15H24l9.3-27.15h.1V84.4h7.8V49H29.45l-8.2,23.1h-.1L13,49H1.2Zm112.09,49H126a24.59,24.59,0,0,0,7.56-1.15,19.52,19.52,0,0,0,6.35-3.37,16.37,16.37,0,0,0,4.37-5.5A16.91,16.91,0,0,0,146,115.8a18.5,18.5,0,0,0-1.68-8.25,15.1,15.1,0,0,0-4.52-5.53A18.55,18.55,0,0,0,133.07,99,33.54,33.54,0,0,0,125,98H113.29Zm7.81-28.2h4.6a17.43,17.43,0,0,1,4.67.62,11.68,11.68,0,0,1,3.88,1.88,9,9,0,0,1,2.62,3.18,9.87,9.87,0,0,1,1,4.52,11.92,11.92,0,0,1-1,5.08,8.69,8.69,0,0,1-2.67,3.34,10.87,10.87,0,0,1-4,1.83,21.57,21.57,0,0,1-5,.55H121.1Zm36.14,28.2h14.5a23.11,23.11,0,0,0,4.73-.5,13.38,13.38,0,0,0,4.27-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68,9.16,9.16,0,0,0-.55-3.2,7.79,7.79,0,0,0-1.57-2.62,8.38,8.38,0,0,0-2.45-1.85,10,10,0,0,0-3.18-1v-.1a9.28,9.28,0,0,0,4.43-2.82,7.42,7.42,0,0,0,1.67-5,8.34,8.34,0,0,0-1.15-4.65,7.88,7.88,0,0,0-3-2.73,12.9,12.9,0,0,0-4.17-1.3,34.42,34.42,0,0,0-4.63-.32h-13.2Zm7.8-28.8h5.3a10.79,10.79,0,0,1,1.85.17,5.77,5.77,0,0,1,1.7.58,3.33,3.33,0,0,1,1.23,1.13,3.22,3.22,0,0,1,.47,1.82,3.63,3.63,0,0,1-.42,1.8,3.34,3.34,0,0,1-1.13,1.2,4.78,4.78,0,0,1-1.57.65,8.16,8.16,0,0,1-1.78.2H165Zm0,14.15h5.9a15.12,15.12,0,0,1,2.05.15,7.83,7.83,0,0,1,2,.55,4,4,0,0,1,1.58,1.17,3.13,3.13,0,0,1,.62,2,3.71,3.71,0,0,1-.47,1.95,4,4,0,0,1-1.23,1.3,4.78,4.78,0,0,1-1.67.7,8.91,8.91,0,0,1-1.83.2h-7Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* IMDb из официального лого */
.rate--imdb > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg fill='%23ffcc00' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E");
}

/* Кинопоиск из официального лого */
.rate--kp > div:last-child {
  background-image: url("data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cmask id='mask0_1_69' style='mask-type:alpha' maskUnits='userSpaceOnUse' x='0' y='0' width='300' height='300'%3E%3Ccircle cx='150' cy='150' r='150' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0_1_69)'%3E%3Ccircle cx='150' cy='150' r='150' fill='black'/%3E%3Cpath d='M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z' fill='url(%23paint0_radial_1_69)'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='paint0_radial_1_69' cx='0' cy='0' r='1' gradientUnits='userSpaceOnUse' gradientTransform='translate(89.9999 45) rotate(45) scale(296.985)'%3E%3Cstop offset='0.5' stop-color='%23FF5500'/%3E%3Cstop offset='1' stop-color='%23BBFF00'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E");
}

/* =========== КНОПКИ И ФОКУС =========== */
.full-start__button {
  margin-right: 0.75em;
  font-size: 1.3em;
  background-color: rgb(78 185 180 / 24%);
  padding: 0.3em 1em;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -moz-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 2.8em;
  -webkit-flex-shrink: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

/* Стиль для состояния кнопок при наведении focus */
.full-start__button.focus {
  background: linear-gradient(90deg, #ee7700, #006666);
  color: #fff;
}

/* =========== НАВИГАЦИЯ И МЕНЮ =========== */
.menu__item.focus, 
.menu__item.traverse, 
.menu__item.hover,
.menuitem.focus.red,
.menuitem.traverse.red,
.menu__item.hover.red,
.broadcast__scan > div,
.broadcast__device.focus,
.head__action.focus, 
.head__action.hover,
.settings-param.focus,
.simple-button.focus,
.selectbox-item.focus,
.full-person.focus {
    /* Общие стили для активных элементов */
    background: linear-gradient(90deg, #ee7700, #006666);
    color: #fff;
    border-radius: 1em;
}

.tag-count.focus {
    /* Особый стиль для тегов */
    background: linear-gradient(90deg, #ee7700, #006666);
    color: #000;
}

.settings-folder.focus {
    /* Папка в настройках */
    background: linear-gradient(90deg, #ee7700, #006666);
    border-radius: 1em;
}

.head__action {
    /* Радиус фокуса */
    border-radius: 20%;
}

/* =========== ИНДИКАТОРЫ И БЕЙДЖИ =========== */
.extensions__cub {
    /* Бейдж расширений */
    position: absolute;
    top: 1em;
    right: 1em;
    background-color: rgba(34, 229, 10, 0.32);
    border-radius: 0.3em;
    padding: 0.3em 0.4em;
    font-size: 0.78em;
}

.head__action.active::after {
    /* Индикатор активности */
    content: "";
    display: block;
    width: 0.5em;
    height: 0.5em;
    position: absolute;
    top: 0;
    right: 0;
    background: linear-gradient(90deg, #ee7700, #006666);
    border: 0.1em solid #fff;
    border-radius: 100%;
}

.explorer-card__head-age {
    /* Бейдж возраста */
    border: 1px solid #ffff77;
    border-radius: 0.2em;
    padding: 0.2em 0.3em;
    margin-top: 1.4em;
    font-size: 0.9em;
}

/* =========== ЛОАДЕРЫ =========== */
.activity__loader {
    /* Полноэкранный лоадер */
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%23006666' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='1s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
}

.modal-loading {
    /* Лоадер в модальном окне */
    height: 6em;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' style='display: block; margin: auto;'%3E%3Cpath fill='%23006666' d='M2,12A11.2,11.2,0,0,1,13,1.05C12.67,1,12.34,1,12,1a11,11,0,0,0,0,22c.34,0,.67,0,1-.05C6,23,2,17.74,2,12Z'%3E%3CanimateTransform attributeName='transform' dur='1s' repeatCount='indefinite' type='rotate' values='0 12 12;360 12 12'/%3E%3C/path%3E%3C/svg%3E") no-repeat 50% 50%;
    background-size: contain;
}

/* =========== ПАНЕЛЬ НАСТРОЕК =========== */
.settings__content {
  position: fixed;
  top: 35;
  left: 100%;
  -webkit-transition: -webkit-transform 0.2s;
  transition: -webkit-transform 0.2s;
  -o-transition: -o-transform 0.2s;
  -moz-transition: transform 0.2s, -moz-transform 0.2s;
  transition: transform 0.2s;
  transition: transform 0.2s, -webkit-transform 0.2s, -moz-transform 0.2s, -o-transform 0.2s;
  background: #262829;
  width: 35%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  -webkit-border-top-left-radius: 2em;
  -webkit-border-top-right-radius: 2em;
  -moz-box-orient: vertical;
  -moz-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  will-change: transform;
  /* Единственное добавление */
  max-height: 95vh;
  overflow-y: auto;
}

@media screen and (max-width: 767px) {
  .settings__content {
    width: 50%;
  }
}
@media screen and (max-width: 580px) {
  .settings__content {
    width: 70%;
  }
}
@media screen and (max-width: 480px) {
  .settings__content {
    width: 100%;
    left: 0;
    top: unset;
    bottom: 0;
    height: auto !important;
    -webkit-transition: none;
    -o-transition: none;
    -moz-transition: none;
    transition: none;
    -webkit-transform: translate3d(0, 100%, 0);
       -moz-transform: translate3d(0, 100%, 0);
            transform: translate3d(0, 100%, 0);
    -webkit-border-top-left-radius: 2em;
       -moz-border-radius-topleft: 2em;
            border-top-left-radius: 2em;
    -webkit-border-top-right-radius: 2em;
       -moz-border-radius-topright: 2em;
            border-top-right-radius: 2em;
    /* Единственное добавление для мобилок */
    max-height: 85vh;
  }
}

.head__action.open-settings {
  position: relative;
  display: inline-block;
}

.head__action.open-settings::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 40%, white 50%, transparent 60%);
  background-size: 400% 400%;
  animation: blink-effect 1s ease;
  pointer-events: none;
}

/* =========== ТОП-5 КАРТОЧКИ =========== */
.items-line--type-top .items-cards .card:nth-child(1)::before {
    /* Стиль для 1-го места */
    content: "1";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #006666;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(2)::before {
    /* Стиль для 2-го места */
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #006666;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(3)::before {
    /* Стиль для 3-го места */
    content: "3";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #006666;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(4)::before {
    /* Стиль для 4-го места */
    content: "4";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #006666;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}

.items-line--type-top .items-cards .card:nth-child(5)::before {
    /* Стиль для 5-го места */
    content: "5";
    position: absolute;
    top: 0.1em;
    right: 88%;
    font-size: 18em;
    color: #000000;
    font-weight: 900;
    -webkit-text-stroke: 0.01em #006666;
    font-family: "Comic Sans MS", "Luckiest Guy", cursive;
    transform: rotate(-15deg);
    z-index: -1;
}
    /*Изменение расстояния 4 и 5 карточки */
.items-line--type-top .items-cards .card:nth-child(5) {
  margin-left: 3.7em;
}
.items-line--type-top .items-cards .card:nth-child(4) {
  margin-left: 3.7em;
}

.items-line__more.focus {
  background-color: #006666;
  color: #000;
}

/* =========== ПЕРСОНЫ =========== */
.full-person__photo {
    /* Аватар персоны */
    width: 7em;
    height: 7em;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 1em;
    background-size: cover;
    background-position: 50% 50%;
    display: flex;
    align-items: center;
}

.full-start__pg, .full-start__status {
    /* Статус просмотра */
    font-size: 1.2em;
    border: 1px solid #ffeb3b;
    border-radius: 0.2em;
    padding: 0.3em;
}

/* =========== ВЫБОР ЭЛЕМЕНТОВ =========== */
.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Индикатор выбора */
    content: "";
    display: block;
    width: 1.2em;
    height: 1.2em;
    border: 0.15em solid #ccc;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    right: 1.4em;
    transform: translateY(-50%);
}

.selectbox-item.selected:not(.nomark)::after, 
.selectbox-item.picked::after {
    /* Анимация заполнения круга */
    border-color: #fff;
    border-top-color: transparent; /* Начинаем с прозрачной верхней границы */
    animation: circle-fill 3s ease-in-out forwards; /* Плавная анимация с фиксацией конечного состояния */
}

@keyframes circle-fill {
    /* 
     * Анимация имитирует "заполнение" круга по часовой стрелке 
     * с одновременным изменением цвета границ
     */
    0% {
        transform: translateY(-50%) rotate(0deg);
        border-color: #ccc; /* Начальный цвет - серый */
        border-top-color: transparent;
        border-right-color: transparent;
        border-bottom-color: transparent;
        border-left-color: transparent;
    }
    25% {
        border-right-color: #fff; /* Появление правой границы */
    }
    50% {
        border-bottom-color: #fff; /* Появление нижней границы */
    }
    75% {
        border-left-color: #fff; /* Появление левой границы */
    }
    100% {
        transform: translateY(-50%) rotate(360deg); /* Полный оборот */
        border-color: #fff; /* Все границы белые */
        border-top-color: #fff; /* Верхняя граница становится видимой в конце */
        box-shadow: 0 0 0 3px rgba(78, 185, 180, 0.3); /* Дополнительный эффект свечения */
    }
}

/* Дополнительные состояния для лучшей визуализации */
.selectbox-item {
    position: relative;
    transition: all 0.3s ease;
}

.selectbox-item:hover {
    background-color: rgba(78, 185, 180, 0.1); /* Подсветка при наведении */
}

/* Не удалять, обводка рамки в модуле, действует как показатель какой цвет выбран */
            :root {
            --theme-accent-color: #006666;
            }
            .button--primary {
                background-color: var(--theme-base-color);
            }
            
            ${qualityColorsCSS}
        `,
        
    };

// Иконки для тем
var themeIcons = {
    prisma: generateIcon("#60ffb0"),
    blue: generateIcon("#6666ff"),
    green: generateIcon("#00cc00"),
    orange: generateIcon("#ee7700"),
    purple: generateIcon("#cc00cc"),
    red: generateIcon("#ff3333"),
    turquoise: generateGradientIcon("#ee7700", "#006666") // Только здесь градиент!
};

// Стандартная иконка (один цвет)
function generateIcon(color) {
    return `data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E
        %3Cdefs%3E
            %3ClinearGradient id='blink-gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E
                %3Cstop offset='0%25' stop-color='white' stop-opacity='0'/%3E
                %3Cstop offset='40%25' stop-color='white' stop-opacity='0'/%3E
                %3Cstop offset='50%25' stop-color='white' stop-opacity='1'/%3E
                %3Cstop offset='60%25' stop-color='white' stop-opacity='0'/%3E
                %3Cstop offset='100%25' stop-color='white' stop-opacity='0'/%3E
            %3C/linearGradient%3E
            %3Cmask id='mask-2' fill='white'%3E
                %3Cpolygon points='0 0.16 79.74 0.16 79.74 77.52 0 77.52'/%3E
            %3C/mask%3E
        %3C/defs%3E
        %3Cpath d='M71.46,70.23C56.34,71.02 53.26,53.72 47.33,53.84c-2.53,0.05-4.52,2.7-3.65,5.78 0.48,1.69 1.82,4.17 2.66,5.71 2.97,5.44-1.42,11.59-6.55,12.11-8.53,0.86-12.09-4.09-11.87-9.15 0.25-5.68 5.07-11.49 0.12-13.96-5.18-2.59-9.39,7.53-14.35,9.79-4.49,2.05-10.71,0.46-12.93-4.52-1.56-3.5-1.27-10.24 5.65-12.81 4.32-1.61 13.96,2.1 14.45-2.6 0.57-5.41-10.12-5.87-13.34-7.17-5.7-2.3-9.06-7.21-6.43-12.48 1.98-3.95 7.79-5.56 12.23-3.83 5.32,2.07 6.18,7.59 8.9,9.88 2.35,1.98 5.56,2.23 7.66,0.87 1.55-1 2.07-3.2 1.48-5.21-0.78-2.67-2.83-4.34-4.84-5.97-3.57-2.9-8.62-5.4-5.57-13.33C23.48,0.46 30.81,0.23 30.81,0.23c2.91-0.33 5.52,0.55 7.65,2.45 2.84,2.54 3.4,5.93 2.92,9.55-0.44,3.31-1.61,6.2-2.22,9.48-0.71,3.8 1.32,7.63 5.19,7.78 5.08,0.2 6.6-3.71 7.23-6.19 0.91-3.62 2.1-6.99 5.47-9.11 4.83-3.04 11.53-2.37 14.64,3.47 2.46,4.63 1.67,11-2.11,14.48-1.69,1.56-3.73,2.11-5.93,2.12-3.16,0.02-6.32-0.06-9.25,1.42-1.99,1.01-2.86,2.65-2.86,4.84 0,2.14 1.11,3.54 2.92,4.45 3.4,1.71 7.16,2.06 10.83,2.71 5.33,0.93 10.02,2.81 13.03,7.76 0.03,0.04 0.05,0.09 0.08,0.13 3.45,5.86-0.17,14.29-6.96,14.65z' fill='${encodeURIComponent(color)}' mask='url(%23mask-2)'/%3E
        %3Crect width='150%25' height='150%25' fill='url(%23blink-gradient)' opacity='0'%3E
            %3Canimate attributeName='opacity' values='0;0.8;0' dur='5s' begin='0s;100s' repeatCount='indefinite'/%3E
            %3Canimate attributeName='x' values='-100%25;100%25' dur='5s' begin='0s;100s' repeatCount='indefinite'/%3E
            %3Canimate attributeName='y' values='-100%25;100%25' dur='5s' begin='0s;100s' repeatCount='indefinite'/%3E
        %3C/rect%3E
    %3C/svg%3E`;
}

// Функция для градиента (только для turquoise)
function generateGradientIcon(color1, color2) {
    return `data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E
        %3Cdefs%3E
            %3ClinearGradient id='icon-gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E
                %3Cstop offset='0%25' stop-color='${encodeURIComponent(color1)}'/%3E
                %3Cstop offset='100%25' stop-color='${encodeURIComponent(color2)}'/%3E
            %3C/linearGradient%3E
            %3ClinearGradient id='blink-gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E
                %3Cstop offset='0%25' stop-color='white' stop-opacity='0'/%3E
                %3Cstop offset='40%25' stop-color='white' stop-opacity='0'/%3E
                %3Cstop offset='50%25' stop-color='white' stop-opacity='1'/%3E
                %3Cstop offset='60%25' stop-color='white' stop-opacity='0'/%3E
                %3Cstop offset='100%25' stop-color='white' stop-opacity='0'/%3E
            %3C/linearGradient%3E
            %3Cmask id='mask-2' fill='white'%3E
                %3Cpolygon points='0 0.16 79.74 0.16 79.74 77.52 0 77.52'/%3E
            %3C/mask%3E
        %3C/defs%3E
        %3Cpath d='M71.46,70.23C56.34,71.02 53.26,53.72 47.33,53.84c-2.53,0.05-4.52,2.7-3.65,5.78 0.48,1.69 1.82,4.17 2.66,5.71 2.97,5.44-1.42,11.59-6.55,12.11-8.53,0.86-12.09-4.09-11.87-9.15 0.25-5.68 5.07-11.49 0.12-13.96-5.18-2.59-9.39,7.53-14.35,9.79-4.49,2.05-10.71,0.46-12.93-4.52-1.56-3.5-1.27-10.24 5.65-12.81 4.32-1.61 13.96,2.1 14.45-2.6 0.57-5.41-10.12-5.87-13.34-7.17-5.7-2.3-9.06-7.21-6.43-12.48 1.98-3.95 7.79-5.56 12.23-3.83 5.32,2.07 6.18,7.59 8.9,9.88 2.35,1.98 5.56,2.23 7.66,0.87 1.55-1 2.07-3.2 1.48-5.21-0.78-2.67-2.83-4.34-4.84-5.97-3.57-2.9-8.62-5.4-5.57-13.33C23.48,0.46 30.81,0.23 30.81,0.23c2.91-0.33 5.52,0.55 7.65,2.45 2.84,2.54 3.4,5.93 2.92,9.55-0.44,3.31-1.61,6.2-2.22,9.48-0.71,3.8 1.32,7.63 5.19,7.78 5.08,0.2 6.6-3.71 7.23-6.19 0.91-3.62 2.1-6.99 5.47-9.11 4.83-3.04 11.53-2.37 14.64,3.47 2.46,4.63 1.67,11-2.11,14.48-1.69,1.56-3.73,2.11-5.93,2.12-3.16,0.02-6.32-0.06-9.25,1.42-1.99,1.01-2.86,2.65-2.86,4.84 0,2.14 1.11,3.54 2.92,4.45 3.4,1.71 7.16,2.06 10.83,2.71 5.33,0.93 10.02,2.81 13.03,7.76 0.03,0.04 0.05,0.09 0.08,0.13 3.45,5.86-0.17,14.29-6.96,14.65z' fill='url(%23icon-gradient)' mask='url(%23mask-2)'/%3E
        %3Crect width='150%25' height='150%25' fill='url(%23blink-gradient)' opacity='0'%3E
            %3Canimate attributeName='opacity' values='0;0.8;0' dur='5s' begin='0s;100s' repeatCount='indefinite'/%3E
            %3Canimate attributeName='x' values='-100%25;100%25' dur='5s' begin='0s;100s' repeatCount='indefinite'/%3E
            %3Canimate attributeName='y' values='-100%25;100%25' dur='5s' begin='0s;100s' repeatCount='indefinite'/%3E
        %3C/rect%3E
    %3C/svg%3E`;
};
    var plugins = [
        { 
            name: 'Prisma', 
            key: 'prisma',
            apply: function() {
                applyTheme('prisma');
            },
            remove: function() {
                removeTheme('prisma');
            }
        },
        { 
            name: 'Blue', 
            key: 'blue',
            apply: function() {
                applyTheme('blue');
            },
            remove: function() {
                removeTheme('blue');
            }
        },
        { 
            name: 'Green', 
            key: 'green',
            apply: function() {
                applyTheme('green');
            },
            remove: function() {
                removeTheme('green');
            }
        },
        { 
            name: 'Orange', 
            key: 'orange',
            apply: function() {
                applyTheme('orange');
            },
            remove: function() {
                removeTheme('orange');
            }
        },
        { 
            name: 'Purple', 
            key: 'purple',
            apply: function() {
                applyTheme('purple');
            },
            remove: function() {
                removeTheme('purple');
            }
        },
        { 
            name: 'Red', 
            key: 'red',
            apply: function() {
                applyTheme('red');
            },
            remove: function() {
                removeTheme('red');
            }
        },
        { 
            name: 'Turquoise', 
            key: 'turquoise',
            apply: function() {
                applyTheme('turquoise');
            },
            remove: function() {
                removeTheme('turquoise');
            }
        }
    ];

    function applyTheme(themeKey) {
        var style = document.createElement('style');
        style.id = themeKey + '-theme';
        style.textContent = themes[themeKey];
        document.head.appendChild(style);
    }

    function removeTheme(themeKey) {
        var style = document.getElementById(themeKey + '-theme');
        if (style) style.remove();
    }

    var style = document.createElement('style');
    style.textContent = `
        .icon-item {
            padding: 5px;
            border-radius: 10px;
            transition: all 0.2s ease-in-out;
        }
        .icon-item img {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
       .icon-item.focused {
            outline: 1px solid var(--theme-accent-color, red);
            box-shadow: 0 0 12px var(--theme-accent-color, red);
            transform: scale(1.1);
        }
        .head__action img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
        .reset-btn {
            background: rgba(255, 0, 0, 0.2);
            color: white;
            border: 1px solid red;
            border-radius: 8px;
            padding: 10px 15px;
            margin-top: 20px;
            cursor: pointer;
            text-align: center;
            transition: background 0.3s;
        }
        .reset-btn.focused {
    outline: 1px solid var(--theme-accent-color, red);
    box-shadow: 0 0 12px var(--theme-accent-color, red);
    transform: scale(1.1);
    transition: all 0.2s ease-out;
    z-index: 10;
    position: relative;
}
        .theme-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
            max-height: 70vh;
            overflow-y: auto;
            padding: 20px;
        }
        .modal__content {
  background-color: #262829;
  padding: 1.1em;
  -webkit-border-radius: 1em;
  -moz-border-radius: 1em;
  border-radius: 1em;
  margin: 0 auto;
  position: relative;
}
@media screen and (max-width: 767px) {
  .modal__content {
    max-width: 80%;
  }
}
@media screen and (max-width: 580px) {
  .modal__content {
    max-width: 80%;
  }
}
@media screen and (max-width: 480px) {
  .modal__content {
    max-width: 100%;
    -webkit-border-top-left-radius: 2em;
       -moz-border-radius-topleft: 2em;
            border-top-left-radius: 2em;
    -webkit-border-top-right-radius: 2em;
       -moz-border-radius-topright: 2em;
            border-top-right-radius: 2em;
    -webkit-border-bottom-left-radius: 0;
       -moz-border-radius-bottomleft: 0;
            border-bottom-left-radius: 0;
    -webkit-border-bottom-right-radius: 0;
       -moz-border-radius-bottomright: 0;
            border-bottom-right-radius: 0;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
  }
}
    `;
    document.head.appendChild(style);

    function removeCurrentPlugin() {
        plugins.forEach(plugin => plugin.remove());
        if (Lampa && Lampa.Storage) {
            Lampa.Storage.set('selectedPlugin', DEFAULT_PLUGIN);
        }
    }

    function addPluginIcon() {
        var savedPlugin = (Lampa && Lampa.Storage) ? Lampa.Storage.get('selectedPlugin', DEFAULT_PLUGIN) : DEFAULT_PLUGIN;

        var iconContainer = $('<div class="head__action selector open--plugins" data-action="apply-plugin">' +
            '<img class="plugin-icon" src="' + (themeIcons[savedPlugin] || "data:image/svg+xml,%3Csvg width='110' height='104' viewBox='0 0 110 104' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M81.6744 103.11C98.5682 93.7234 110 75.6967 110 55C110 24.6243 85.3757 0 55 0C24.6243 0 0 24.6243 0 55C0 75.6967 11.4318 93.7234 28.3255 103.11C14.8869 94.3724 6 79.224 6 62C6 34.938 27.938 13 55 13C82.062 13 104 34.938 104 62C104 79.224 95.1131 94.3725 81.6744 103.11Z' fill='white'/%3E%3Cpath d='M92.9546 80.0076C95.5485 74.5501 97 68.4446 97 62C97 38.804 78.196 20 55 20C31.804 20 13 38.804 13 62C13 68.4446 14.4515 74.5501 17.0454 80.0076C16.3618 77.1161 16 74.1003 16 71C16 49.4609 33.4609 32 55 32C76.5391 32 94 49.4609 94 71C94 74.1003 93.6382 77.1161 92.9546 80.0076Z' fill='white'/%3E%3Cpath d='M55 89C69.3594 89 81 77.3594 81 63C81 57.9297 79.5486 53.1983 77.0387 49.1987C82.579 54.7989 86 62.5 86 71C86 88.1208 72.1208 102 55 102C37.8792 102 24 88.1208 24 71C24 62.5 27.421 54.7989 32.9613 49.1987C30.4514 53.1983 29 57.9297 29 63C29 77.3594 40.6406 89 55 89Z' fill='white'/%3E%3Cpath d='M73 63C73 72.9411 64.9411 81 55 81C45.0589 81 37 72.9411 37 63C37 53.0589 45.0589 45 55 45C64.9411 45 73 53.0589 73 63Z' fill='white'/%3E%3C/svg%3E") + '">' +
        '</div>');

        var headActionsContainer = $(".head__actions");
        if (headActionsContainer.length) {
            headActionsContainer.append(iconContainer);
        } else {
            setTimeout(addPluginIcon, 500);
            return;
        }

        iconContainer.on("hover:enter", function () {
            openPluginModal(iconContainer.find('.plugin-icon'));
        });

        if (savedPlugin !== DEFAULT_PLUGIN) {
            plugins.find(p => p.key === savedPlugin)?.apply();
        }
    }

    function openPluginModal(iconElement) {
        var html = $('<div class="modal__body" style="padding: 25px; position: relative; border-radius: 10px;"></div>');
        var modalTitle = $('<div style="font-size: 1.7em; font-weight: bold; color: white; text-align: center; margin-bottom: 20px;">Выберите тему</div>div');
        var pluginGrid = $('<div class="theme-grid"></div>');

        var resetBtn = $('<div class="reset-btn selector" tabindex="0">Off (Стандартный стиль💡)</div>');

        // Оригинальный обработчик hover:focus
        resetBtn.on('hover:focus', function() {
        $('.reset-btn').removeClass('focused');
        $(this).addClass('focused');
    });

        // Дополнительная обработка для пульта
        resetBtn.on('focus', function() {
        $('.reset-btn').removeClass('focused');
        $(this).addClass('focused');
    });

        // Принудительное снятие фокуса при навигации
        $(document).on('keydown', function(e) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        $('.reset-btn.focused').removeClass('focused');
        }
    });

        resetBtn.on('hover:enter', function () {
            removeCurrentPlugin();
            iconElement.attr('src', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNNDQ4IDMyaDY0djQ0OGgtNjR6bS0xMjggMGg2NHY0NDhoLTY0em0tMTI4IDBoNjR2NDQ4aC02NHptLTEyOCAwSDk2djQ0OGg2NHptLTEyOCAwaDY0djQ0OEg2NHptLTY0IDB2NjRoNDQ4VjMySDB6Ii8+PC9zdmc+');
            Lampa.Modal.close();
            setTimeout(function() { location.reload(); }, 300);
        });

        // Добавляем элементы для каждой темы
        plugins.forEach(plugin => {
            var pluginItem = $('<div class="icon-item selector">' +
                '<img src="' + themeIcons[plugin.key] + '">' +
                '<div style="color: lightgray; text-align: center; margin-top: 5px;">' + plugin.name + '</div>' +
                '</div>');

            pluginItem.on('hover:focus', function () {
                $('.icon-item').removeClass('focused');
                $(this).addClass('focused');
            });

            pluginItem.on('hover:enter', function () {
                removeCurrentPlugin();
                plugin.apply();
                iconElement.attr('src', themeIcons[plugin.key]);
                if (Lampa && Lampa.Storage) {
                    Lampa.Storage.set('selectedPlugin', plugin.key);
                }
                Lampa.Modal.close();
                setTimeout(function() { location.reload(); }, 500);
            });

            pluginGrid.append(pluginItem);
        });

        html.append(modalTitle);
        html.append(pluginGrid);
        html.append(resetBtn);

       Lampa.Modal.open({
            title: '',
            html: html,
            size: 'middle',
            position: 'center',
            onBack: function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }


    // Добавляем функцию для установки атрибутов качества
    function applyQualityAttributes() {
        document.querySelectorAll('.card__quality, .card-v2 .card__quality').forEach(el => {
            const quality = el.textContent.trim().toUpperCase();
            el.setAttribute('data-quality', quality);
        });
    }

    // Модифицируем функцию applyTheme
    function applyTheme(themeKey) {
        var style = document.createElement('style');
        style.id = themeKey + '-theme';
        style.textContent = themes[themeKey];
        document.head.appendChild(style);
        
        // Применяем атрибуты качества
        applyQualityAttributes();
        
        // Наблюдаем за динамическим контентом
        new MutationObserver(() => applyQualityAttributes())
            .observe(document.body, {childList: true, subtree: true});
    }

    if (window.appready) {
        addPluginIcon();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                addPluginIcon();
            }
        });
    }
})();