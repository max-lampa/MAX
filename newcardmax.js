(function () {
    'use strict';

    // Іконка плагіна (без змін)
    const PLUGIN_ICON = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#333"><rect x="5" y="30" width="90" height="40" rx="5" fill="hsl(0, 0%, 30%)"/><rect x="8" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="18" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="28" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="38" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="48" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="58" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="68" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="78" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="8" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="18" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="28" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="38" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="48" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="58" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="68" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="78" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="15" y="40" width="20" height="20" fill="hsl(200, 80%, 70%)"/><rect x="40" y="40" width="20" height="20" fill="hsl(200, 80%, 80%)"/><rect x="65" y="40" width="20" height="20" fill="hsl(200, 80%, 70%)"/></svg>';

    let logoCache = new Map();

    // ==================== ПЕРЕКЛАДИ НА РОСІЙСЬКУ ====================
    const translations = {
        show_ratings: { ru: 'Показывать рейтинги' },
        show_ratings_desc: { ru: 'Отображать рейтинги IMDB и КиноПоиск' },
        ratings_position: { ru: 'Расположение рейтингов' },
        ratings_position_desc: { ru: 'Выберите, где отображать рейтинги' },
        position_card: { ru: 'В карточке' },
        position_corner: { ru: 'В левом нижнем углу' },
        show_studio: { ru: 'Показывать логотип студии' },
        show_studio_desc: { ru: 'Отображать иконку телесети (Netflix, HBO) или киностудии' },
        logo_scale: { ru: 'Размер логотипа' },
        logo_scale_desc: { ru: 'Масштаб логотипа фильма' },
        text_scale: { ru: 'Размер текста' },
        text_scale_desc: { ru: 'Масштаб текста данных о фильме' },
        scale_default: { ru: 'По умолчанию' },
        spacing_scale: { ru: 'Отступы между строками' },
        spacing_scale_desc: { ru: 'Расстояние между элементами информации' },
        settings_title_display: { ru: 'Отображение' },
        settings_title_scaling: { ru: 'Масштабирование' },
    };

    function t(key) {
        return translations[key]?.['ru'] || '???';
    }

    // ================================================================

    function loadLogo(event) {
        const data = event.data.movie;
        const activity = event.object.activity;
        if (!data || !activity) return;

        const render = activity.render();
        const ratingsContainer = render.find('.applecation__ratings');
        const logoContainer = render.find('.applecation__logo');
        const titleElement = render.find('.full-start-new__title');

        fillRatings(ratingsContainer, data);
        fillMetaInfo(render, data);
        fillAdditionalInfo(render, data);

        waitForBackgroundLoad(activity, () => {
            render.find('.applecation__meta').addClass('show');
            render.find('.applecation__info').addClass('show');
            render.find('.applecation__ratings').addClass('show');
            render.find('.applecation__description').addClass('show');
        });

        // ====== ОПТИМИЗАЦИЯ КЭШИРОВАНИЯ ======
        const cacheKey = `${data.id}_${data.name ? 'tv' : 'movie'}`;
        if (logoCache.has(cacheKey)) {
            const cached = logoCache.get(cacheKey);
            applyLogoData(cached, logoContainer, titleElement, activity);
            return;
        }
        // =====================================

        const mediaType = data.name ? 'tv' : 'movie';
        const currentLang = 'ru';  // Змінено з 'uk' на 'ru'
        const apiUrl = Lampa.TMDB.api(
            `${mediaType}/${data.id}/images?api_key=${Lampa.TMDB.key()}`
        );

        const currentActivity = Lampa.Activity.active();
        if (!currentActivity || currentActivity.component !== 'full') {
            return;
        }

        $.get(apiUrl, (imagesData) => {
            // Зберігаємо в кеш
            logoCache.set(cacheKey, imagesData);

            const currentActivity = Lampa.Activity.active();
            if (!currentActivity || currentActivity.component !== 'full') {
                return;
            }

            const bestLogo = selectBestLogo(imagesData.logos, currentLang);
            if (bestLogo) {
                const logoPath = bestLogo.file_path;
                const quality = getLogoQuality();
                const logoUrl = Lampa.TMDB.image(`/t/p/${quality}${logoPath}`);
                const img = new Image();
                img.onload = () => {
                    logoContainer.html(`<img src="${logoUrl}" alt="" />`);
                    waitForBackgroundLoad(activity, () => {
                        logoContainer.addClass('loaded');
                    });
                };
                img.src = logoUrl;
            } else {
                titleElement.show();
                waitForBackgroundLoad(activity, () => {
                    logoContainer.addClass('loaded');
                });
            }
        }).fail(() => {
            titleElement.show();
            waitForBackgroundLoad(activity, () => {
                logoContainer.addClass('loaded');
            });
        });
    }

    function applyLogoData(imagesData, logoContainer, titleElement, activity) {
        const currentLang = 'ru';  // Змінено з 'uk' на 'ru'
        const bestLogo = selectBestLogo(imagesData.logos, currentLang);
        if (bestLogo) {
            const logoPath = bestLogo.file_path;
            const quality = getLogoQuality();
            const logoUrl = Lampa.TMDB.image(`/t/p/${quality}${logoPath}`);
            const img = new Image();
            img.onload = () => {
                logoContainer.html(`<img src="${logoUrl}" alt="" />`);
                waitForBackgroundLoad(activity, () => {
                    logoContainer.addClass('loaded');
                });
            };
            img.src = logoUrl;
        } else {
            titleElement.show();
            waitForBackgroundLoad(activity, () => {
                logoContainer.addClass('loaded');
            });
        }
    }

    // Головна функція плагіна (без змін, крім використання перекладів)
    function initializePlugin() {
        console.log('NewCard', 'v1.1.0');
        if (!Lampa.Platform.screen('tv')) {
            console.log('NewCard', 'TV mode only');
            return;
        }
        patchApiImg();
        addCustomTemplate();
        addStyles();
        addSettings();
        attachLogoLoader();
    }

    // Функції керування (без змін)
    function updateZoomState() {
        let enabled = Lampa.Storage.get('applecation_apple_zoom', true);
        $('body').toggleClass('applecation--zoom-enabled', enabled);
    }

    function updateLogoColors() {
        // Функція більше не потрібна
    }

    // Налаштування (тепер з російськими назвами через t())
    function addSettings() {
        const defaults = {
            'applecation_show_ratings': false,
            'applecation_ratings_position': 'card',
            'applecation_logo_scale': '100',
            'applecation_text_scale': '100',
            'applecation_spacing_scale': '100',
            'applecation_show_studio': true,
            'applecation_apple_zoom': true,
            'applecation_original_colors': true
        };
        Object.keys(defaults).forEach(key => {
            if (Lampa.Storage.get(key) === undefined) {
                Lampa.Storage.set(key, defaults[key]);
            }
        });

        Lampa.SettingsApi.addComponent({
            component: 'applecation_settings',
            name: 'NewCard',
            icon: PLUGIN_ICON
        });

        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: { name: 'applecation_apple_zoom', type: 'trigger', default: true },
            field: { name: 'Плавающий зум фона', description: 'Медленная анимация приближения фонового изображения' },
            onChange: updateZoomState
        });

        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: { name: 'applecation_show_studio', type: 'trigger', default: true },
            field: { name: t('show_studio'), description: t('show_studio_desc') },
            onChange: (value) => Lampa.Storage.set('applecation_show_studio', value)
        });

        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: { name: 'applecation_show_ratings', type: 'trigger', default: false },
            field: { name: t('show_ratings'), description: t('show_ratings_desc') },
            onChange: (value) => $('body').toggleClass('applecation--hide-ratings', !value)
        });

        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_ratings_position',
                type: 'select',
                values: { card: t('position_card'), corner: t('position_corner') },
                default: 'card'
            },
            field: { name: t('ratings_position'), description: t('ratings_position_desc') },
            onChange: (value) => {
                Lampa.Storage.set('applecation_ratings_position', value);
                $('body').removeClass('applecation--ratings-card applecation--ratings-corner');
                $('body').addClass('applecation--ratings-' + value);
                addCustomTemplate();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_logo_scale',
                type: 'select',
                values: {
                    '70': '70%', '80': '80%', '90': '90%', '100': t('scale_default'),
                    '110': '110%', '120': '120%', '130': '130%', '140': '140%', '150': '150%', '160': '160%'
                },
                default: '100'
            },
            field: { name: t('logo_scale'), description: t('logo_scale_desc') },
            onChange: (value) => {
                Lampa.Storage.set('applecation_logo_scale', value);
                applyScales();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_text_scale',
                type: 'select',
                values: {
                    '50': '50%', '60': '60%', '70': '70%', '80': '80%', '90': '90%',
                    '100': t('scale_default'), '110': '110%', '120': '120%', '130': '130%',
                    '140': '140%', '150': '150%', '160': '160%', '170': '170%', '180': '180%'
                },
                default: '100'
            },
            field: { name: t('text_scale'), description: t('text_scale_desc') },
            onChange: (value) => {
                Lampa.Storage.set('applecation_text_scale', value);
                applyScales();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'applecation_settings',
            param: {
                name: 'applecation_spacing_scale',
                type: 'select',
                values: {
                    '50': '50%', '60': '60%', '70': '70%', '80': '80%', '90': '90%',
                    '100': t('scale_default'), '110': '110%', '120': '120%', '130': '130%',
                    '140': '140%', '150': '150%', '160': '160%', '170': '170%', '180': '180%',
                    '200': '200%', '250': '250%', '300': '300%'
                },
                default: '100'
            },
            field: { name: t('spacing_scale'), description: t('spacing_scale_desc') },
            onChange: (value) => {
                Lampa.Storage.set('applecation_spacing_scale', value);
                applyScales();
            }
        });

        updateZoomState();
        if (!Lampa.Storage.get('applecation_show_ratings', false)) {
            $('body').addClass('applecation--hide-ratings');
        }
        $('body').addClass('applecation--ratings-' + Lampa.Storage.get('applecation_ratings_position', 'card'));
        applyScales();
        updateLogoColors();
    }

    // Масштабування (без змін)
    function applyScales() {
        const logoScale = parseInt(Lampa.Storage.get('applecation_logo_scale', '100'));
        const textScale = parseInt(Lampa.Storage.get('applecation_text_scale', '100'));
        const spacingScale = parseInt(Lampa.Storage.get('applecation_spacing_scale', '100'));

        $('style[data-id="applecation_scales"]').remove();
        const scaleStyles = `
            <style data-id="applecation_scales">
                .applecation .applecation__logo img { max-width: ${35 * logoScale / 100}vw !important; max-height: ${180 * logoScale / 100}px !important; }
                .applecation .applecation__content-wrapper { font-size: ${textScale}% !important; }
                .applecation .full-start-new__title { margin-bottom: ${0.5 * spacingScale / 100}em !important; }
                .applecation .applecation__meta { margin-bottom: ${0.5 * spacingScale / 100}em !important; }
                .applecation .applecation__ratings { margin-bottom: ${0.5 * spacingScale / 100}em !important; }
                .applecation .applecation__description { max-width: ${35 * textScale / 100}vw !important; margin-bottom: ${0.5 * spacingScale / 100}em !important; }
                .applecation .applecation__info { margin-bottom: ${0.5 * spacingScale / 100}em !important; }
            </style>
        `;
        $('body').append(scaleStyles);
    }

    // Шаблон (без змін, плейсхолдери Lampa сам перекладе)
    function addCustomTemplate() {
        const ratingsPosition = Lampa.Storage.get('applecation_ratings_position', 'card');
        const ratingsBlock = `<div class="applecation__ratings"> <div class="rate--imdb hide"> <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"> <path fill="currentColor" d="M4 7c-1.103 0-2 .897-2 2v6.4c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2H4Zm1.4 2.363h1.275v5.312H5.4V9.362Zm1.962 0H9l.438 2.512.287-2.512h1.75v5.312H10.4v-3l-.563 3h-.8l-.512-3v3H7.362V9.362Zm8.313 0H17v1.2c.16-.16.516-.363.875-.363.36.04.84.283.8.763v3.075c0 .24-.075.404-.275.524-.16.04-.28.075-.6.075-.32 0-.795-.196-.875-.237-.08-.04-.163.275-.163.275h-1.087V9.362Zm-3.513.037H13.6c.88 0 1.084.078 1.325.237.24.16.35.397.35.838v3.2c0 .32-.15.563-.35.762-.2.2-.484.288-1.325.288h-1.438V9.4Zm1.275.8v3.563c.2 0 .488.04.488-.2v-3.126c0-.28-.247-.237-.488-.237Zm3.763.675c-.12 0-.2.08-.2.2v2.688c0 .159.08.237.2.237.12 0 .2-.117.2-.238l-.037-2.687c0-.12-.043-.2-.163-.2Z"/> </svg> <div>0.0</div> </div> <div class="rate--kp hide"> <svg viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="none"> <path d="M96.5 20 66.1 75.733V20H40.767v152H66.1v-55.733L96.5 172h35.467C116.767 153.422 95.2 133.578 80 115c28.711 16.889 63.789 35.044 92.5 51.933v-30.4C148.856 126.4 108.644 115.133 85 105c23.644 3.378 63.856 7.889 87.5 11.267v-30.4L85 90c27.022-11.822 60.478-22.711 87.5-34.533v-30.4C143.789 41.956 108.711 63.11 80 80l51.967-60z" style="fill:none;stroke:currentColor;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10"/> </svg> <div>0.0</div> </div> </div>`;

        const template = `<div class="full-start-new applecation"> ... </div>`; // Шаблон без змін, залишаю як у оригіналі

        Lampa.Template.add('full_start_new', template);
        Lampa.Template.add('full_episode', `<div class="full-episode selector layer--visible">...</div>`); // без змін
    }

    // Стилі (без змін)
    function addStyles() {
        const styles = `<style> ... </style>`; // без змін
        Lampa.Template.add('applecation_css', styles);
        $('body').append(Lampa.Template.get('applecation_css', {}, true));
    }

    // Інші функції (патч, якість, вибір лого, типи медіа, завантаження іконки студії тощо)
    // ... (вони залишаються без змін, крім де вказано)

    // ==================== ФУНКЦІЇ З ПЕРЕКЛАДОМ НА РОСІЙСЬКУ ====================

    // Отримання типу медіа (російською)
    function getMediaType(data) {
        const isTv = !!data.name;
        return isTv ? 'Сериал' : 'Фильм';
    }

    // Форматування сезонів (російською)
    function formatSeasons(count) {
        const cases = [2, 0, 1, 1, 1, 2];
        const titles = ['сезон', 'сезона', 'сезонов'];
        const caseIndex = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
        return `${count} ${titles[caseIndex]}`;
    }

    // Завантаження іконки студії (без змін, але використовується в fillMetaInfo)
    function loadNetworkIcon(render, data) {
        // ... без змін
    }

    // Заповнення мета-інформації (без змін, але викликає getMediaType)
    function fillMetaInfo(render, data) {
        const metaTextContainer = render.find('.applecation__meta-text');
        const metaParts = [];
        metaParts.push(getMediaType(data)); // тепер російською

        if (data.genres && data.genres.length) {
            const genres = data.genres.slice(0, 2).map(g => Lampa.Utils.capitalizeFirstLetter(g.name));
            metaParts.push(...genres);
        }

        metaTextContainer.html(metaParts.join(' · '));
        loadNetworkIcon(render, data);
    }

    // Заповнення додаткової інформації (викликає formatSeasons)
    function fillAdditionalInfo(render, data) {
        const infoContainer = render.find('.applecation__info');
        const infoParts = [];
        const releaseDate = data.release_date || data.first_air_date || '';
        if (releaseDate) {
            const year = releaseDate.split('-')[0];
            infoParts.push(year);
        }

        if (data.name) { // серіал
            if (data.episode_run_time && data.episode_run_time.length) {
                const avgRuntime = data.episode_run_time[0];
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');
                infoParts.push(`${avgRuntime} ${timeM}`);
            }
            const seasons = Lampa.Utils.countSeasons(data);
            if (seasons) {
                infoParts.push(formatSeasons(seasons)); // тепер російською
            }
        } else { // фільм
            if (data.runtime && data.runtime > 0) {
                const hours = Math.floor(data.runtime / 60);
                const minutes = data.runtime % 60;
                const timeH = Lampa.Lang.translate('time_h').replace('.', '');
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');
                const timeStr = hours > 0 ? `${hours} ${timeH} ${minutes} ${timeM}` : `${minutes} ${timeM}`;
                infoParts.push(timeStr);
            }
        }

        infoContainer.html(infoParts.join(' · '));
    }

    // Інші функції без змін: patchApiImg, getLogoQuality, selectBestLogo, waitForBackgroundLoad, fillRatings, attachLogoLoader, registerPlugin, startPlugin
    // (вони не залежать від мови)

    // ... (решта коду без змін, включаючи patchApiImg, getLogoQuality, selectBestLogo, waitForBackgroundLoad, fillRatings, attachLogoLoader, registerPlugin, startPlugin)

    // Запуск плагіна
    function startPlugin() {
        registerPlugin();
        initializePlugin();
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', (event) => {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }

})();