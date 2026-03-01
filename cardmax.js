(function () {
    'use strict';

    const TMDB_API_KEY = 'ВСТАВЬ_СЮДА_СВОЙ_TMDB_API_KEY';
    const TMDB_URL = 'https://api.themoviedb.org/3';
    const IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

    function getMediaType(card) {
        return card.card && card.card.seasons ? 'tv' : 'movie';
    }

    function selectBestLogo(logos) {
        if (!logos || !logos.length) return null;

        const priority = ['ru', 'uk', 'en', null];

        for (let lang of priority) {
            const filtered = logos.filter(l => l.iso_639_1 === lang);
            if (filtered.length) {
                filtered.sort((a, b) => b.vote_average - a.vote_average);
                return filtered[0];
            }
        }

        logos.sort((a, b) => b.vote_average - a.vote_average);
        return logos[0];
    }

    function replacePoster(element, logoUrl) {
        if (!element) return;

        element.innerHTML = '';
        element.style.background = '#000';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.padding = '5%';

        const img = document.createElement('img');
        img.src = logoUrl;

        img.style.maxWidth = '90%';
        img.style.maxHeight = '70%';
        img.style.width = 'auto';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        img.style.display = 'block';

        element.appendChild(img);
    }

    function loadLogo(card, element) {
        if (!card || !card.id || !element) return;

        const mediaType = getMediaType(card);

        const url = `${TMDB_URL}/${mediaType}/${card.id}/images?api_key=${TMDB_API_KEY}&include_image_language=ru,uk,en,null`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (!data || !data.logos) return;

                const bestLogo = selectBestLogo(data.logos);
                if (!bestLogo) return;

                const logoUrl = IMAGE_BASE + bestLogo.file_path;
                replacePoster(element, logoUrl);
            })
            .catch(() => {});
    }

    function init() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite' && e.object) {
                setTimeout(() => {
                    const element = document.querySelector('.full-start-new__poster');
                    loadLogo(e.object, element);
                }, 300);
            }
        });

        Lampa.Listener.follow('card', function (e) {
            if (e.type === 'focus' && e.object && e.card) {
                setTimeout(() => {
                    const element = document.querySelector('.card__view');
                    loadLogo(e.object, element);
                }, 200);
            }
        });
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();