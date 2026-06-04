/**
 * posters_modern.js — Lampa plugin
 * Redesigns movie/series cards:
 *   • Vertical posters 2:3 aspect ratio
 *   • "ФИЛЬМ" / "СЕРИАЛ" badge in top-left corner
 *   • Title + year + genres overlay at the bottom with dark gradient
 *   • Rounded corners, modern look
 *
 * Usage:
 *   Settings → Extensions → Add plugin → {URL}/posters_modern.js
 *
 * Author: Lampa community
 */

(function () {
    'use strict';

    if (!window.Lampa) {
        console.warn('posters_modern: Lampa not found, plugin skipped');
        return;
    }

    var PLUGIN_NAME = 'posters_modern';

    // ========== 1. Inject CSS that restyles cards ==========
    function injectCSS() {
        var css = [
            /* Plugin namespace - we wrap modified cards */
            '.pm-card { position: relative; border-radius: 1.4vw; overflow: hidden; background: #151518; }',
            '.pm-card__image { display: block; width: 100%; height: 100%; object-fit: cover; }',
            '.pm-card__image--cover { width: 100%; aspect-ratio: 2 / 3; background-color: #18181d; background-size: cover; background-position: center; }',
            '.pm-card__gradient { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.92) 100%); }',
            '.pm-badge { position: absolute; top: 10px; left: 10px; z-index: 3; padding: 4px 12px; background: rgba(20,20,22,0.82); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 999px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.3px; line-height: 1; text-transform: uppercase; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }',
            '.pm-badge--movie { background: rgba(20,20,22,0.82); }',
            '.pm-badge--tv    { background: rgba(20,20,22,0.82); }',
            '.pm-title { position: absolute; left: 12px; right: 12px; bottom: 36px; z-index: 3; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 18px; font-weight: 700; line-height: 1.15; text-shadow: 0 2px 6px rgba(0,0,0,0.55); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word; }',
            '.pm-meta { position: absolute; left: 12px; right: 12px; bottom: 10px; z-index: 3; color: rgba(255,255,255,0.78); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; line-height: 1.3; }',
            '.pm-meta__sep { color: rgba(255,255,255,0.35); margin: 0 4px; }',
            /* Hide original lamp card pieces when our wrapper is in use */
            '.pm-card .card__cover, .pm-card .card__img, .pm-card .card__title, .pm-card .card__line, .pm-card .card__quality, .pm-card .card__info { display: none !important; }',
            /* Override default Lampa card ratio to 2:3 poster */
            '.pm-mode .card, .pm-mode .cards__item { aspect-ratio: 2 / 3 !important; }',
            '.pm-mode .card__poster, .pm-mode .card__cover, .pm-mode .card__img { aspect-ratio: 2 / 3 !important; }',
        ].join('\n');

        var style = document.createElement('style');
        style.setAttribute('data-plugin', PLUGIN_NAME);
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ========== 2. Helpers ==========
    function getYear(card) {
        var y = card.release_date || card.first_air_date || card.year || '';
        if (typeof y === 'number') return String(y);
        if (typeof y === 'string' && y.length >= 4) return y.slice(0, 4);
        return '';
    }

    function getType(card) {
        if (card.type === 'tv' || card.number_of_seasons) return 'tv';
        if (card.type === 'movie') return 'movie';
        return card.first_air_date ? 'tv' : 'movie';
    }

    function getTitle(card) {
        return card.title || card.name || card.original_title || card.original_name || '';
    }

    function getGenres(card) {
        if (!card.genres) return [];
        var list = Array.isArray(card.genres) ? card.genres : [];
        return list.slice(0, 2).map(function (g) {
            return typeof g === 'string' ? g : (g.name || '');
        });
    }

    function getPoster(card) {
        if (card.poster_path) return card.poster_path;
        if (card.img) return card.img;
        if (card.backdrop_path) return card.backdrop_path;
        return '';
    }

    // ========== 3. Build a modern poster card HTML ==========
    function renderPosterCard(card) {
        var type = getType(card);
        var badgeText = type === 'tv' ? 'СЕРИАЛ' : 'ФИЛЬМ';
        var badgeClass = type === 'tv' ? 'pm-badge--tv' : 'pm-badge--movie';
        var title = getTitle(card);
        var year = getYear(card);
        var genres = getGenres(card);
        var poster = getPoster(card);

        var html = '';
        html += '<div class="pm-card pm-card--' + type + '">';
        html +=   '<div class="pm-card__image--cover" style="background-image:url(\'' + (poster || '') + '\')"></div>';
        html +=   '<div class="pm-card__gradient"></div>';
        html +=   '<div class="pm-badge ' + badgeClass + '">' + badgeText + '</div>';
        if (title) html += '<div class="pm-title">' + title + '</div>';
        var metaParts = [];
        if (year) metaParts.push('<span>' + year + '</span>');
        if (genres.length) metaParts.push('<span>' + genres.join(', ') + '</span>');
        if (metaParts.length) html += '<div class="pm-meta">' + metaParts.join('<span class="pm-meta__sep">·</span>') + '</div>';
        html += '</div>';
        return html;
    }

    // ========== 4. Hook into Lampa to replace card rendering ==========
    function init() {
        injectCSS();

        // Mark body - used for global CSS overrides
        if (document.body) document.body.classList.add('pm-mode');

        // Hook #1: replace content of newly built cards.
        // Lampa uses jQuery for DOM. We listen to document mutations
        // and enhance any ".card" that contains data-card attribute.
        if (typeof MutationObserver !== 'undefined') {
            var mo = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var nodes = mutations[i].addedNodes;
                    for (var j = 0; j < nodes.length; j++) {
                        var node = nodes[j];
                        if (node.nodeType !== 1) continue;
                        enhanceNode(node);
                    }
                }
            });
            mo.observe(document.documentElement, { childList: true, subtree: true });
        }

        // Hook #2: also expose renderPosterCard so other plugins
        // or custom templates can reuse it via window.PosterModern.
        window.PosterModern = {
            render: renderPosterCard,
            getType: getType,
        };

        console.log('posters_modern: plugin loaded');
    }

    function enhanceNode(node) {
        var cards = [node];
        if (node.querySelectorAll) {
            var found = node.querySelectorAll('.card');
            for (var i = 0; i < found.length; i++) cards.push(found[i]);
        }
        for (var k = 0; k < cards.length; k++) {
            var cardEl = cards[k];
            if (cardEl.getAttribute && cardEl.getAttribute('data-pm-processed')) continue;

            // Try to grab underlying data: Lampa may store it via jQuery data
            var data = null;
            try {
                if (window.jQuery) {
                    var $card = window.jQuery(cardEl);
                    if ($card && $card.data && $card.data('card')) data = $card.data('card');
                }
                if (!data && cardEl.dataset && cardEl.dataset.cardJson) {
                    data = JSON.parse(cardEl.dataset.cardJson);
                }
            } catch (e) {
                data = null;
            }

            if (!data) continue;

            var html = renderPosterCard(data);
            cardEl.innerHTML = html;
            if (cardEl.setAttribute) cardEl.setAttribute('data-pm-processed', '1');
        }
    }

    // Safe init: wait until Lampa is ready or document ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
