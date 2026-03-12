(function() {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // ---------- ТЕМЫ (только для навигации) ----------
    const THEMES = [
        { title: 'Тёмная классика', color: '#69ffbd', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #69ffbd !important;
                color: #000 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #69ffbd !important;
            }
        `},
        { title: 'Светлая тема', color: '#f0f0f0', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #f0f0f0 !important;
                color: #222 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #f0f0f0 !important;
            }
        `},
        { title: 'Глубокий океан', color: '#004080', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #004080 !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #004080 !important;
            }
        `},
        { title: 'Зелёный лес', color: '#3d663d', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #3d663d !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #3d663d !important;
            }
        `},
        { title: 'Винная полночь', color: '#661a1a', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #661a1a !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #661a1a !important;
            }
        `},
        { title: 'Фиолетовый неон', color: '#4d1f7a', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #4d1f7a !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #4d1f7a !important;
            }
        `},
        { title: 'Матрица', color: '#00ff41', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #00ff41 !important;
                color: #000 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #00ff41 !important;
            }
        `},
        { title: 'Киберпанк', color: '#ff0055', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #ff0055 !important;
                color: #000 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #ff0055 !important;
            }
        `},
        { title: 'Мягкий шоколад', color: '#523a2f', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #523a2f !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #523a2f !important;
            }
        `},
        { title: 'Арктика', color: '#3498db', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #3498db !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #3498db !important;
            }
        `},
        { title: 'Королевское золото', color: '#d4af37', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #d4af37 !important;
                color: #000 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #d4af37 !important;
            }
        `},
        { title: 'Графит', color: '#555555', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #555 !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #555 !important;
            }
        `},
        { title: 'Розовый фламинго', color: '#ff85a2', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #ff85a2 !important;
                color: #000 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #ff85a2 !important;
            }
        `},
        { title: 'Кофейный микс', color: '#8e5d3e', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #8e5d3e !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #8e5d3e !important;
            }
        `},
        { title: 'Ядовитый плющ', color: '#00ff00', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #00ff00 !important;
                color: #000 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #00ff00 !important;
            }
        `},
        { title: 'Синее пламя', color: '#0000ff', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #0000ff !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #0000ff !important;
            }
        `},
        { title: 'Оранжевый закат', color: '#ff6600', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #ff6600 !important;
                color: #000 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #ff6600 !important;
            }
        `},
        { title: 'Морская пена', color: '#1abc9c', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #1abc9c !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #1abc9c !important;
            }
        `},
        { title: 'Баклажан', color: '#af7ac5', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #af7ac5 !important;
                color: #000 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #af7ac5 !important;
            }
        `},
        { title: 'Сталь', color: '#85929e', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #85929e !important;
                color: #000 !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #85929e !important;
            }
        `},
        // НОВЫЕ ТЕМЫ
        { title: 'Фиолетовый', color: '#8e44ad', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #8e44ad !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #8e44ad !important;
            }
        `},
        { title: 'Красный', color: '#e74c3c', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #e74c3c !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #e74c3c !important;
            }
        `},
        { title: 'Бордовый', color: '#8b0000', css: `
            .menu__item.focus, .head__action.focus, .settings-param.focus,
            .full-start__button.focus, .selectbox-item.focus, .tag-count.focus,
            .settings-folder.focus, .simple-button.focus, .broadcast__device.focus {
                background-color: #8b0000 !important;
                color: #fff !important;
                border-radius: 1em !important;
            }
            .head__action.active::after {
                background: #8b0000 !important;
            }
        `}
    ];

    // ---------- ФУНКЦИИ ----------
    function applyTheme(css) {
        $('#max-style-tag').remove();
        if (css) $('<style id="max-style-tag">').html(css).appendTo('head');
    }

    // Загружаем сохранённую тему
    const savedCss = localStorage.getItem('max_theme_data');
    if (savedCss) applyTheme(savedCss);

    // Генерация иконки (как в рабочем плагине)
    function generateIcon(color) {
        return `data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E
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

    // Иконки для всех тем
    const themeIcons = {};
    THEMES.forEach((theme, index) => {
        themeIcons[index] = generateIcon(theme.color);
    });

    // ---------- ДОБАВЛЕНИЕ ИКОНКИ В ШАПКУ ----------
    function addThemeIcon() {
        const savedCss = localStorage.getItem('max_theme_data');
        let savedIndex = 0;
        if (savedCss) {
            const found = THEMES.findIndex(t => t.css === savedCss);
            if (found !== -1) savedIndex = found;
        }

        const iconContainer = $(`
            <div class="head__action selector open--themes" data-action="apply-theme">
                <img class="theme-icon" src="${themeIcons[savedIndex]}" style="width: 32px; height: 32px; border-radius: 6px;">
            </div>
        `);

        const headActions = $('.head__actions');
        if (headActions.length) {
            headActions.append(iconContainer);
        } else {
            setTimeout(addThemeIcon, 500);
            return;
        }

        iconContainer.on('hover:enter', () => openThemeModal(iconContainer.find('.theme-icon')));
    }

    // ---------- МОДАЛЬНОЕ ОКНО ----------
    function openThemeModal(iconElement) {
        const modalHtml = $('<div class="modal__body" style="padding: 25px; border-radius: 10px;"></div>');
        const title = $('<div style="font-size: 1.7em; font-weight: bold; color: white; text-align: center; margin-bottom: 20px;">Тема MaX</div>');
        const grid = $('<div class="theme-grid" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; max-height: 70vh; overflow-y: auto; padding: 20px;"></div>');

        // Кнопка сброса (стандартный стиль)
        const resetBtn = $(`
            <div class="reset-btn selector" tabindex="0" style="background: rgba(255,0,0,0.2); color: white; border: 1px solid red; border-radius: 8px; padding: 10px 15px; margin-top: 20px; cursor: pointer; text-align: center;">
                Off (Стандартный стиль 💡)
            </div>
        `);

        resetBtn.on('hover:focus', function() { $(this).addClass('focused'); });
        resetBtn.on('hover:enter', function() {
            localStorage.removeItem('max_theme_data');
            applyTheme('');
            iconElement.attr('src', generateIcon('#aaaaaa'));
            Lampa.Modal.close();
            setTimeout(() => location.reload(), 300);
        });

        // Плитки тем
        THEMES.forEach((theme, index) => {
            const item = $(`
                <div class="icon-item selector" style="padding: 5px; border-radius: 10px; transition: all 0.2s;">
                    <img src="${themeIcons[index]}" style="width: 60px; height: 60px; border-radius: 8px; cursor: pointer;">
                    <div style="color: lightgray; text-align: center; margin-top: 5px; max-width: 80px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${theme.title}</div>
                </div>
            `);

            item.on('hover:focus', function() {
                $('.icon-item').removeClass('focused');
                $(this).addClass('focused');
            });

            item.on('hover:enter', function() {
                localStorage.setItem('max_theme_data', theme.css);
                applyTheme(theme.css);
                iconElement.attr('src', themeIcons[index]);
                Lampa.Modal.close();
                setTimeout(() => location.reload(), 300);
            });

            grid.append(item);
        });

        modalHtml.append(title, grid, resetBtn);

        Lampa.Modal.open({
            title: '',
            html: modalHtml,
            size: 'middle',
            position: 'center',
            onBack: () => {
                Lampa.Modal.close();
                Lampa.Controller.toggle('content');
            }
        });
    }

    // ---------- СТИЛИ ДЛЯ МОДАЛКИ ----------
    const style = document.createElement('style');
    style.textContent = `
        .icon-item.focused {
            outline: 2px solid #69ffbd;
            box-shadow: 0 0 12px #69ffbd;
            transform: scale(1.1);
        }
        .reset-btn.focused {
            outline: 2px solid red;
            box-shadow: 0 0 12px red;
            transform: scale(1.1);
        }
        .modal__content {
            background-color: #262829;
            padding: 1.1em;
            border-radius: 1em;
        }
        @media screen and (max-width: 480px) {
            .modal__content {
                width: 100%;
                border-top-left-radius: 2em;
                border-top-right-radius: 2em;
                position: fixed;
                left: 0;
                bottom: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ---------- ЗАПУСК ----------
    if (window.appready) {
        addThemeIcon();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                addThemeIcon();
            }
        });
    }
})();