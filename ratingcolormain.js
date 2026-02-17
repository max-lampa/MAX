(function () {
    'use strict';

    Lampa.Platform.tv();

    function getColor(rating) {
        let r = parseFloat(rating);
        if (isNaN(r) || r === 0) return 'inherit';

        if (r >= 8) return '#21d333'; // Зелений
        if (r >= 7) return '#82d321'; // Салатовий
        if (r >= 6) return '#d3d321'; // Гірчичний
        if (r >= 5) return '#ffc107'; // Жовтий
        if (r >= 4) return '#ff9800'; // Помаранчевий
        if (r >= 3) return '#ff5722'; // Темно-помаранчевий
        if (r >= 1.5) return '#f44336'; // Світло-червоний
        return '#ff0000'; // Червоний
    }

    function applyColors() {
        // Розширений список селекторів для карток, пошуку та повного опису
        let elements = document.querySelectorAll('.card__vote, .full-start__vote, .card__rating-item, .is--vote, .is--rating');

        elements.forEach(el => {
            // Перевіряємо, чи ми вже фарбували цей елемент
            if (!el.getAttribute('data-colored')) {
                // Очищуємо текст від зайвих пробілів та замінюємо кому на крапку
                let text = el.innerText.trim().replace(',', '.');
                let ratingValue = parseFloat(text);

                if (!isNaN(ratingValue) && ratingValue > 0) {
                    el.style.backgroundColor = getColor(ratingValue);
                    el.style.color = '#fff';
                    el.style.padding = '0 5px';
                    el.style.borderRadius = '4px';
                    el.style.fontWeight = 'bold';
                    el.setAttribute('data-colored', 'true');
                }
            }
        });
    }

    // Використовуємо MutationObserver для кращої продуктивності замість простого таймера,
    // але залишаємо інтервал як страховку для динамічних списків Lampa.
    setInterval(applyColors, 1000);

    // Додатковий запуск при зміні контенту (наприклад, перехід на іншу сторінку)
    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') applyColors();
    });

    console.log('Plugin Rating Colors: Fixed & Initialized');
})();