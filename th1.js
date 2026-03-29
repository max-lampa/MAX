(function() {
    'use strict';

    // Основний об'єкт плагіна
    var SafeStyle = {
        name: 'safe_style',
        version: '2.2.5',
        settings: {
            theme: 'custom_color',
            custom_color: '#c22222', // Початковий колір (Червоний)
            enabled: true, // Стан плагіна (увімкнено/вимкнено)
            button_styles_enabled: true // Стан управління стилями кнопок
        }
    };

    // Функція для застосування теми
    function applyTheme(theme, color) {
        // Видаляємо попередні стилі теми
        $('#interface_mod_theme').remove();

        // Якщо плагін відключений або вибрано "default", скидаємо стилі
        if (!SafeStyle.settings.enabled || theme === 'default') return;

        // Використовуємо переданий колір або збережений, якщо тема "custom_color"
        var selectedColor = (theme === 'custom_color') ? (color || SafeStyle.settings.custom_color || '#c22222') : '#c22222';

        // Код SVG для лоадера з обраним кольором
        var svgCode = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="135" height="140" fill="' + selectedColor + '">' +
            '<rect width="10" height="40" y="100" rx="6"><animate attributeName="height" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="20" y="100" rx="6"><animate attributeName="height" begin="0.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="40" y="100" rx="6"><animate attributeName="height" begin="0.4s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0.4s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="60" y="100" rx="6"><animate attributeName="height" begin="0.6s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0.6s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="80" y="100" rx="6"><animate attributeName="height" begin="0.8s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="0.8s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="100" y="100" rx="6"><animate attributeName="height" begin="1s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="1s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect>' +
            '<rect width="10" height="40" x="120" y="100" rx="6"><animate attributeName="height" begin="1.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="40;100;40" keyTimes="0;0.5;1"/>' +
            '<animate attributeName="y" begin="1.2s" calcMode="linear" dur="1s" repeatCount="indefinite" values="100;40;100" keyTimes="0;0.5;1"/></rect></svg>');

        // Створюємо новий стиль
        var style = $('<style id="interface_mod_theme"></style>');

        // Динамічний стиль на основі вибраного кольору
        var dynamicTheme = `
            .navigation-bar__body {
                background: rgba(20, 20, 20, 0.96);
            }
            .card__quality, .card--tv .card__type {
                background: linear-gradient(to right, ${selectedColor}dd, ${selectedColor}99);
            }
            .screensaver__preload {
                background: url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%;
            }
            .activity__loader {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: none;
                background: url("data:image/svg+xml,${svgCode}") no-repeat 50% 50%;
            }
            body {
                background: linear-gradient(135deg, #1a1a1a, ${selectedColor}33);
                color: #ffffff;
            }
            .company-start.icon--broken .company-start__icon,
            .explorer-card__head-img > img,
            .bookmarks-folder__layer,
            .card-more__box,
            .card__img {
                background-color: #2a2a2a;
            }
            .search-source.focus,
            .simple-button.focus,
            .menu__item.focus,
            .menu__item.traverse,
            .menu__item.hover,
            .full-start__button.focus,
            .full-descr__tag.focus,
            .player-panel .button.focus,
            .full-person.selector.focus,
            .tag-count.selector.focus {
                background: linear-gradient(to right, ${selectedColor}, ${selectedColor}cc);
                color: #fff;
                box-shadow: 0 0 0.4em ${selectedColor}33;
                border-radius: 0.5em;
            }
            .selectbox-item.focus,
            .settings-folder.focus,
            .settings-param.focus {
                background: linear-gradient(to right, ${selectedColor}, ${selectedColor}cc);
                color: #fff;
                box-shadow: 0 0 0.4em ${selectedColor}33;
                border-radius: 0.5em 0 0 0.5em;
            }
            .full-episode.focus::after,
            .card-episode.focus .full-episode::after,
            .items-cards .selector.focus::after,
            .card-more.focus .card-more__box::after,
            .card-episode.focus .full-episode::after,
            .card-episode.hover .full-episode::after,
            .card.focus .card__view::after,
            .card.hover .card__view::after,
            .torrent-item.focus::after,
            .online-prestige.selector.focus::after,
            .online-prestige--full.selector.focus::after,
            .explorer-card__head-img.selector.focus::after,
            .extensions__item.focus::after,
            .extensions__block-add.focus::after {
                border: 0.2em solid ${selectedColor};
                box-shadow: 0 0 0.8em ${selectedColor}33;
                border-radius: 1em;
            }
            .head__action.focus,
            .head__action.hover {
                background: linear-gradient(45deg, ${selectedColor}, ${selectedColor}cc);
            }
            .modal__content {
                background: rgba(20, 20, 20, 0.96);
                border: 0 solid rgba(20, 20, 20, 0.96);
            }
            .settings__content,
            .settings-input__content,
            .selectbox__content {
                background: rgba(20, 20, 20, 0.96);
            }
            .torrent-serial {
                background: rgba(0, 0, 0, 0.22);
                border: 0.2em solid rgba(0, 0, 0, 0.22);
            }
            .torrent-serial.focus {
                background-color: ${selectedColor}33;
                border: 0.2em solid ${selectedColor};
            }
            /* Стилі для іконок у кнопках */
            .full-start__button svg {
                fill: #ffffff; /* Колір іконок без фокусу */
            }
            .full-start__button.focus svg {
                fill: ${selectedColor}; /* Колір іконок у фокусі */
            }
            .menu__item svg {
                fill: #ffffff; /* Колір іконок у меню без фокусу */
            }
            .menu__item.focus svg,
            .menu__item.traverse svg,
            .menu__item.hover svg {
                fill: ${selectedColor}; /* Колір іконок у меню при фокусі/наведенні */
            }
            .simple-button svg {
                fill: #ffffff; /* Колір іконок у простих кнопках без фокусу */
            }
            .simple-button.focus svg {
                fill: ${selectedColor}; /* Колір іконок у простих кнопках при фокусі */
            }
        `;

        // Встановлюємо стиль
        style.html(dynamicTheme);
        $('head').append(style);
    }

    // Решта коду залишається без змін
    function AddIn() {
        // Шаблон карточки, де рік перенесено вище назви
        Lampa.Template.add('card', `
            <div class="card selector layer--visible layer--render">
                <div class="card__view">
                    <img src="./img/img_load.svg" class="card__img" />
                    <div class="card__icons">
                        <div class="card__icons-inner"></div>
                    </div>
                    <div class="card__age">{release_year}</div>
                </div>
                <div class="card__title">{title}</div>
            </div>
        `);

        // Шаблон карточки виходу епізоду
        Lampa.Template.add('card_episode', `
            <div class="card-episode selector layer--visible layer--render">
                <div class="card-episode__body">
                    <div class="full-episode">
                        <div class="full-episode__img">
                            <img />
                        </div>
                        <div class="full-episode__body">
                            <div class="card__title">{title}</div>
                            <div class="card__age">{release_year}</div>
                            <div class="full-episode__num hide">{num}</div>
                            <div class="full-episode__name">{name}</div>
                            <div class="full-episode__date">{date}</div>
                        </div>
                    </div>
                </div>
                <div class="card-episode__footer hide">
                    <div class="card__imgbox">
                        <div class="card__view">
                            <img class="card__img" />
                        </div>
                    </div>
                    <div class="card__left">
                        <div class="card__title">{title}</div>
                        <div class="card__age">{release_year}</div>
                    </div>
                </div>
            </div>
        `);

        // Шаблон карточки фільму/серіалу (з поверненням рейтингу TMDB)
        Lampa.Template.add('full_start_new', `
            <div class="full-start-new">
                <div class="full-start-new__body">
                    <div class="full-start-new__left">
                        <div class="full-start-new__poster">
                            <img class="full-start-new__img full--poster" />
                        </div>
                    </div>
                    <div class="full-start-new__right">
                        <div class="full-start-new__head"></div>
                        <div class="full-start-new__title">{title}</div>
                        <div class="full-start__title-original">{original_title}</div>
                        <div class="full-start-new__tagline full--tagline">{tagline}</div>
                        <div class="full-start-new__rate-line">
                            <div class="full-start__rate rate--tmdb"><div>{rating}</div><div class="source--name">TMDB</div></div>
                        </div>
                        <div class="full-start-new__details"></div>
                        <div class="full-start-new__reactions">
                            <div>#{reactions_none}</div>
                        </div>
                        <div class="full-start-new__buttons">
                            <div class="full-start__button selector button--play">
                                <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>
                                    <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>
                                </svg>
                                <span>#{title_watch}</span>
                            </div>
                            <div class="full-start__button view--torrent">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">
                                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>
                                </svg>
                                <span>#{full_torrents}</span>
                            </div>
                            <div class="full-start__button selector view--trailer">
                                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>
                                </svg>
                                <span>#{full_trailers}</span>
                            </div>
                            <div class="full-start__button selector button--book">
                                <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.3975 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>
                                </svg>
                                <span>#{settings_input_links}</span>
                            </div>
                            <div class="full-start__button selector button--reaction">
                                <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>
                                    <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>
                                </svg>
                                <span>#{title_reactions}</span>
                            </div>
                            <div class="full-start__button selector button--subscribe hide">
                                <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>
                                    <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>
                                </svg>
                                <span>#{title_subscribe}</span>
                            </div>
                            <div class="full-start__button selector button--options">
                                <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>
                                    <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>
                                    <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Базові стилі (без стилів для рейтингу)
        var style = `
            <style>
                .selectbox-item__checkbox {
                    border-radius: 100%;
                }
                .selectbox-item--checked .selectbox-item__checkbox {
                    background: #ccc;
                }
                .card__title {
                    height: 3.6em;
                    text-overflow: ellipsis;
                    -o-text-overflow: ellipsis;
                    text-overflow: ellipsis;
                    -webkit-line-clamp: 3;
                    line-clamp: 3;
                }
                .card__age {
                    position: absolute;
                    right: 0em;
                    bottom: 0em;
                    z-index: 10;
                    background: rgba(0, 0, 0, 0.6);
                    color: #ffffff;
                    font-weight: 700;
                    padding: 0.4em 0.6em;
                    border-radius: 0.48em 0 0.48em 0;
                    line-height: 1.0;
                    font-size: 1.0em;
                }
                .card__vote {
                    position: absolute;
                    bottom: auto;
                    right: 0em;
                    top: 0em;
                    background: rgba(0, 0, 0, 0.6);
                    font-weight: 700;
                    color: #fff;
                    border-radius: 0 0.34em 0 0.34em;
                    line-height: 1.0;
                    font-size: 1.4em;
                }
                .card__type {
                    position: absolute;
                    bottom: auto;
                    left: 0em;
                    right: auto;
                    top: 0em;
                    background: rgba(0, 0, 0, 0.6);
                    color: #fff;
                    font-weight: 700;
                    padding: 0.4em 0.6em;
                    border-radius: 0.4em 0 0.4em 0;
                    line-height: 1.0;
                    font-size: 1.0em;
                }
                .card--tv .card__type {
                    color: #fff;
                }
                .card__icons {
                    position: absolute;
                    top: 2em;
                    left: 0;
                    right: auto;
                    display: flex;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.6);
                    color: #fff;
                    border-radius: 0 0.5em 0.5em 0;
                }
                .card__icons-inner {
                    background: rgba(0, 0, 0, 0);
                }
                .card__marker {
                    position: absolute;
                    left: 0em;
                    top: 4em;
                    bottom: auto;
                    background: rgba(0, 0, 0, 0.6);
                    border-radius: 0 0.5em 0.5em 0;
                    font-weight: 700;
                    font-size: 1.0em;
                    padding: 0.4em 0.6em;
                    display: flex;
                    align-items: center;
                    line-height: 1.2;
                    max-width: min(12em, 95%);
                    box-sizing: border-box;
                }
                .card__marker > span {
                    max-width: min(12em, 95%);
                }
                .card__quality {
                    position: absolute;
                    left: auto;
                    right: 0em;
                    bottom: 2.4em;
                    padding: 0.4em 0.6em;
                    color: #fff;
                    font-weight: 700;
                    font-size: 1.0em;
                    border-radius: 0.5em 0 0 0.5em;
                    text-transform: uppercase;
                }
                .items-line.items-line--type-cards + .items-line.items-line--type-cards {
                    margin-top: 1em;
                }
                .card--small .card__view {
                    margin-bottom: 2em;
                }
                .items-line--type-cards {
                    min-height: 18em;
                }
                @media screen and (min-width: 580px) {
                    .full-start-new {
                        min-height: 80vh;
                        display: flex;
                    }
                }
                .full-start-new__buttons .full-start__button:not(.focus) span {
                    display: inline;
                }
                @media screen and (max-width: 580px) {
                    .full-start-new__buttons {
                        overflow: auto;
                    }
                    .full-start-new__buttons .full-start__button:not(.focus) span {
                        display: none;
                    }
                }
                .full-start__background.loaded {
                    opacity: 0.8;
                }
                .full-start__background.dim {
                    opacity: 0.2;
                }
                .explorer__files .torrent-filter .simple-button {
                    font-size: 1.2em;
                    border-radius: 0.5em;
                }
                .extensions__item,
                .extensions__block-add,
                .search-source,
                .bookmarks-folder__layer,
                .bookmarks-folder__body,
                .card__img,
                .card__promo,
                .full-episode--next .full-episode__img:after,
                .full-episode__img img,
                .full-episode__body,
                .full-person__photo,
                .card-more__box,
                .full-start__button,
                .simple-button,
                .register {
                    border-radius: 0.5em;
                }
                .extensions__item.focus::after,
                .extensions__block-add.focus::after,
                .full-episode.focus::after,
                .full-review-add.focus::after,
                .card-parser.focus::after,
                .card-episode.focus .full-episode::after,
                .card-episode.hover .full-episode::after,
                .card.focus .card__view::after,
                .card.hover .card__view::after,
                .card-more.focus .card-more__box::after,
                .register.focus::after {
                    border-radius: 1em;
                }
                .search-source.focus,
                .simple-button.focus,
                .menu__item.focus,
                .menu__item.traverse,
                .menu__item.hover,
                .full-start__button.focus,
                .full-descr__tag.focus,
                .player-panel .button.focus,
                .full-person.selector.focus,
                .tag-count.selector.focus {
                    border-radius: 0.5em;
                }
                .card {
                    transform: scale(1);
                    transition: transform 0.3s ease;
                }
                .card.focus {
                    transform: scale(1.03);
                }
                .torrent-item,
                .online-prestige {
                    transform: scale(1);
                    transition: transform 0.3s ease;
                }
                .torrent-item.focus,
                .online-prestige.focus {
                    transform: scale(1.01);
                }
                .tag-count,
                .full-person,
                .full-episode,
                .simple-button,
                .full-start__button,
                .items-cards .selector,
                .card-more,
                .explorer-card__head-img.selector,
                .card-episode {
                    transform: scale(1);
                    transition: transform 0.3s ease;
                }
                .tag-count.focus,
                .full-person.focus,
                .full-episode.focus,
                .simple-button.focus,
                .full-start__button.focus,
                .items-cards .selector.focus,
                .card-more.focus,
                .explorer-card__head-img.selector.focus,
                .card-episode.focus,
                .card-episode.hover {
                    transform: scale(1.02);
                }
                /* Приховуємо параметр "Колір теми" за замовчуванням */
                div[data-name="safe_style_color"] {
                    display: none;
                }
                /* Показуємо "Колір теми", якщо обрана Користувацька */
                div[data-name="safe_style_color"].visible {
                    display: block;
                }
            </style>
        `;

        // Додаємо базові стилі
        $('head').append(style);

        // Додаємо новий компонент у меню налаштувань
        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'safe_style',
                name: Lampa.Lang.translate('Safe Style'),
                icon: `
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a9 9 0 0 0 9-9 9 9 0 0 0-.5-3.5M5.6 7.6l4.5 4.5M10.1 7.6l4.5 4.5"/>
                </svg>
                `
            });
        }

        // Функція для оновлення видимості параметра "Колір теми"
        function updateColorVisibility(theme) {
            var colorParam = $('div[data-name="safe_style_color"]');
            if (theme === 'custom_color') {
                colorParam.addClass('visible');
            } else {
                colorParam.removeClass('visible');
            }
        }

        // Додаємо параметри до компонента safe_style
        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addParam({
                component: 'safe_style',
                param: {
                    name: 'safe_style_theme',
                    type: 'select',
                    values: {
                        custom_color: 'Користувацька',
                        default: 'LAMPA'
                    },
                    default: 'custom_color'
                },
                field: {
                    name: Lampa.Lang.translate('Тема'),
                    description: 'Виберіть тему для інтерфейсу'
                },
                onChange: function(value) {
                    SafeStyle.settings.theme = value;
                    Lampa.Storage.set('safe_style_theme', value);
                    Lampa.Settings.update();
                    applyTheme(value);
                    updateColorVisibility(value);
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'safe_style',
                param: {
                    name: 'safe_style_color',
                    type: 'select',
                    values: {
                        '#c22222': 'Червоний',
                        '#b0b0b0': 'Світло-сірий',
                        '#ffeb3b': 'Жовтий',
                        '#4d7cff': 'Синій',
                        '#a64dff': 'Пурпурний',
                        '#ff9f4d': 'Помаранчевий',
                        '#3da18d': 'М’ятний',
                        '#4caf50': 'Зелений',
                        '#ff69b4': 'Рожевий',
                        '#6a1b9a': 'Фіолетовий',
                        '#26a69a': 'Бірюзовий'
                    },
                    default: '#c22222'
                },
                field: {
                    name: Lampa.Lang.translate('Колір теми'),
                    description: 'Виберіть колір для користувацької теми'
                },
                onChange: function(value) {
                    SafeStyle.settings.custom_color = value;
                    Lampa.Storage.set('safe_style_color', value);
                    Lampa.Settings.update();
                    if (SafeStyle.settings.theme === 'custom_color') {
                        applyTheme('custom_color', value);
                    }
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'safe_style',
                param: {
                    name: 'safe_style_button_styles_enabled',
                    type: 'toggle',
                    default: true
                },
                field: {
                    name: Lampa.Lang.translate('Увімкнути стилі кнопок'),
                    description: 'Увімкнути або вимкнути управління стилями кнопок'
                },
                onChange: function(value) {
                    SafeStyle.settings.button_styles_enabled = value;
                    Lampa.Storage.set('safe_style_button_styles_enabled', value);
                    Lampa.Settings.update();
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'safe_style',
                param: {
                    name: 'safe_style_enabled',
                    type: 'toggle',
                    default: true
                },
                field: {
                    name: Lampa.Lang.translate('Увімкнути плагін'),
                    description: 'Увімкнути або вимкнути плагін тем'
                },
                onChange: function(value) {
                    SafeStyle.settings.enabled = value;
                    Lampa.Storage.set('safe_style_enabled', value);
                    Lampa.Settings.update();
                    applyTheme(SafeStyle.settings.theme);
                }
            });
        }

        // Ініціалізація видимості параметра "Колір теми" при відкритті налаштувань
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name === 'safe_style') {
                updateColorVisibility(SafeStyle.settings.theme);
            }
        });
    }

    // Ініціалізація плагіна
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            // Завантажуємо збережені налаштування
            SafeStyle.settings.theme = Lampa.Storage.get('safe_style_theme', 'custom_color');
            SafeStyle.settings.custom_color = Lampa.Storage.get('safe_style_color', '#c22222');
            SafeStyle.settings.enabled = Lampa.Storage.get('safe_style_enabled', true);
            SafeStyle.settings.button_styles_enabled = Lampa.Storage.get('safe_style_button_styles_enabled', true);

            // Застосовуємо шаблони та стилі з затримкою
            setTimeout(function() {
                if (Lampa.SettingsApi) {
                    AddIn();
                    applyTheme(SafeStyle.settings.theme);
                }
            }, 100);
        }
    });
})();
