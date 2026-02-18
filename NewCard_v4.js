(function () {  
    'use strict';  
  
    // Іконка плагіна  
    const PLUGIN_ICON = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="#333"><rect x="5" y="30" width="90" height="40" rx="5" fill="hsl(0, 0%, 30%)"/><rect x="8" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="18" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="28" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="38" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="48" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="58" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="68" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="78" y="33" width="6" height="6" fill="#1E1E1E"/><rect x="8" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="18" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="28" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="38" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="48" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="58" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="68" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="78" y="61" width="6" height="6" fill="#1E1E1E"/><rect x="15" y="40" width="20" height="20" fill="hsl(200, 80%, 70%)"/><rect x="40" y="40" width="20" height="20" fill="hsl(200, 80%, 80%)"/><rect x="65" y="40" width="20" height="20" fill="hsl(200, 80%, 70%)"/></svg>';  

    let logoCache = new Map();  
  
function loadLogo(event) {  
    const data = event.data.movie;  
    const activity = event.object.activity;  
    if (!data || !activity) return;  
  
    // Кешуємо рендер та контейнери  
    const render = activity.render();  
    const ratingsContainer = render.find('.applecation__ratings');  
    const logoContainer = render.find('.applecation__logo');  
    const titleElement = render.find('.full-start-new__title');  
  
    // Викликаємо функції з кешованими контейнерами  
    fillRatings(ratingsContainer, data);  
    fillMetaInfo(render, data);  
    fillAdditionalInfo(render, data);  
  
    waitForBackgroundLoad(activity, () => {  
        render.find('.applecation__meta').addClass('show');  
        render.find('.applecation__info').addClass('show');  
        render.find('.applecation__ratings').addClass('show');  
        render.find('.applecation__description').addClass('show');  
    });  
  
    // ====== ОПТИМІЗАЦІЯ КАШУВАННЯ ======  
    const cacheKey = `${data.id}_${data.name ? 'tv' : 'movie'}`;  
      
    if (logoCache.has(cacheKey)) {  
        const cached = logoCache.get(cacheKey);  
        applyLogoData(cached, logoContainer, titleElement, activity);  
        return;  
    }  
    // =====================================  
  
    const mediaType = data.name ? 'tv' : 'movie';  
    const currentLang = 'uk';  
      
    const apiUrl = Lampa.TMDB.api(  
        `${mediaType}/${data.id}/images?api_key=${Lampa.TMDB.key()}`  
    );  
  
    const currentActivity = Lampa.Activity.active();  
    if (!currentActivity || currentActivity.component !== 'full') {  
        return;  
    }  
  
    $.get(apiUrl, (imagesData) => {  
        // ЗБЕРЕГТИ В КАШ  
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
    const currentLang = 'uk';  
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
    // Головна функція плагіна  
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
  
    // Переклади  
    const translations = {  
        show_ratings: { uk: 'Показувати рейтинги' },  
        show_ratings_desc: { uk: 'Відображати рейтинги IMDB та КіноПошук' },  
        ratings_position: { uk: 'Розташування рейтингів' },  
        ratings_position_desc: { uk: 'Виберіть де відображати рейтинги' },  
        position_card: { uk: 'У картці' },  
        position_corner: { uk: 'У лівому нижньому куті' },  
        show_studio: { uk: 'Показувати логотип студії' },  
        show_studio_desc: { uk: 'Відображати іконку телемережі (Netflix, HBO) або кіностудії' },  
        logo_scale: { uk: 'Розмір логотипу' },  
        logo_scale_desc: { uk: 'Масштаб логотипу фільму' },  
        text_scale: { uk: 'Розмір тексту' },  
        text_scale_desc: { uk: 'Масштаб тексту даних про фільм' },  
        scale_default: { uk: 'За замовчуванням' },  
        spacing_scale: { uk: 'Відступи між рядками' },  
        spacing_scale_desc: { uk: 'Відстань між елементами інформації' },  
        settings_title_display: { uk: 'Відображення' },  
        settings_title_scaling: { uk: 'Масштабування' },  
    };  
  
    function t(key) {  
        return translations[key]?.['uk'] || '???';  
    }  
  
    // Функції керування  
    function updateZoomState() {  
        let enabled = Lampa.Storage.get('applecation_apple_zoom', true);  
        $('body').toggleClass('applecation--zoom-enabled', enabled);     
    }  
  
    function updateLogoColors() {  
    // Функція більше не потрібна, оскільки колір визначається автоматично  
    // Залишаємо для сумісності, але вона нічого не робить  
}
  
    // Налаштування  
    function addSettings() {  
        // Ініціалізація значень за замовчуванням  
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
  
        // Плаваючий зум фону  
        Lampa.SettingsApi.addParam({  
            component: 'applecation_settings',  
            param: { name: 'applecation_apple_zoom', type: 'trigger', default: true },  
            field: { name: 'Плаваючий зум фону', description: 'Повільна анімація наближення фонового зображення' },  
            onChange: updateZoomState  
        });  
  
        // Логотипи студій  
        Lampa.SettingsApi.addParam({  
            component: 'applecation_settings',  
            param: { name: 'applecation_show_studio', type: 'trigger', default: true },  
            field: { name: 'Показувати логотип студії', description: 'Відображати іконку Netflix, HBO, Disney тощо у мета-даних' },  
            onChange: (value) => Lampa.Storage.set('applecation_show_studio', value)  
        });  
  
                // Показувати рейтинги  
        Lampa.SettingsApi.addParam({  
            component: 'applecation_settings',  
            param: { name: 'applecation_show_ratings', type: 'trigger', default: false },  
            field: { name: t('show_ratings'), description: t('show_ratings_desc') },  
            onChange: (value) => $('body').toggleClass('applecation--hide-ratings', !value)  
        });  
  
        // Розташування рейтингів  
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
  
        // Розмір логотипа  
        Lampa.SettingsApi.addParam({  
            component: 'applecation_settings',  
            param: {  
                name: 'applecation_logo_scale',  
                type: 'select',  
                values: {  
                    '70': '70%', '80': '80%', '90': '90%', '100': t('scale_default'),  
                    '110': '110%', '120': '120%', '130': '130%', '140': '140%',  
                    '150': '150%', '160': '160%'  
                },  
                default: '100'  
            },  
            field: { name: t('logo_scale'), description: t('logo_scale_desc') },  
            onChange: (value) => {  
                Lampa.Storage.set('applecation_logo_scale', value);  
                applyScales();  
            }  
        });  
  
        // Розмір тексту  
        Lampa.SettingsApi.addParam({  
            component: 'applecation_settings',  
            param: {  
                name: 'applecation_text_scale',  
                type: 'select',  
                values: {  
                    '50':'50%','60':'60%','70':'70%','80':'80%','90':'90%',  
                    '100':t('scale_default'),'110':'110%','120':'120%','130':'130%',  
                    '140':'140%','150':'150%','160':'160%','170':'170%','180':'180%'  
                },  
                default: '100'  
            },  
            field: { name: t('text_scale'), description: t('text_scale_desc') },  
            onChange: (value) => {  
                Lampa.Storage.set('applecation_text_scale', value);  
                applyScales();  
            }  
        });  
  
        // Відступи  
        Lampa.SettingsApi.addParam({  
            component: 'applecation_settings',  
            param: {  
                name: 'applecation_spacing_scale',  
                type: 'select',  
                values: {  
                    '50':'50%','60':'60%','70':'70%','80':'80%','90':'90%',  
                    '100':t('scale_default'),'110':'110%','120':'120%','130':'130%',  
                    '140':'140%','150':'150%','160':'160%','170':'170%','180':'180%',  
                    '200':'200%','250':'250%','300':'300%'  
                },  
                default: '100'  
            },  
            field: { name: t('spacing_scale'), description: t('spacing_scale_desc') },  
            onChange: (value) => {  
                Lampa.Storage.set('applecation_spacing_scale', value);  
                applyScales();  
            }  
        });  
          
        // Запуск перевірок при старті  
        updateZoomState();  
        if (!Lampa.Storage.get('applecation_show_ratings', false)) {  
            $('body').addClass('applecation--hide-ratings');  
        }  
        $('body').addClass('applecation--ratings-' + Lampa.Storage.get('applecation_ratings_position', 'card'));  
        applyScales();  
        updateLogoColors();  
    }  
  
    // Масштабування  
    function applyScales() {  
        const logoScale = parseInt(Lampa.Storage.get('applecation_logo_scale', '100'));  
        const textScale = parseInt(Lampa.Storage.get('applecation_text_scale', '100'));  
        const spacingScale = parseInt(Lampa.Storage.get('applecation_spacing_scale', '100'));  
  
        $('style[data-id="applecation_scales"]').remove();  
  
        const scaleStyles = `  
            <style data-id="applecation_scales">  
                .applecation .applecation__logo img {  
                    max-width: ${35 * logoScale / 100}vw !important;  
                    max-height: ${180 * logoScale / 100}px !important;  
                }  
                .applecation .applecation__content-wrapper {  
                    font-size: ${textScale}% !important;  
                }  
                .applecation .full-start-new__title {  
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;  
                }  
                .applecation .applecation__meta {  
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;  
                }  
                .applecation .applecation__ratings {  
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;  
                }  
                .applecation .applecation__description {  
                    max-width: ${35 * textScale / 100}vw !important;  
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;  
                }  
                .applecation .applecation__info {  
                    margin-bottom: ${0.5 * spacingScale / 100}em !important;  
                }  
            </style>  
        `;  
        $('body').append(scaleStyles);  
    }  
  
    // Шаблон  
    function addCustomTemplate() {  
        const ratingsPosition = Lampa.Storage.get('applecation_ratings_position', 'card');  
          
        const ratingsBlock = `<div class="applecation__ratings">  
                        <div class="rate--imdb hide">  
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">  
                                <path fill="currentColor" d="M4 7c-1.103 0-2 .897-2 2v6.4c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2H4Zm1.4 2.363h1.275v5.312H5.4V9.362Zm1.962 0H9l.438 2.512.287-2.512h1.75v5.312H10.4v-3l-.563 3h-.8l-.512-3v3H7.362V9.362Zm8.313 0H17v1.2c.16-.16.516-.363.875-.363.36.04.84.283.8.763v3.075c0 .24-.075.404-.275.524-.16.04-.28.075-.6.075-.32 0-.795-.196-.875-.237-.08-.04-.163.275-.163.275h-1.087V9.362Zm-3.513.037H13.6c.88 0 1.084.078 1.325.237.24.16.35.397.35.838v3.2c0 .32-.15.563-.35.762-.2.2-.484.288-1.325.288h-1.438V9.4Zm1.275.8v3.563c.2 0 .488.04.488-.2v-3.126c0-.28-.247-.237-.488-.237Zm3.763.675c-.12 0-.2.08-.2.2v2.688c0 .159.08.237.2.237.12 0 .2-.117.2-.238l-.037-2.687c0-.12-.043-.2-.163-.2Z"/>  
                            </svg>  
                            <div>0.0</div>  
                        </div>  
  <div class="rate--kp hide">  
                            <svg viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="none">  
                                <path d="M96.5 20 66.1 75.733V20H40.767v152H66.1v-55.733L96.5 172h35.467C116.767 153.422 95.2 133.578 80 115c28.711 16.889 63.789 35.044 92.5 51.933v-30.4C148.856 126.4 108.644 115.133 85 105c23.644 3.378 63.856 7.889 87.5 11.267v-30.4L85 90c27.022-11.822 60.478-22.711 87.5-34.533v-30.4C143.789 41.956 108.711 63.11 80 80l51.967-60z" style="fill:none;stroke:currentColor;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10"/>  
                            </svg>  
                            <div>0.0</div>  
                        </div>  
                    </div>`;  
  
        const template = `<div class="full-start-new applecation">  
        <div class="full-start-new__body">  
            <div class="full-start-new__left hide">  
                <div class="full-start-new__poster">  
                    <img class="full-start-new__img full--poster" />  
                </div>  
            </div>  
  
            <div class="full-start-new__right">  
                <div class="applecation__left">  
                    <div class="applecation__logo"></div>  
                        
                    <div class="applecation__content-wrapper">  
                        <div class="full-start-new__title" style="display: none;">{title}</div>  
                            
                        <div class="applecation__meta">  
                            <div class="applecation__meta-left">  
                                <span class="applecation__network"></span>  
                                <span class="applecation__meta-text"></span>  
                                <div class="full-start__pg hide"></div>  
                            </div>  
                        </div>  
                            
                        ${ratingsPosition === 'card' ? ratingsBlock : ''}  
                            
                        <div class="applecation__description-wrapper">  
                            <div class="applecation__description"></div>  
                        </div>  
                        <div class="applecation__info"></div>  
                    </div>  
                        
                    <div class="full-start-new__head" style="display: none;"></div>  
                    <div class="full-start-new__details" style="display: none;"></div>  
  
                    <div class="full-start-new__buttons">  
                        <div class="full-start__button selector button--play">  
                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>  
                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>  
                            </svg>  
                            <span>#{title_watch}</span>  
                        </div>  
  
                        <div class="full-start__button selector button--book">  
                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>  
                            </svg>  
                            <span>#{settings_input_links}</span>  
                        </div>  
  
                        <div class="full-start__button selector button--reaction">  
                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3165 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>  
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
  
                <div class="applecation__right">  
                    <div class="full-start-new__reactions selector">  
                        <div>#{reactions_none}</div>  
                    </div>  
                        
                    ${ratingsPosition === 'corner' ? ratingsBlock : ''}  
  
                    <div class="full-start-new__rate-line">  
                        <div class="full-start__status hide"></div>  
                    </div>  
                        
                    <div class="rating--modss" style="display: none;"></div>  
                </div>  
            </div>  
        </div>  
  
        <div class="hide buttons--container">  
            <div class="full-start__button view--torrent hide">  
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">  
        <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>  
    </svg>  
    <span>#{full_torrents}</span>  
</div> 
  
            <div class="full-start__button selector view--trailer">  
    <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">  
        <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/>  
    </svg>  
    <span>#{full_trailers}</span>  
</div>  
        </div>  
    </div>`;  
  
        Lampa.Template.add('full_start_new', template);  
  
        // Шаблон епізода  
        const episodeTemplate = `<div class="full-episode selector layer--visible">  
            <div class="full-episode__img">  
                <img />  
                <div class="full-episode__time">{time}</div>  
            </div>  
            <div class="full-episode__body">  
                <div class="full-episode__num">#{full_episode} {num}</div>  
                <div class="full-episode__name">{name}</div>  
                <div class="full-episode__overview">{overview}</div>  
                <div class="full-episode__date">{date}</div>  
            </div>  
        </div>`;  
          
        Lampa.Template.add('full_episode', episodeTemplate);  
    }  
  
    // Стилі з оптимізаціями  
    function addStyles() {  
        const styles = `<style>  
/* Основний контейнер */  
.applecation {  
    transition: all .3s;  
}  
  
.applecation .full-start-new__body {  
    height: 80vh;  
}  
  
.applecation .full-start-new__right {  
    display: flex;  
    align-items: flex-end;  
}  
  
.applecation .full-start-new__title {  
    font-size: 2.5em;  
    font-weight: 700;  
    line-height: 1.2;  
    margin-bottom: 0.5em;  
    text-shadow: 0 0 .1em rgba(0, 0, 0, 0.3);  
}  
  
/* Логотип з GPU прискоренням */  
.applecation__logo {  
    margin-bottom: 0.5em;  
    opacity: 0;  
    transform: translateY(20px);  
    transition: transform 0.4s ease-out;  
    will-change: transform;   
}  
  
.applecation__logo.loaded {  
    opacity: 1;  
    transform: translateY(0);  
}  
  
.applecation__logo img {  
    display: block;  
    max-width: 35vw;  
    width: auto;  
    height: auto;  
    object-fit: contain;  
    object-position: left center;  
    max-height: 180px;  
}  
  
/* Мета інформація */  
.applecation__meta {  
    display: flex;  
    align-items: center;  
    color: #fff;  
    font-size: 1.1em;  
    margin-bottom: 0.5em;  
    line-height: 1;  
    opacity: 0;  
    transform: translateY(15px);  
transition: opacity 0.3s ease-out;  
    will-change: opacity;
}  
  
.applecation__meta.show {  
    opacity: 1;  
    transform: translateY(0);  
}  
  
.applecation__meta-left {  
    display: flex;  
    align-items: center;  
    line-height: 1;  
}  
  
.applecation__network {  
    display: inline-flex;  
    align-items: center;  
    gap: 0.5em;  
    line-height: 1;  
}  
  
.applecation__network img {  
    display: block;  
    max-height: 1.4em;  
    width: auto;  
    object-fit: contain;  
    transition: filter 0.3s ease;  
} 
  
.applecation__meta-text {  
    margin-left: 1em;  
    line-height: 1;  
}  
  
.applecation__meta .full-start__pg {  
    margin: 0 0 0 0.6em;  
    padding: 0.2em 0.5em;  
    font-size: 0.85em;  
    font-weight: 600;  
    border: 1.5px solid rgba(255, 255, 255, 0.4);  
    border-radius: 0.3em;  
    background: rgba(255, 255, 255, 0.1);  
    color: rgba(255, 255, 255, 0.9);  
    line-height: 1;  
    vertical-align: middle;  
}  
  
/* Рейтинги */  
.applecation__ratings {  
    display: flex;  
    align-items: center;  
    gap: 0.8em;  
    margin-bottom: 0.5em;  
    opacity: 0;  
    transform: translateY(15px);  
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;  
    transition-delay: 0.08s;  
    will-change: opacity, transform;  
}  
  
.applecation__ratings.show {  
    opacity: 1;  
    transform: translateY(0);  
}  
  
.applecation__ratings .rate--imdb,  
.applecation__ratings .rate--kp {  
    display: flex;  
    align-items: center;  
    gap: 0.35em;  
}  
  
.applecation__ratings svg {  
    width: 2.5em;  
    height: auto;  
    flex-shrink: 0;  
    color: rgba(255, 255, 255, 0.85);  
}  
  
.applecation__ratings .rate--kp svg {  
    width: 1.5em;  
}  
  
.applecation__ratings > div > div {  
    font-size: 0.95em;  
    font-weight: 600;  
    line-height: 1;  
    color: #fff;  
}  
  
/* Управління видимістю рейтингів */  
body.applecation--hide-ratings .applecation__ratings {  
    display: none !important;  
}  
  
/* Розташування рейтингів */  
body.applecation--ratings-corner .applecation__right {  
    gap: 1em;  
}  
  
body.applecation--ratings-corner .applecation__ratings {  
    margin-bottom: 0;  
}  
  
/* Опис */  
.applecation__description {  
    color: rgba(255, 255, 255, 0.6);  
    font-size: 0.95em;  
    line-height: 1.5;  
    margin-bottom: 0.5em;  
    max-width: 35vw;  
    display: -webkit-box;  
    -webkit-line-clamp: 4;  
    -webkit-box-orient: vertical;  
    overflow: hidden;  
    text-overflow: ellipsis;  
    opacity: 0;  
    transform: translateY(15px);  
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;  
    transition-delay: 0.1s;  
    will-change: opacity, transform;  
}  
  
.applecation__description.show {  
    opacity: 1;  
    transform: translateY(0);  
}  
  
/* Додаткова інформація */  
.applecation__info {  
    color: rgba(255, 255, 255, 0.75);  
    font-size: 1em;  
    line-height: 1.4;  
    margin-bottom: 0.5em;  
    opacity: 0;  
    transform: translateY(15px);  
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;  
    transition-delay: 0.15s;  
    will-change: opacity, transform;  
}  
  
.applecation__info.show {  
    opacity: 1;  
    transform: translateY(0);  
}  
  
/* Ліва і права частини */  
.applecation__left {  
    flex-grow: 1;  
}  
  
.applecation__right {  
    display: flex;  
    align-items: flex-end;  
    flex-shrink: 0;  
    position: relative;  
}  
  
/* Реакції */  
.applecation .full-start-new__reactions {  
    margin: 0;  
    display: flex;  
    flex-direction: column-reverse;  
    align-items: flex-end;  
}  
  
.applecation .full-start-new__reactions > div {  
    align-self: flex-end;  
}  
  
.applecation .full-start-new__reactions:not(.focus) {  
    margin: 0;  
}  
  
.applecation .full-start-new__reactions:not(.focus) > div:not(:first-child) {  
    display: none;  
}  
  
/* Стилі першої реакції */  
.applecation .full-start-new__reactions > div:first-child .reaction {  
    display: flex !important;  
    align-items: center !important;  
    background-color: rgba(0, 0, 0, 0) !important;  
    gap: 0 !important;  
}  
  
.applecation .full-start-new__reactions > div:first-child .reaction__icon {  
    background-color: rgba(0, 0, 0, 0.3) !important;  
    -webkit-border-radius: 5em;  
    -moz-border-radius: 5em;  
    border-radius: 5em;  
    padding: 0.5em;  
    width: 2.6em !important;  
    height: 2.6em !important;  
}  
  
.applecation .full-start-new__reactions > div:first-child .reaction__count {  
    font-size: 1.2em !important;  
    font-weight: 500 !important;  
}  
  
/* При фокусі реакції */  
.applecation .full-start-new__reactions.focus {  
    gap: 0.5em;  
}  
  
.applecation .full-start-new__reactions.focus > div {  
    display: block;  
}  
  
/* Приховуємо стандартний rate-line */  
.applecation .full-start-new__rate-line {  
    margin: 0;  
    height: 0;  
    overflow: hidden;  
    opacity: 0;  
    pointer-events: none;  
}  
  
/* Анімація Ken Burns з GPU прискоренням */  
@keyframes kenBurns {  
    0% { transform: scale(1.0) translateZ(0); }  
    50% { transform: scale(1.1) translateZ(0); }  
    100% { transform: scale(1.0) translateZ(0); }  
}  
  
/* Базовий стиль фону */  
.full-start__background {  
    height: calc(100% + 6em);  
    left: 0 !important;  
    opacity: 0 !important;  
    transition: opacity 0.8s ease-out, filter 0.3s ease-out !important;  
    animation: none !important;  
    will-change: transform, opacity, filter;  
    backface-visibility: hidden;  
    perspective: 1000px;  
    transform: translateZ(0);  
    z-index: 0 !important;  
    position: absolute;  
    width: 100%;  
    transform-origin: center center;  
}  
  
/* Фон з'являється */  
.full-start__background.loaded:not(.dim) {  
    opacity: 1 !important;  
}  
  
/* Анімація вмикається тільки з класом */  
body.applecation--zoom-enabled .full-start__background.loaded:not(.dim) {  
    animation: kenBurns 40s linear infinite !important;  
}  
  
/* Шар затемнення */  
.full-start__details::before {  
    content: '';  
    position: absolute;  
    top: -150px;  
    left: -150px;  
    width: 200%;  
    height: 200%;  
    background: linear-gradient(90deg,  
        rgba(0, 0, 0, 1) 0%,  
        rgba(0, 0, 0, 0.8) 25%,  
        rgba(0, 0, 0, 0.4) 50%,  
        rgba(0, 0, 0, 0) 100%  
    );  
    z-index: -1;  
    pointer-events: none;  
}  
  
/* Гарантуємо, що контент буде зверху */  
.applecation__logo,  
.applecation__meta,  
.applecation__info,  
.applecation__description,  
.applecation__ratings {  
    position: relative;  
    z-index: 2;  
}  
  
/* Затемнення фону */  
.full-start__background.dim {  
    filter: brightness(0.3);  
}  
  
.full-start__background.loaded.applecation-animated {  
    opacity: 1 !important;  
}  
  
/* Приховуємо статус */  
.applecation .full-start__status {  
    display: none;  
}  
</style>`;  
          
        Lampa.Template.add('applecation_css', styles);  
        $('body').append(Lampa.Template.get('applecation_css', {}, true));  
    }  
  
    // Патч Api.img  
    function patchApiImg() {  
        const originalImg = Lampa.Api.img;  
          
        Lampa.Api.img = function(src, size) {  
            if (size === 'w1280') {  
                const posterSize = Lampa.Storage.field('poster_size');  
                const sizeMap = {  
                    'w200': 'w780',  
                    'w300': 'w1280',  
                    'w500': 'original'  
                };  
                size = sizeMap[posterSize] || 'w1280';  
            }  
            return originalImg.call(this, src, size);  
        };  
    }  
  
    // Отримання якості логотипа  
    function getLogoQuality() {  
        const posterSize = Lampa.Storage.field('poster_size');  
        const qualityMap = {  
            'w200': 'w300',  
            'w300': 'w500',  
            'w500': 'original'  
        };  
        return qualityMap[posterSize] || 'w500';  
    }  
      
    // Вибір найкращого логотипа  
    function selectBestLogo(logos, currentLang) {  
        const preferred = logos.filter(l => l.iso_639_1 === currentLang);  
        if (preferred.length > 0) {  
            preferred.sort((a, b) => b.vote_average - a.vote_average);  
            return preferred[0];  
        }  
  
        const english = logos.filter(l => l.iso_639_1 === 'en');  
        if (english.length > 0) {  
            english.sort((a, b) => b.vote_average - a.vote_average);  
            return english[0];  
        }  
          
        if (logos.length > 0) {  
            logos.sort((a, b) => b.vote_average - a.vote_average);  
            return logos[0];  
        }  
  
        return null;  
    }  
  
    // Отримання типу медіа  
    function getMediaType(data) {  
        const isTv = !!data.name;  
        const types = {  
            uk: isTv ? 'Серіал' : 'Фільм',  
        };  
        return types['uk'];     
    }  
  
    // Завантаження іконки студії  
function loadNetworkIcon(render, data) {  
    const networkContainer = render.find('.applecation__network');  
    const showStudio = Lampa.Storage.get('applecation_show_studio', 'true');  
      
    if (showStudio === false || showStudio === 'false') {  
        networkContainer.remove();  
        return;  
    }  
      
    const logos = [];  
      
    if (data.networks && data.networks.length) {  
        data.networks.forEach(network => {  
            if (network.logo_path) {  
                const logoUrl = Lampa.Api.img(network.logo_path, 'w200');  
                logos.push({  
                    url: logoUrl,  
                    name: network.name,  
                    element: `<img src="${logoUrl}" alt="${network.name}" data-original="true">`  
                });  
            }  
        });  
    }  
      
    if (data.production_companies && data.production_companies.length) {  
        data.production_companies.forEach(company => {  
            if (company.logo_path) {  
                const logoUrl = Lampa.Api.img(company.logo_path, 'w200');  
                logos.push({  
                    url: logoUrl,  
                    name: company.name,  
                    element: `<img src="${logoUrl}" alt="${company.name}" data-original="true">`  
                });  
            }  
        });  
    }  
      
    if (logos.length > 0) {  
        networkContainer.html(logos.map(l => l.element).join(''));  
          
        // Перевіряємо колір кожного логотипа  
        logos.forEach(logo => {  
            const img = new Image();  
            img.crossOrigin = 'anonymous';  
            img.onload = function() {  
                const canvas = document.createElement('canvas');  
                const ctx = canvas.getContext('2d');  
                canvas.width = this.width;  
                canvas.height = this.height;  
                ctx.drawImage(this, 0, 0);  
                  
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);  
                const data = imageData.data;  
                  
                let r = 0, g = 0, b = 0;  
                let pixelCount = 0;  
                let darkPixelCount = 0;  
                  
                // Аналізуємо всю область логотипа  
                for (let y = 0; y < canvas.height; y++) {  
                    for (let x = 0; x < canvas.width; x++) {  
                        const idx = (y * canvas.width + x) * 4;  
                        const alpha = data[idx + 3];  
                          
                        if (alpha > 0) { // Прозорі пікселі ігноруємо  
                            const brightness = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];  
                              
                            r += data[idx];  
                            g += data[idx + 1];  
                            b += data[idx + 2];  
                            pixelCount++;  
                              
                            // Рахуємо дуже темні пікселі (яскравість < 20)  
                            if (brightness < 20) {  
                                darkPixelCount++;  
                            }  
                        }  
                    }  
                }  
                  
                if (pixelCount > 0) {  
                    r = Math.floor(r / pixelCount);  
                    g = Math.floor(g / pixelCount);  
                    b = Math.floor(b / pixelCount);  
                      
                    // Розраховуємо середню яскравість  
                    const avgBrightness = (0.299 * r + 0.587 * g + 0.114 * b);  
                      
                    // Відсоток темних пікселів  
                    const darkPixelRatio = darkPixelCount / pixelCount;  
                      
                    // Інвертуємо тільки якщо:  
                    // 1. Середня яскравість дуже низька (< 25)  
                    // 2. Більше 70% пікселів дуже темні  
                    if (avgBrightness < 25 && darkPixelRatio > 0.7) {  
                        const imgElement = networkContainer.find(`img[alt="${logo.name}"]`);  
                        imgElement.css({  
                            'filter': 'brightness(0) invert(1) contrast(1.2)',  
                            'opacity': '0.95'  
                        });  
                        imgElement.removeAttr('data-original');  
                    }  
                }  
            };  
            img.src = logo.url;  
        });  
    } else {  
        networkContainer.remove();  
    }  
}
  
    // Заповнення мета інформації  
    function fillMetaInfo(render, data) {  
        const metaTextContainer = render.find('.applecation__meta-text');  
        const metaParts = [];  
  
        metaParts.push(getMediaType(data));  
  
         if (data.genres && data.genres.length) {  
            const genres = data.genres.slice(0, 2).map(g =>     
                Lampa.Utils.capitalizeFirstLetter(g.name)  
            );  
            metaParts.push(...genres);  
        }  
  
        metaTextContainer.html(metaParts.join(' · '));  
          
        loadNetworkIcon(render, data);  
    }  
  
    // Заповнення додаткової інформації  
    function fillAdditionalInfo(render, data) {  
        const infoContainer = render.find('.applecation__info');  
        const infoParts = [];  
  
        const releaseDate = data.release_date || data.first_air_date || '';  
        if (releaseDate) {  
            const year = releaseDate.split('-')[0];  
            infoParts.push(year);  
        }  
  
        if (data.name) {  
            if (data.episode_run_time && data.episode_run_time.length) {  
                const avgRuntime = data.episode_run_time[0];  
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');  
                infoParts.push(`${avgRuntime} ${timeM}`);  
            }  
                
            const seasons = Lampa.Utils.countSeasons(data);  
            if (seasons) {  
                infoParts.push(formatSeasons(seasons));  
            }  
        } else {  
            if (data.runtime && data.runtime > 0) {  
                const hours = Math.floor(data.runtime / 60);  
                const minutes = data.runtime % 60;  
                const timeH = Lampa.Lang.translate('time_h').replace('.', '');  
                const timeM = Lampa.Lang.translate('time_m').replace('.', '');  
                const timeStr = hours > 0     
                    ? `${hours} ${timeH} ${minutes} ${timeM}`     
                    : `${minutes} ${timeM}`;  
                infoParts.push(timeStr);  
            }  
        }  
  
        infoContainer.html(infoParts.join(' · '));  
    }  
  
    // Форматування сезонів  
    function formatSeasons(count) {  
        const cases = [2, 0, 1, 1, 1, 2];  
        const titles = ['сезон', 'сезони', 'сезонів'];  
            
        const caseIndex = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];  
            
        return `${count} ${titles[caseIndex]}`;  
    }  
  
    // Оптимізована функція очікування завантаження фону  
    function waitForBackgroundLoad(activity, callback) {  
        const background = activity.render().find('.full-start__background');  
          
        if (!background.length) {  
            callback();  
            return;  
        }  
  
        const complete = () => {  
            background.addClass('applecation-animated');  
            callback();  
        };  
  
        if (background.hasClass('loaded')) {  
            setTimeout(complete, 100);  
            return;  
        }  
  
        // Використовуємо MutationObserver для відстеження класу  
        if (typeof MutationObserver !== 'undefined') {  
            const observer = new MutationObserver((mutations) => {  
                mutations.forEach((mutation) => {  
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {  
                        if (background.hasClass('loaded')) {  
                            observer.disconnect();  
                            setTimeout(complete, 100);  
                        }  
                    }  
                });  
            });  
  
            observer.observe(background[0], {  
                attributes: true,  
                attributeFilter: ['class']  
            });  
  
            // Запасний таймаут  
            setTimeout(() => {  
                observer.disconnect();  
                if (!background.hasClass('applecation-animated')) {  
                    complete();  
                }  
            }, 1500);  
        } else {  
            // Fallback для старих браузерів  
            const checkInterval = setInterval(() => {  
                if (background.hasClass('loaded')) {  
                    clearInterval(checkInterval);  
                    setTimeout(complete, 100);  
                }  
            }, 100);  
  
            setTimeout(() => {  
                clearInterval(checkInterval);  
                if (!background.hasClass('applecation-animated')) {  
                    complete();  
                }  
            }, 1500);  
        }  
    }  
  
    // Заповнення рейтингів з оптимізацією  
    function fillRatings(ratingsContainer, data) {  
        const imdb = data.number_rating ? data.number_rating.imdb : (data.vote_average || 0);  
        const kp = data.number_rating ? data.number_rating.kp : 0;  
  
        if (imdb > 0) {  
            const imdbBlock = ratingsContainer.find('.rate--imdb');  
            imdbBlock.find('div').text(parseFloat(imdb).toFixed(1));  
            imdbBlock.removeClass('hide');  
        }  
  
        if (kp > 0) {  
            const kpBlock = ratingsContainer.find('.rate--kp');  
            kpBlock.find('div').text(parseFloat(kp).toFixed(1));  
            kpBlock.removeClass('hide');  
        }  
    }  
  
    // Оптимізована функція завантаження логотипа  
function loadLogo(event) {  
    const data = event.data.movie;  
    const activity = event.object.activity;  
    if (!data || !activity) return;  
  
    // Кешуємо рендер та контейнери  
    const render = activity.render();  
    const ratingsContainer = render.find('.applecation__ratings');  
    const logoContainer = render.find('.applecation__logo');  
    const titleElement = render.find('.full-start-new__title');  
  
    // Викликаємо функції з кешованими контейнерами  
    fillRatings(ratingsContainer, data);  
    fillMetaInfo(render, data);  
    fillAdditionalInfo(render, data);  
  
    waitForBackgroundLoad(activity, () => {  
        render.find('.applecation__meta').addClass('show');  
        render.find('.applecation__info').addClass('show');  
        render.find('.applecation__ratings').addClass('show');  
        render.find('.applecation__description').addClass('show');  
    });  
  
    const mediaType = data.name ? 'tv' : 'movie';  
    const currentLang = 'uk';  
      
    const apiUrl = Lampa.TMDB.api(  
        `${mediaType}/${data.id}/images?api_key=${Lampa.TMDB.key()}`  
    );  
  
    // Перевірка чи активна ще картка - ВИПРАВЛЕНО  
    const currentActivity = Lampa.Activity.active();  
    if (!currentActivity || currentActivity.component !== 'full') {  
        return;  
    }  
  
    $.get(apiUrl, (imagesData) => {  
        // Ще раз перевіряємо активність - ВИПРАВЛЕНО  
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
  
    // Дебаунс для завантаження логотипів  
    let loadTimeout;  
    function attachLogoLoader() {  
        Lampa.Listener.follow('full', (event) => {  
            if (event.type === 'complite') {  
                clearTimeout(loadTimeout);  
                loadTimeout = setTimeout(() => {  
                    loadLogo(event);  
                }, 150);  
            }  
        });  
    }  
  
    // Правильна реєстрація маніфесту  
    function registerPlugin() {  
        const pluginManifest = {  
            type: 'other',  
            version: '1.1.0',  
            name: 'NewCard',  
            description: 'Новий дизайн картки фільму/серіалу.',  
            author: '',  
            icon: PLUGIN_ICON  
        };  
  
        if (Lampa.Manifest) {  
            if (!Lampa.Manifest.plugins) {  
                Lampa.Manifest.plugins = {};  
            }  
              
            if (Array.isArray(Lampa.Manifest.plugins)) {  
                Lampa.Manifest.plugins.push(pluginManifest);  
            } else {  
                Lampa.Manifest.plugins['newcard'] = pluginManifest;  
            }  
        }  
    }  
  
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
          
