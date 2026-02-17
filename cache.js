(function() {
    setTimeout(function() {
        const clearBtnId = 'CLEARCACHE';

        // Видалення існуючої кнопки
        $('#' + clearBtnId).remove();

        // Додавання CSS
        if (!document.getElementById('clearcache-style')) {
            const css = `
                /* Новий стиль для кнопки Стрічка */
                .head__action.selector.open--feed svg path {
                    fill: #2196F3 !important;
                }
                
                /* Решта вашого оригінального CSS */
                #${clearBtnId} svg path {
                    fill: lime !important;
                    transition: fill 0.2s ease;
                }
                #${clearBtnId}.selector:hover,
                #${clearBtnId}.selector:focus,
                #${clearBtnId}.selector:active {
                    background: white !important;
                }
                #${clearBtnId}.selector:hover svg path,
                #${clearBtnId}.selector:focus svg path,
                #${clearBtnId}.selector:active svg path {
                    fill: black !important;
                }

                .full-start__button {
                    transition: transform 0.2s ease !important;
                    position: relative;
                }
                .full-start__button:active {
                    transform: scale(0.98) !important;
                }

                .full-start__button.view--online svg path {
                    fill: #2196f3 !important;
                }
                .full-start__button.view--torrent svg path {
                    fill: lime !important;
                }
                .full-start__button.view--trailer svg path {
                    fill: #f44336 !important;
                }

                .full-start__button.loading::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: rgba(255,255,255,0.5);
                    animation: loading 1s linear infinite;
                }
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                @media (max-width: 767px) {
                    .full-start__button {
                        min-height: 44px !important;
                        padding: 10px !important;
                    }
                }
            `;
            const style = document.createElement('style');
            style.id = 'clearcache-style';
            style.textContent = css;
            document.head.appendChild(style);
        }

        // Додавання кнопки очищення кешу
        $('.head__actions').append(`
            <div id="${clearBtnId}" class="head__action selector m-clear-cache">
                <svg width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3.1l1.4 2.2-1.6 1.1 1.3 0.3 2.8 0.6 0.6-2.7 0.4-1.4-1.8 1.1-2-3.3h-2.2l-2.6 4.3 1.7 1z"/>
                    <path d="M16 12l-2.7-4.3-1.7 1 2 3.3h-2.6v-2l-3 3 3 3v-2h3.7z"/>
                    <path d="M2.4 12v0l1.4-2.3 1.7 1.1-0.9-4.2-2.8 0.7-1.3 0.3 1.6 1-2.1 3.4 1.3 2h5.7v-2z"/>
                </svg>
            </div>
        `);

        // Оригінальний обробник для TV (повертаємо стару логіку)
        $('#' + clearBtnId).on('hover:enter hover:click hover:touch', function() {
            try {
                $(this).addClass('loading');
                
                if (Lampa && Lampa.Cache && typeof Lampa.Cache.clear === 'function') {
                    Lampa.Cache.clear();
                    setTimeout(() => {
                        alert('🗑 Кеш Lampa очищено');
                        $(this).removeClass('loading');
                        setTimeout(() => location.reload(), 300);
                    }, 800);
                } else {
                    setTimeout(() => {
                        let removed = 0;
                        const keysToRemove = [];
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key.startsWith('card_') || key.startsWith('full_card_') || 
                                key.startsWith('lite_card_') || key.startsWith('viewed_card_') || 
                                key.startsWith('viewed_continue_') || key.startsWith('parser_') || 
                                key.startsWith('cub_') || key.startsWith('start_time_') || 
                                key.startsWith('cache_')) {
                                keysToRemove.push(key);
                            }
                        }
                        keysToRemove.forEach(key => {
                            localStorage.removeItem(key);
                            removed++;
                        });
                        alert(`🗑 Локальний кеш очищено: ${removed} ключів`);
                        $(this).removeClass('loading');
                        setTimeout(() => location.reload(), 300);
                    }, 800);
                }
            } catch (e) {
                console.error('Помилка очищення кешу:', e);
                $('#' + clearBtnId).removeClass('loading');
            }
        });

        // Оновлення кнопок
        function updateButtons() {
            $('.full-start__button.view--torrent svg').replaceWith(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">
                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z"/>
                </svg>
            `);

            $('.full-start__button.view--online svg').replaceWith(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z"/>
                </svg>
            `);

            $('.full-start__button.view--trailer svg').replaceWith(`
                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z"/>
                </svg>
            `);
        }

        // Ініціалізація
        updateButtons();
        if (Lampa && Lampa.Listener) {
            Lampa.Listener.follow('full', updateButtons);
        }

        // Реєстрація плагіна
        window.plugin && window.plugin('clear_cache_plugin', {
            type: 'component',
            name: 'Оптилізовані кнопки + очистка кешу',
            version: '2.3.1',
            author: 'Oleksandr',
            description: 'Фікс для TV + стандартні анімації + синя кнопка Стрічка'
        });

    }, 1000);
})();