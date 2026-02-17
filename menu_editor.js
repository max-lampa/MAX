(function() {    
    'use strict';    
    
    function startPlugin() {    
        window.plugin_menu_editor_ready = true    
    
        function initialize() {    
            // Додаємо переклади    
            Lampa.Lang.add({    
                menu_editor_title: {    
                    ru: 'Редактирование меню',    
                    uk: 'Редагування меню',    
                    en: 'Menu Editor'    
                },    
                menu_editor_left: {    
                    ru: 'Левое меню',    
                    uk: 'Ліве меню',    
                    en: 'Left Menu'    
                },    
                menu_editor_top: {    
                    ru: 'Верхнее меню',    
                    uk: 'Верхнє меню',    
                    en: 'Top Menu'    
                },    
                menu_editor_settings: {    
                    ru: 'Меню настроек',    
                    uk: 'Меню налаштувань',    
                    en: 'Settings Menu'    
                },    
                menu_editor_hide_nav: {    
                    ru: 'Скрыть панель навигации',    
                    uk: 'Приховати панель навігації',    
                    en: 'Hide Navigation Bar'    
                },    
                menu_editor_add_reload_button: {    
                    ru: 'Добавить кнопку перезагрузки в верхнее меню',    
                    uk: 'Додати кнопку перезавантаження у верхнє меню',    
                    en: 'Add reload button to top menu'    
                },    
                menu_editor_add_clear_cache_button: {    
                    ru: 'Добавить кнопку очистки кеша в верхнее меню',    
                    uk: 'Додати кнопку очищення кешу у верхнє меню',    
                    en: 'Add clear cache button to top menu'    
                },    
                head_action_clear_cache: {    
                    ru: 'Очистить кеш',    
                    uk: 'Очистити кеш',    
                    en: 'Clear cache'    
                },    
                head_action_reload: {    
                    ru: 'Перезагрузка',    
                    uk: 'Перезавантаження',    
                    en: 'Reload'    
                },    
                head_action_search: {    
                    ru: 'Поиск',    
                    en: 'Search',    
                    uk: 'Пошук',    
                    zh: '搜索'    
                },    
                head_action_feed: {    
                    ru: 'Лента',    
                    en: 'Feed',    
                    uk: 'Стрічка',    
                    zh: '动态'    
                },    
                head_action_notice: {    
                    ru: 'Уведомления',    
                    en: 'Notifications',    
                    uk: 'Сповіщення',    
                    zh: '通知'    
                },    
                head_action_settings: {    
                    ru: 'Настройки',    
                    en: 'Settings',    
                    uk: 'Налаштування',    
                    zh: '设置'    
                },    
                head_action_profile: {    
                    ru: 'Профиль',    
                    en: 'Profile',    
                    uk: 'Профіль',    
                    zh: '个人资料'    
                },    
                head_action_fullscreen: {    
                    ru: 'Полный экран',    
                    en: 'Fullscreen',    
                    uk: 'Повноекранний режим',    
                    zh: '全屏'    
                },    
                head_action_broadcast: {    
                    ru: 'Трансляции',    
                    en: 'Broadcast',    
                    uk: 'Трансляції',    
                    zh: '直播'    
                },    
                no_name: {    
                    ru: 'Элемент без названия',    
                    en: 'Unnamed element',    
                    uk: 'Елемент без назви',    
                    zh: '未命名元素'    
                }    
            })    
    
            // Застосування налаштувань лівого меню    
            function applyLeftMenu() {    
                let sort = Lampa.Storage.get('menu_sort', [])    
                let hide = Lampa.Storage.get('menu_hide', [])    
    
                let menu = $('.menu')    
                if(!menu.length) return    
    
                if(sort.length) {    
                    sort.forEach((name) => {    
                        let item = menu.find('.menu__list:eq(0) .menu__item').filter(function() {    
                            return $(this).find('.menu__text').text().trim() === name    
                        })    
                        if(item.length) item.appendTo(menu.find('.menu__list:eq(0)'))    
                    })    
                }    
    
                $('.menu .menu__item').removeClass('hidden')    
    
                if(hide.length) {    
                    hide.forEach((name) => {    
                        let item = $('.menu .menu__list').find('.menu__item').filter(function() {    
                            return $(this).find('.menu__text').text().trim() === name    
                        })    
                        if(item.length) {    
                            item.addClass('hidden')    
                        }    
                    })    
                }    
            }    
    
            // Застосування налаштувань верхнього меню    
            function applyTopMenu() {    
                let sort = Lampa.Storage.get('head_menu_sort', [])    
                let hide = Lampa.Storage.get('head_menu_hide', [])    
    
                let actionsContainer = $('.head__actions')    
                if(!actionsContainer.length) return    
    
                $('.head__action.head__action--clear-cache, .head__action.head__action--reload').remove()    
    
                if (Lampa.Storage.get('add_clear_cache_button', false)) {    
                    let clearBtn = Lampa.Head.addIcon(    
                        `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">    
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>    
                        </svg>`,    
                        () => {    
                            Lampa.Storage.clear(false)    
                            Lampa.Cache.clearAll()    
                            Lampa.Noty.show(Lampa.Lang.translate('settings_clear_cache_only'))    
                        }    
                    )    
                    clearBtn.addClass('head__action head__action--clear-cache')    
                }    
    
                if (Lampa.Storage.get('add_reload_button', false)) {    
                    let reloadBtn = Lampa.Head.addIcon(    
                        `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">    
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>    
                        </svg>`,    
                        () => {    
                            window.location.reload()    
                        }    
                    )    
                    reloadBtn.addClass('head__action head__action--reload')    
                }    
    
                if(sort.length) {    
                    sort.forEach((uniqueClass) => {    
                        let item = $('.head__action.' + uniqueClass)    
                        if(item.length) item.appendTo(actionsContainer)    
                    })    
                }    
    
                $('.head__action').removeClass('hide')    
                if(hide.length) {    
                    hide.forEach((uniqueClass) => {    
                        let item = $('.head__action.' + uniqueClass)    
                        if(item.length) item.addClass('hide')    
                    })    
                }    
            }    
    
            // Застосування налаштувань меню налаштувань    
            function applySettingsMenu() {    
                let sort = Lampa.Storage.get('settings_menu_sort', [])    
                let hide = Lampa.Storage.get('settings_menu_hide', [])    
    
                let settingsContainer = $('.settings .scroll__body > div')    
                if(!settingsContainer.length) return    
    
                if(sort.length) {    
                    sort.forEach((name) => {    
                        let item = $('.settings-folder').filter(function() {    
                            return $(this).find('.settings-folder__name').text().trim() === name    
                        })    
                        if(item.length) item.appendTo(settingsContainer)    
                    })    
                }    
    
                $('.settings-folder').removeClass('hide')    
                if(hide.length) {    
                    hide.forEach((name) => {    
                        let item = $('.settings-folder').filter(function() {    
                            return $(this).find('.settings-folder__name').text().trim() === name    
                        })    
                        if(item.length) item.addClass('hide')    
                    })    
                }    
            }    
    
            // Функція для отримання назви пункту верхнього меню    
            function getHeadActionName(mainClass) {    
                let titleKey = '';    
    
                if (mainClass.includes('open--search')) {    
                    titleKey = 'head_action_search';    
                } else if (mainClass.includes('open--feed')) {    
                    titleKey = 'head_action_feed';    
                } else if (mainClass.includes('notice--')) {    
                    titleKey = 'head_action_notice';    
                } else if (mainClass.includes('open--settings')) {    
                    titleKey = 'head_action_settings';    
                } else if (mainClass.includes('open--profile')) {    
                    titleKey = 'head_action_profile';    
                } else if (mainClass.includes('full--screen')) {    
                    titleKey = 'head_action_fullscreen';    
                } else if (mainClass.includes('open--broadcast')) {    
                    titleKey = 'head_action_broadcast';    
                } else if (mainClass === 'head__action--clear-cache') {    
                    titleKey = 'head_action_clear_cache';    
                } else if (mainClass === 'head__action--reload') {    
                    titleKey = 'head_action_reload';    
                }    
    
                return titleKey ? Lampa.Lang.translate(titleKey) : Lampa.Lang.translate('no_name');    
            }    
    
            // Функція для редагування лівого меню    
            function editLeftMenu() {    
                let list = $('<div class="menu-edit-list"></div>')    
                let menu = $('.menu')    
    
                menu.find('.menu__item').each(function(){    
                    let item_orig = $(this)    
                    let item_clone = $(this).clone()    
                    let text = item_clone.find('.menu__text').text().trim()    
                    let isFirstSection = item_orig.closest('.menu__list').is('.menu__list:eq(0)')    
                        
                    let moveButtons = isFirstSection ? `    
                        <div class="menu-edit-list__move move-up selector">    
                            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                            </svg>    
                        </div>    
                        <div class="menu-edit-list__move move-down selector">    
                            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                            </svg>    
                        </div>` : '';    
    
                    let item_sort = $(`<div class="menu-edit-list__item">    
                        <div class="menu-edit-list__icon"></div>    
                        <div class="menu-edit-list__title">${text}</div>    
                        ${moveButtons}    
                        <div class="menu-edit-list__toggle toggle selector">    
                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>    
                                <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>    
                            </svg>    
                        </div>    
                    </div>`)    
    
                    item_sort.find('.menu-edit-list__icon').append(item_clone.find('.menu__ico').html())    
    
                    if(isFirstSection) {    
                        item_sort.find('.move-up').on('hover:enter', ()=>{    
                            let prev = item_sort.prev()    
                            while(prev.length && prev.data('isSecondSection')) {    
                                prev = prev.prev()    
                            }    
                            if(prev.length){    
                                item_sort.insertBefore(prev)    
                                item_orig.insertBefore(item_orig.prev())    
                            }    
                        })    
    
                        item_sort.find('.move-down').on('hover:enter', ()=>{    
                            let next = item_sort.next()    
                            while(next.length && next.data('isSecondSection')) {    
                                next = next.next()    
                            }    
                            if(next.length){    
                                item_sort.insertAfter(next)    
                                item_orig.insertAfter(item_orig.next())    
                            }    
                        })    
                    } else {    
                        item_sort.data('isSecondSection', true)    
                    }    
    
                    item_sort.find('.toggle').on('hover:enter', ()=>{    
                        item_orig.toggleClass('hidden')    
                        item_sort.find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)    
                    }).find('.dot').attr('opacity', item_orig.hasClass('hidden') ? 0 : 1)    
    
                    list.append(item_sort)    
                })    
    
                Lampa.Modal.open({    
                    title: Lampa.Lang.translate('menu_editor_left'),    
                    html: list,    
                    size: 'small',    
                    scroll_to_center: true,    
                    onBack: ()=>{    
                        saveLeftMenu()    
                        Lampa.Modal.close()    
                        Lampa.Controller.toggle('settings_component')    
                    }    
                })    
            }    
    
            // Функція для редагування верхнього меню    
            function editTopMenu() {    
                let list = $('<div class="menu-edit-list"></div>')    
                let head = $('.head')    
                    
                list.empty()    
                    
                head.find('.head__action').each(function(){    
                    let item_orig = $(this)    
                        
                    if (item_orig.hasClass('head__action--clear-cache') || item_orig.hasClass('head__action--reload')) {    
                        return    
                    }    
                        
                    let item_clone = $(this).clone()    
                    let allClasses = item_clone.attr('class').split(' ')    
                    let mainClass = allClasses.find(c =>     
                        c.startsWith('open--') ||     
                        c.startsWith('notice--') ||     
                        c.startsWith('full--')    
                    ) || ''    
                        
                    let displayName = getHeadActionName(mainClass)    
                    let item_sort = $(`<div class="menu-edit-list__item">    
                        <div class="menu-edit-list__icon"></div>    
                        <div class="menu-edit-list__title">${displayName}</div>    
                        <div class="menu-edit-list__move move-up selector">    
                            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                            </svg>    
                        </div>    
                        <div class="menu-edit-list__move move-down selector">    
                            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                            </svg>    
                        </div>    
                        <div class="menu-edit-list__toggle toggle selector">    
                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">    
                                <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>  
                                <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>  
                            </svg>  
                        </div>  
                    </div>`)  
                        
                    let svg = item_clone.find('svg')  
                    if(svg.length) {  
                        item_sort.find('.menu-edit-list__icon').append(svg.clone())  
                    }  
                        
                    item_sort.find('.move-up').on('hover:enter', ()=>{  
                        let prev = item_sort.prev()  
                        if(prev.length){  
                            item_sort.insertBefore(prev)  
                            item_orig.insertBefore(item_orig.prev())  
                        }  
                    })  
                        
                    item_sort.find('.move-down').on('hover:enter', ()=>{  
                        let next = item_sort.next()  
                        if(next.length){  
                            item_sort.insertAfter(next)  
                            item_orig.insertAfter(item_orig.next())  
                        }  
                    })  
                        
                    item_sort.find('.toggle').on('hover:enter', ()=>{  
                        item_orig.toggleClass('hide')  
                        item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)  
                    }).find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)  
                        
                    list.append(item_sort)  
                })  
                    
                // Додаємо кнопку очищення кешу тільки якщо увімкнено  
                if (Lampa.Storage.get('add_clear_cache_button', false)) {  
                    let clearItem = $(`  
                        <div class="menu-edit-list__item">  
                            <div class="menu-edit-list__icon">  
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>  
                                </svg>  
                            </div>  
                            <div class="menu-edit-list__title">${Lampa.Lang.translate('head_action_clear_cache')}</div>  
                            <div class="menu-edit-list__move move-up selector">  
                                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                            <div class="menu-edit-list__move move-down selector">  
                                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                            <div class="menu-edit-list__toggle toggle selector">  
                                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>  
                                    <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                        </div>  
                    `)  
                        
                    clearItem.find('.move-up').on('hover:enter', ()=>{  
                        let prev = clearItem.prev()  
                        if(prev.length){  
                            clearItem.insertBefore(prev)  
                            $('.head__action--clear-cache').insertBefore($('.head__action--clear-cache').prev())  
                        }  
                    })  
                        
                    clearItem.find('.move-down').on('hover:enter', ()=>{  
                        let next = clearItem.next()  
                        if(next.length){  
                            clearItem.insertAfter(next)  
                            $('.head__action--clear-cache').insertAfter($('.head__action--clear-cache').next())  
                        }  
                    })  
                        
                    clearItem.find('.toggle').on('hover:enter', ()=>{  
                        $('.head__action--clear-cache').toggleClass('hide')  
                        clearItem.find('.dot').attr('opacity', $('.head__action--clear-cache').hasClass('hide') ? 0 : 1)  
                    }).find('.dot').attr('opacity', $('.head__action--clear-cache').hasClass('hide') ? 0 : 1)  
                        
                    list.append(clearItem)  
                }  
                    
                // Додаємо кнопку перезавантаження якщо увімкнено  
                if (Lampa.Storage.get('add_reload_button', false)) {  
                    let reloadItem = $(`  
                        <div class="menu-edit-list__item">  
                            <div class="menu-edit-list__icon">  
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>  
                                </svg>  
                            </div>  
                            <div class="menu-edit-list__title">${Lampa.Lang.translate('head_action_reload')}</div>  
                            <div class="menu-edit-list__move move-up selector">  
                                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                            <div class="menu-edit-list__move move-down selector">  
                                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                            <div class="menu-edit-list__toggle toggle selector">  
                                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>  
                                    <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                        </div>  
                    `)  
                        
                    reloadItem.find('.move-up').on('hover:enter', ()=>{  
                        let prev = reloadItem.prev()  
                        if(prev.length){  
                            reloadItem.insertBefore(prev)  
                            $('.head__action--reload').insertBefore($('.head__action--reload').prev())  
                        }  
                    })  
                        
                    reloadItem.find('.move-down').on('hover:enter', ()=>{  
                        let next = reloadItem.next()  
                        if(next.length){  
                            reloadItem.insertAfter(next)  
                            $('.head__action--reload').insertAfter($('.head__action--reload').next())  
                        }  
                    })  
                        
                    reloadItem.find('.toggle').on('hover:enter', ()=>{  
                        $('.head__action--reload').toggleClass('hide')  
                        reloadItem.find('.dot').attr('opacity', $('.head__action--reload').hasClass('hide') ? 0 : 1)  
                    }).find('.dot').attr('opacity', $('.head__action--reload').hasClass('hide') ? 0 : 1)  
                        
                    list.append(reloadItem)  
                }  
                    
                Lampa.Modal.open({  
                    title: Lampa.Lang.translate('menu_editor_top'),  
                    html: list,  
                    size: 'small',  
                    scroll_to_center: true,  
                    onBack: ()=>{  
                        saveTopMenu()  
                        Lampa.Modal.close()  
                        Lampa.Controller.toggle('settings_component')  
                    }  
                })  
            }  
    
            // Функція для редагування меню налаштувань  
            function editSettingsMenu() {  
                Lampa.Controller.toggle('settings')  
    
                setTimeout(()=>{  
                    let settings = $('.settings')  
    
                    if(!settings.length || !settings.find('.settings-folder').length){  
                        Lampa.Noty.show('Меню налаштувань ще не завантажене')  
                        return  
                    }  
    
                    let list = $('<div class="menu-edit-list"></div>')  
    
                    settings.find('.settings-folder').each(function(){  
                        let item_orig = $(this)  
                        let item_clone = $(this).clone()  
    
                        let name = item_clone.find('.settings-folder__name').text().trim()  
    
                        let item_sort = $(`<div class="menu-edit-list__item">  
                            <div class="menu-edit-list__icon"></div>  
                            <div class="menu-edit-list__title">${name}</div>  
                            <div class="menu-edit-list__move move-up selector">  
                                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                            <div class="menu-edit-list__move move-down selector">  
                                <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                            <div class="menu-edit-list__toggle toggle selector">  
                                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">  
                                    <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>  
                                    <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>  
                                </svg>  
                            </div>  
                        </div>`)  
    
                        let icon = item_clone.find('.settings-folder__icon svg, .settings-folder__icon img')  
                        if(icon.length) {  
                            item_sort.find('.menu-edit-list__icon').append(icon.clone())  
                        }  
    
                        item_sort.find('.move-up').on('hover:enter', ()=>{  
                            let prev = item_sort.prev()  
                            if(prev.length){  
                                item_sort.insertBefore(prev)  
                                item_orig.insertBefore(item_orig.prev())  
                            }  
                        })  
    
                        item_sort.find('.move-down').on('hover:enter', ()=>{  
                            let next = item_sort.next()  
                            if(next.length){  
                                item_sort.insertAfter(next)  
                                item_orig.insertAfter(item_orig.next())  
                            }  
                        })  
    
                        item_sort.find('.toggle').on('hover:enter', ()=>{  
                            item_orig.toggleClass('hide')  
                            item_sort.find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)  
                        }).find('.dot').attr('opacity', item_orig.hasClass('hide') ? 0 : 1)  
    
                        list.append(item_sort)  
                    })  
    
                    Lampa.Modal.open({  
                        title: Lampa.Lang.translate('menu_editor_settings'),  
                        html: list,  
                        size: 'small',  
                        scroll_to_center: true,  
                        onBack: ()=>{  
                            saveSettingsMenu()  
                            Lampa.Modal.close()  
                            Lampa.Controller.toggle('settings_component')  
                        }  
                    })  
                }, 300)  
            }  
    
            // Збереження налаштувань лівого меню  
            function saveLeftMenu() {  
                let sort = []  
                let hide = []  
    
                $('.menu .menu__list:eq(0) .menu__item').each(function(){  
                    let name = $(this).find('.menu__text').text().trim()  
                    sort.push(name)  
                })  
    
                $('.menu .menu__item').each(function(){  
                    if($(this).hasClass('hidden')){  
                        let name = $(this).find('.menu__text').text().trim()  
                        hide.push(name)  
                    }  
                })  
    
                Lampa.Storage.set('menu_sort', sort)  
                Lampa.Storage.set('menu_hide', hide)  
            }  
    
            // Збереження налаштувань верхнього меню  
            function saveTopMenu() {  
                let sort = []  
                let hide = []  
    
                $('.head__action').each(function(){  
                    let classes = $(this).attr('class').split(' ')  
                    let uniqueClass = classes.find(c =>     
                        c.startsWith('open--') ||     
                        c.startsWith('notice--') ||     
                        c.startsWith('full--') ||  
                        c === 'head__action--clear-cache' ||  
                        c === 'head__action--reload'  
                    )  
    
                    if(uniqueClass) {  
                        sort.push(uniqueClass)  
                        if($(this).hasClass('hide')){  
                            hide.push(uniqueClass)  
                        }  
                    }  
                })  
    
                Lampa.Storage.set('head_menu_sort', sort)  
                Lampa.Storage.set('head_menu_hide', hide)  
            }  
    
            // Збереження налаштувань меню налаштувань  
            function saveSettingsMenu() {  
                let sort = []  
                let hide = []  
    
                $('.settings-folder').each(function(){  
                    let name = $(this).find('.settings-folder__name').text().trim()  
                    sort.push(name)  
                    if($(this).hasClass('hide')){  
                        hide.push(name)  
                    }  
                })  
    
                Lampa.Storage.set('settings_menu_sort', sort)  
                Lampa.Storage.set('settings_menu_hide', hide)  
            }  
    
            // Додаємо налаштування  
            function addSettings() {  
                Lampa.SettingsApi.addComponent({  
                    component: 'menu_editor',  
                    icon: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">  

                        <path d="M18.2989 5.27973L2.60834 20.9715C2.52933 21.0507 2.47302 21.1496 2.44528 21.258L0.706081 28.2386C0.680502 28.3422 0.682069 28.4507 0.710632 28.5535C0.739195 28.6563 0.793788 28.75 0.869138 28.8255C0.984875 28.9409 1.14158 29.0057 1.30498 29.0059C1.35539 29.0058 1.4056 28.9996 1.45449 28.9873L8.43509 27.2479C8.54364 27.2206 8.64271 27.1643 8.72172 27.0851L24.4137 11.3944L18.2989 5.27973ZM28.3009 3.14018L26.5543 1.39363C25.3869 0.226285 23.3524 0.227443 22.1863 1.39363L20.0469 3.53318L26.1614 9.64766L28.3009 7.50816C28.884 6.9253 29.2052 6.14945 29.2052 5.32432C29.2052 4.49919 28.884 3.72333 28.3009 3.14018Z" fill="currentColor"/>  
                    </svg>`,  
                    name: Lampa.Lang.translate('menu_editor_title')  
                })  
  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_editor',  
                    param: {  
                        name: 'edit_left_menu',  
                        type: 'button',  
                    },  
                    field: {  
                        name: Lampa.Lang.translate('menu_editor_left'),  
                    },  
                    onChange: editLeftMenu  
                })  
  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_editor',  
                    param: {  
                        name: 'edit_top_menu',  
                        type: 'button',  
                    },  
                    field: {  
                        name: Lampa.Lang.translate('menu_editor_top'),  
                    },  
                    onChange: editTopMenu  
                })  
  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_editor',  
                    param: {  
                        name: 'edit_settings_menu',  
                        type: 'button',  
                    },  
                    field: {  
                        name: Lampa.Lang.translate('menu_editor_settings'),  
                    },  
                    onChange: editSettingsMenu  
                })  
  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_editor',  
                    param: {  
                        name: 'add_reload_button',  
                        type: 'trigger',  
                        default: false  
                    },  
                    field: {  
                        name: Lampa.Lang.translate('menu_editor_add_reload_button'),  
                        description: 'Додає кнопку перезавантаження у верхнє меню'  
                    },  
                    onChange: function(value) {  
                        setTimeout(applyTopMenu, 100)  
                    }  
                })  
  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_editor',  
                    param: {  
                        name: 'add_clear_cache_button',  
                        type: 'trigger',  
                        default: false  
                    },  
                    field: {  
                        name: Lampa.Lang.translate('menu_editor_add_clear_cache_button'),  
                        description: 'Додає кнопку очищення кешу у верхнє меню'  
                    },  
                    onChange: function(value) {  
                        setTimeout(applyTopMenu, 100)  
                    }  
                })  
  
                Lampa.SettingsApi.addParam({  
                    component: 'menu_editor',  
                    param: {  
                        name: 'hide_navigation_bar',  
                        type: 'trigger',  
                        default: false  
                    },  
                    field: {  
                        name: Lampa.Lang.translate('menu_editor_hide_nav'),  
                        description: 'Приховує нижню панель навігації на телефоні'  
                    },  
                    onChange: function(value) {  
                        if (Lampa.Storage.field('hide_navigation_bar') == true) {  
                            Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');  
                            $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));  
                        }  
                        if (Lampa.Storage.field('hide_navigation_bar') == false) {  
                            $('#hide_nav_bar').remove();  
                        }  
                    }  
                })  
  
                if (Lampa.Storage.field('hide_navigation_bar') == true) {  
                    Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');  
                    $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));  
                }  
            }  
  
            addSettings()  
  
            // Застосовуємо налаштування при завантаженні  
            setTimeout(() => {  
                applyLeftMenu()  
                setTimeout(applyTopMenu, 300)  
            }, 500)  
  
            // Слухач події завершення ініціалізації меню  
            Lampa.Listener.follow('menu', (e) => {  
                if(e.type === 'end') {  
                    setTimeout(applyLeftMenu, 200)  
                }  
            })  
  
            Lampa.Listener.follow('activity', (e) => {  
                if(e.type === 'start' && e.component === 'settings') {  
                    setTimeout(applySettingsMenu, 500)  
                }  
            })  
  
            if(Lampa.Settings && Lampa.Settings.listener) {  
                Lampa.Settings.listener.follow('open', (e) => {  
                    setTimeout(applySettingsMenu, 300)  
                })  
            }  
        }  
  
        if(window.appready) initialize()  
        else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type == 'ready') initialize()  
            })  
        }  
    }  
  
    if(!window.plugin_menu_editor_ready) startPlugin()  
})();