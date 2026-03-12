(function() {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // ---------- ВАШИ ТЕМЫ (BUILTIN_THEMES) ----------
    const BUILTIN_THEMES = [
        { title: 'Тёмная классика', color: '#111111', css: `body { background-color: #111; color: #eee; } .card { background: #222; border-color: #333; } .focus .card { background: #335; }` },
        { title: 'Светлая тема', color: '#f0f0f0', css: `body { background-color: #f0f0f0; color: #222; } .card { background: #fff; border-color: #ccc; } .focus .card { background: #ddf; }` },
        { title: 'Глубокий океан', color: '#001a33', css: `body { background-color: #000b14; color: #a3d5ff; } .card { background: #001a33; border-color: #003366; } .focus .card { background: #004080; }` },
        { title: 'Зелёный лес', color: '#1a2e1a', css: `body { background-color: #0d140d; color: #bdecbd; } .card { background: #1a2e1a; border-color: #2d4d2d; } .focus .card { background: #3d663d; }` },
        { title: 'Винная полночь', color: '#2b0a0a', css: `body { background-color: #140505; color: #ffb3b3; } .card { background: #2b0a0a; border-color: #4d1414; } .focus .card { background: #661a1a; }` },
        { title: 'Фиолетовый неон', color: '#1a0a2b', css: `body { background-color: #0a0414; color: #e0b3ff; } .card { background: #1a0a2b; border-color: #331452; } .focus .card { background: #4d1f7a; }` },
        { title: 'Матрица', color: '#000000', css: `body { background-color: #000; color: #00ff41; } .card { background: #050505; border-color: #008f11; } .focus .card { background: #003b00; border-color: #00ff41; }` },
        { title: 'Киберпанк', color: '#ffee00', css: `body { background-color: #1a1a00; color: #ffee00; } .card { background: #2b2b00; border-color: #ff0055; } .focus .card { background: #ff0055; color: #000; }` },
        { title: 'Мягкий шоколад', color: '#1f1612', css: `body { background-color: #140e0b; color: #d9c5b2; } .card { background: #1f1612; border-color: #3b2a22; } .focus .card { background: #523a2f; }` },
        { title: 'Арктика', color: '#d1e5e5', css: `body { background-color: #d1e5e5; color: #2c3e50; } .card { background: #eef6f6; border-color: #bdd5d5; } .focus .card { background: #3498db; color: #fff; }` },
        { title: 'Королевское золото', color: '#d4af37', css: `body { background-color: #1a160c; color: #d4af37; } .card { background: #262112; border-color: #594d2a; } .focus .card { background: #8c7942; color: #fff; }` },
        { title: 'Графит', color: '#333333', css: `body { background-color: #222; color: #bbb; } .card { background: #2c2c2c; border-color: #444; } .focus .card { background: #555; }` },
        { title: 'Розовый фламинго', color: '#ff85a2', css: `body { background-color: #2b1018; color: #ffccd5; } .card { background: #4d1d2b; border-color: #ff85a2; } .focus .card { background: #ff85a2; color: #000; }` },
        { title: 'Кофейный микс', color: '#3d2b1f', css: `body { background-color: #1f140d; color: #f5ebe0; } .card { background: #3d2b1f; border-color: #634735; } .focus .card { background: #8e5d3e; }` },
        { title: 'Ядовитый плющ', color: '#004d00', css: `body { background-color: #001a00; color: #00ff00; } .card { background: #002b00; border-color: #004d00; } .focus .card { background: #00ff00; color: #000; }` },
        { title: 'Синее пламя', color: '#0000ff', css: `body { background-color: #00001a; color: #66ccff; } .card { background: #00004d; border-color: #0000ff; } .focus .card { background: #0000ff; color: #fff; }` },
        { title: 'Оранжевый закат', color: '#ff6600', css: `body { background-color: #1a0a00; color: #ffcc99; } .card { background: #4d1f00; border-color: #ff6600; } .focus .card { background: #ff6600; color: #000; }` },
        { title: 'Морская пена', color: '#a3e4d7', css: `body { background-color: #1a2e2b; color: #a3e4d7; } .card { background: #2e4d48; border-color: #48c9b0; } .focus .card { background: #1abc9c; color: #fff; }` },
        { title: 'Баклажан', color: '#4a235a', css: `body { background-color: #1b121e; color: #ebdef0; } .card { background: #4a235a; border-color: #7d3c98; } .focus .card { background: #af7ac5; }` },
        { title: 'Сталь', color: '#566573', css: `body { background-color: #1c2833; color: #d5dbdb; } .card { background: #2c3e50; border-color: #566573; } .focus .card { background: #85929e; }` }
    ];

    // ---------- ФУНКЦИИ ДЛЯ РАБОТЫ С ТЕМАМИ ----------
    function applyTheme(css) {
        // Удаляем предыдущий стиль темы
        $('#max-style-tag').remove();
        if (css) $('<style id="max-style-tag">').html(css).appendTo('head');
    }

    // Загружаем сохранённую тему при старте
    const savedCss = localStorage.getItem('max_theme_data');
    if (savedCss) applyTheme(savedCss);

    // ---------- ГЕНЕРАЦИЯ ИКОНОК (как в рабочем плагине) ----------
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

    // Подготавливаем иконки для каждой темы
    const themeIcons = {};
    BUILTIN_THEMES.forEach((theme, index) => {
        themeIcons[index] = generateIcon(theme.color);
    });

    // ---------- ДОБАВЛЕНИЕ ИКОНКИ В ШАПКУ ----------
    function addThemeIcon() {
        const savedThemeCss = localStorage.getItem('max_theme_data');
        // Находим индекс сохранённой темы, чтобы показать её иконку
        let savedIndex = 0;
        if (savedThemeCss) {
            const found = BUILTIN_THEMES.findIndex(t => t.css === savedThemeCss);
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
            setTimeout(addThemeIcon, 500); // если шапка ещё не загрузилась
            return;
        }

        iconContainer.on('hover:enter', () => openThemeModal(iconContainer.find('.theme-icon')));
    }

    // ---------- МОДАЛЬНОЕ ОКНО ВЫБОРА ТЕМЫ ----------
    function openThemeModal(iconElement) {
        const modalHtml = $('<div class="modal__body" style="padding: 25px; border-radius: 10px;"></div>');
        const title = $('<div style="font-size: 1.7em; font-weight: bold; color: white; text-align: center; margin-bottom: 20px;">Тема MaX</div>');
        const grid = $('<div class="theme-grid" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; max-height: 70vh; overflow-y: auto; padding: 20px;"></div>');

        // Кнопка сброса (стандартный стиль)
        const resetBtn = $(`
            <div class="reset-btn selector" tabindex="0" style="background: rgba(255,0,0,0.2); color: white; border: 1px solid red; border-radius: 8px; padding: 10px 15px; margin-top: 20px; cursor: pointer; text-align: center; transition: background 0.3s;">
                Off (Стандартный стиль 💡)
            </div>
        `);

        resetBtn.on('hover:focus', function() { $(this).addClass('focused'); });
        resetBtn.on('hover:enter', function() {
            // Удаляем тему
            localStorage.removeItem('max_theme_data');
            applyTheme('');
            iconElement.attr('src', generateIcon('#aaaaaa')); // серая иконка по умолчанию
            Lampa.Modal.close();
            setTimeout(() => location.reload(), 300);
        });

        // Добавляем плитки всех тем
        BUILTIN_THEMES.forEach((theme, index) => {
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

    // ---------- СТИЛИ ДЛЯ МОДАЛКИ (как в рабочем плагине) ----------
    const style = document.createElement('style');
    style.textContent = `
        .icon-item.focused {
            outline: 1px solid var(--theme-accent-color, #69ffbd);
            box-shadow: 0 0 12px var(--theme-accent-color, #69ffbd);
            transform: scale(1.1);
        }
        .reset-btn.focused {
            outline: 1px solid red;
            box-shadow: 0 0 12px red;
            transform: scale(1.1);
            z-index: 10;
            position: relative;
        }
        .modal__content {
            background-color: #262829;
            padding: 1.1em;
            border-radius: 1em;
            margin: 0 auto;
            position: relative;
        }
        @media screen and (max-width: 480px) {
            .modal__content {
                width: 100%;
                border-top-left-radius: 2em;
                border-top-right-radius: 2em;
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
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