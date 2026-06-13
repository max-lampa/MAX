(function () {
  'use strict';

  var config = {
    version: '2.5.0',
    name: 'Torrent Styles MOD',
    pluginId: 'torrent_styles_mod'
  };

  var TS_ROW_VERSION = 'nuvio-v1';
  var TS_ENABLED_KEY = 'torrent_styles_mod_enabled';
  var TS_STYLE_ATTR = 'data-' + config.pluginId + '-styles';

  var TH = {
    seeds: {
      danger_below: 5,
      good_from: 10,
      top_from: 20
    },
    bitrate: {
      warn_from: 50,
      danger_from: 100
    },
    size: {
      mid_from_gb: 50,
      high_from_gb: 100,
      top_from_gb: 200
    },
    debounce_ms: 60
  };

  var styles = {
    '.torrent-item__bitrate > span.ts-bitrate, .torrent-item__seeds > span.ts-seeds, .torrent-item__grabs > span.ts-grabs, .torrent-item__size.ts-size': {
      'display': 'inline-flex',
      '-webkit-box-align': 'center',
      '-webkit-align-items': 'center',
      '-moz-box-align': 'center',
      '-ms-flex-align': 'center',
      'align-items': 'center',
      '-webkit-box-pack': 'center',
      '-webkit-justify-content': 'center',
      '-moz-box-pack': 'center',
      '-ms-flex-pack': 'center',
      'justify-content': 'center',
      'box-sizing': 'border-box',
      'min-height': '1.7em',
      'padding': '0.15em 0.45em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'font-size': '0.9em',
      'line-height': '1',
      'white-space': 'nowrap',
      'vertical-align': 'middle',
      'font-variant-numeric': 'tabular-nums'
    },

    '.torrent-item__bitrate, .torrent-item__grabs, .torrent-item__seeds': {
      'margin-right': '0.55em'
    },

    '.torrent-item__seeds > span.ts-seeds': {
      color: '#5cd4b0',
      'background-color': 'rgba(92, 212, 176, 0.14)',
      border: '0.15em solid rgba(92, 212, 176, 0.90)',
      'box-shadow': '0 0 0.75em rgba(92, 212, 176, 0.28)'
    },
    '.torrent-item__seeds > span.ts-seeds.low-seeds': {
      color: '#ff5f6d',
      'background-color': 'rgba(255, 95, 109, 0.14)',
      border: '0.15em solid rgba(255, 95, 109, 0.82)',
      'box-shadow': '0 0 0.65em rgba(255, 95, 109, 0.26)',
      'text-shadow': '0 0 0.25em rgba(255, 95, 109, 0.25)'
    },
    '.torrent-item__seeds > span.ts-seeds.good-seeds': {
      color: '#43cea2',
      'background-color': 'rgba(67, 206, 162, 0.16)',
      border: '0.15em solid rgba(67, 206, 162, 0.92)',
      'box-shadow': '0 0 0.9em rgba(67, 206, 162, 0.34)'
    },
    '.torrent-item__seeds > span.ts-seeds.high-seeds': {
      color: '#ffc371',
      background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))',
      border: '0.15em solid rgba(255, 195, 113, 0.92)',
      'box-shadow': '0 0 0.95em rgba(255, 195, 113, 0.38)',
      'text-shadow': '0 0 0.25em rgba(255, 195, 113, 0.25)'
    },

    '.torrent-item__grabs > span.ts-grabs': {
      color: '#4db6ff',
      'background-color': 'rgba(77, 182, 255, 0.12)',
      border: '0.15em solid rgba(77, 182, 255, 0.82)',
      'box-shadow': '0 0 0.35em rgba(77, 182, 255, 0.16)'
    },
    '.torrent-item__grabs > span.ts-grabs.high-grabs': {
      color: '#4db6ff',
      background: 'linear-gradient(135deg, rgba(77, 182, 255, 0.18), rgba(52, 152, 219, 0.10))',
      border: '0.15em solid rgba(77, 182, 255, 0.92)',
      'box-shadow': '0 0 0.55em rgba(77, 182, 255, 0.22)'
    },

    '.torrent-item__bitrate > span.ts-bitrate': {
      color: '#5cd4b0',
      'background-color': 'rgba(67, 206, 162, 0.10)',
      border: '0.15em solid rgba(92, 212, 176, 0.78)',
      'box-shadow': '0 0 0.45em rgba(92, 212, 176, 0.20)'
    },
    '.torrent-item__bitrate > span.ts-bitrate.high-bitrate': {
      color: '#ffc371',
      background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))',
      border: '0.15em solid rgba(255, 195, 113, 0.92)',
      'box-shadow': '0 0 0.95em rgba(255, 195, 113, 0.38)',
      'text-shadow': '0 0 0.25em rgba(255, 195, 113, 0.25)'
    },
    '.torrent-item__bitrate > span.ts-bitrate.very-high-bitrate': {
      color: '#ff5f6d',
      background: 'linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08))',
      border: '0.15em solid rgba(255, 95, 109, 0.92)',
      'box-shadow': '0 0 1.05em rgba(255, 95, 109, 0.40)',
      'text-shadow': '0 0 0.25em rgba(255, 95, 109, 0.25)'
    },

    '.torrent-item__size.ts-size': {
      color: '#5cd4b0',
      'background-color': 'rgba(92, 212, 176, 0.12)',
      border: '0.15em solid rgba(92, 212, 176, 0.82)',
      'box-shadow': '0 0 0.7em rgba(92, 212, 176, 0.26)',
      'font-weight': '700'
    },
    '.torrent-item__size.ts-size.mid-size': {
      color: '#43cea2',
      'background-color': 'rgba(67, 206, 162, 0.16)',
      border: '0.15em solid rgba(67, 206, 162, 0.92)',
      'box-shadow': '0 0 0.9em rgba(67, 206, 162, 0.34)'
    },
    '.torrent-item__size.ts-size.high-size': {
      color: '#ffc371',
      background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))',
      border: '0.15em solid rgba(255, 195, 113, 0.95)',
      'box-shadow': '0 0 1.05em rgba(255, 195, 113, 0.40)',
      'text-shadow': '0 0 0.25em rgba(255, 195, 113, 0.22)'
    },
    '.torrent-item__size.ts-size.top-size': {
      color: '#ff5f6d',
      background: 'linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08))',
      border: '0.15em solid rgba(255, 95, 109, 0.95)',
      'box-shadow': '0 0 1.1em rgba(255, 95, 109, 0.42)',
      'text-shadow': '0 0 0.25em rgba(255, 95, 109, 0.22)'
    },

    '.torrent-item.selector.focus': {
      'box-shadow': '0 0 0 0.3em rgba(67, 206, 162, 0.4)'
    },
    '.torrent-serial.selector.focus': {
      'box-shadow': '0 0 0 0.25em rgba(67, 206, 162, 0.4)'
    },
    '.torrent-file.selector.focus': {
      'box-shadow': '0 0 0 0.25em rgba(67, 206, 162, 0.4)'
    },
    '.torrent-item.focus::after': {
      border: '0.24em solid #5cd4b0',
      'box-shadow': '0 0 0.6em rgba(92, 212, 176, 0.18)',
      'border-radius': '0.9em'
    },

    // ── Нувио строка в торренте ──
    '.torrent-item .ts-nuvio-torrent-row': {
      'display': 'flex',
      'align-items': 'center',
      'flex-wrap': 'wrap',
      'gap': '0.4em',
      'margin-top': '0.45em',
      'font-size': '0.85em'
    },

    // ── Нувио бейдж: базовый ──
    '.ts-nuvio-badge, .online-prestige .ts-nuvio-badge': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'min-height': '1.7em',
      'padding': '0.15em 0.5em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'font-size': '0.9em',
      'line-height': '1',
      'white-space': 'nowrap',
      'box-sizing': 'border-box'
    },

    // ── Стриминговые сервисы ──
    '.ts-nuvio-badge.ts-stream-netflix': {
      color: '#ff4444',
      'background-color': 'rgba(229, 9, 20, 0.14)',
      border: '0.15em solid rgba(229, 9, 20, 0.85)'
    },
    '.ts-nuvio-badge.ts-stream-prime': {
      color: '#7fd8ff',
      'background-color': 'rgba(0, 168, 225, 0.14)',
      border: '0.15em solid rgba(0, 168, 225, 0.85)'
    },
    '.ts-nuvio-badge.ts-stream-atvp': {
      color: '#e0e0e0',
      'background-color': 'rgba(200, 200, 200, 0.10)',
      border: '0.15em solid rgba(200, 200, 200, 0.55)'
    },
    '.ts-nuvio-badge.ts-stream-disney': {
      color: '#00e5ff',
      'background-color': 'rgba(0, 199, 220, 0.14)',
      border: '0.15em solid rgba(0, 199, 220, 0.85)'
    },
    '.ts-nuvio-badge.ts-stream-max': {
      color: '#d580ff',
      'background-color': 'rgba(177, 0, 255, 0.14)',
      border: '0.15em solid rgba(177, 0, 255, 0.82)'
    },
    '.ts-nuvio-badge.ts-stream-hulu': {
      color: '#1ce783',
      'background-color': 'rgba(28, 231, 131, 0.12)',
      border: '0.15em solid rgba(28, 231, 131, 0.82)'
    },
    '.ts-nuvio-badge.ts-stream-peacock': {
      color: '#ffb81c',
      'background-color': 'rgba(255, 184, 28, 0.14)',
      border: '0.15em solid rgba(255, 184, 28, 0.85)'
    },
    '.ts-nuvio-badge.ts-stream-paramount': {
      color: '#6699ff',
      'background-color': 'rgba(0, 80, 208, 0.14)',
      border: '0.15em solid rgba(0, 80, 208, 0.85)'
    },
    '.ts-nuvio-badge.ts-stream-croll': {
      color: '#f47521',
      'background-color': 'rgba(244, 117, 33, 0.14)',
      border: '0.15em solid rgba(244, 117, 33, 0.85)'
    },
    '.ts-nuvio-badge.ts-stream-crave': {
      color: '#aaaaff',
      'background-color': 'rgba(128, 136, 255, 0.14)',
      border: '0.15em solid rgba(128, 136, 255, 0.82)'
    },

    // ── Уровень релиза ──
    '.ts-nuvio-badge.ts-tier-remux': {
      color: '#5cd4c0',
      'background-color': 'rgba(16, 128, 142, 0.15)',
      border: '0.15em solid rgba(16, 128, 142, 0.88)',
      'box-shadow': '0 0 0.6em rgba(16, 128, 142, 0.24)'
    },
    '.ts-nuvio-badge.ts-tier-bluray': {
      color: '#6699ff',
      'background-color': 'rgba(21, 101, 192, 0.15)',
      border: '0.15em solid rgba(21, 101, 192, 0.85)'
    },
    '.ts-nuvio-badge.ts-tier-web': {
      color: '#80aaff',
      'background-color': 'rgba(21, 101, 192, 0.12)',
      border: '0.15em solid rgba(21, 101, 192, 0.72)'
    },

    // ── Видеокодек ──
    '.ts-nuvio-badge.ts-codec-hevc': {
      color: '#88ff80',
      'background-color': 'rgba(136, 255, 128, 0.10)',
      border: '0.15em solid rgba(136, 255, 128, 0.72)'
    },
    '.ts-nuvio-badge.ts-codec-avc': {
      color: '#70cc68',
      'background-color': 'rgba(112, 204, 104, 0.10)',
      border: '0.15em solid rgba(112, 204, 104, 0.65)'
    },

    // ── Битовая глубина ──
    '.ts-nuvio-badge.ts-depth-10bit': {
      color: '#ff8080',
      'background-color': 'rgba(255, 19, 15, 0.12)',
      border: '0.15em solid rgba(255, 19, 15, 0.72)'
    },
    '.ts-nuvio-badge.ts-depth-8bit': {
      color: '#cc7070',
      'background-color': 'rgba(200, 50, 50, 0.10)',
      border: '0.15em solid rgba(200, 50, 50, 0.55)'
    },

    // ── Аудиоканалы ──
    '.ts-nuvio-badge.ts-ch-71': {
      color: '#c8d860',
      'background-color': 'rgba(158, 176, 69, 0.14)',
      border: '0.15em solid rgba(158, 176, 69, 0.82)'
    },
    '.ts-nuvio-badge.ts-ch-61': {
      color: '#b8c850',
      'background-color': 'rgba(158, 176, 69, 0.12)',
      border: '0.15em solid rgba(158, 176, 69, 0.72)'
    },
    '.ts-nuvio-badge.ts-ch-51': {
      color: '#a8b840',
      'background-color': 'rgba(158, 176, 69, 0.10)',
      border: '0.15em solid rgba(158, 176, 69, 0.65)'
    },
    '.ts-nuvio-badge.ts-ch-20': {
      color: '#909e38',
      'background-color': 'rgba(158, 176, 69, 0.08)',
      border: '0.15em solid rgba(158, 176, 69, 0.55)'
    },

    // ── Доп. аудиоформаты (Opus, MP3, PCM) ──
    '.ts-nuvio-badge.ts-audio-opus': {
      color: '#e080ff',
      'background-color': 'rgba(212, 0, 255, 0.12)',
      border: '0.15em solid rgba(212, 0, 255, 0.68)'
    },
    '.ts-nuvio-badge.ts-audio-mp3': {
      color: '#cc66ff',
      'background-color': 'rgba(212, 0, 255, 0.10)',
      border: '0.15em solid rgba(212, 0, 255, 0.55)'
    },
    '.ts-nuvio-badge.ts-audio-pcm': {
      color: '#b855e8',
      'background-color': 'rgba(212, 0, 255, 0.10)',
      border: '0.15em solid rgba(212, 0, 255, 0.58)'
    },

    // ── Специальные теги ──
    '.ts-nuvio-badge.ts-tag-seadex': {
      color: '#cc88ff',
      'background-color': 'rgba(106, 27, 154, 0.18)',
      border: '0.15em solid rgba(106, 27, 154, 0.85)',
      'box-shadow': '0 0 0.65em rgba(106, 27, 154, 0.30)'
    },
    '.ts-nuvio-badge.ts-tag-dircut': {
      color: '#99aaff',
      'background-color': 'rgba(92, 107, 192, 0.15)',
      border: '0.15em solid rgba(92, 107, 192, 0.82)'
    },
    '.ts-nuvio-badge.ts-tag-extended': {
      color: '#5cd4b0',
      'background-color': 'rgba(0, 137, 123, 0.14)',
      border: '0.15em solid rgba(0, 137, 123, 0.82)'
    },
    '.ts-nuvio-badge.ts-tag-truehue': {
      color: '#ffaa55',
      'background-color': 'rgba(230, 81, 0, 0.14)',
      border: '0.15em solid rgba(230, 81, 0, 0.82)'
    },
    '.ts-nuvio-badge.ts-tag-bw': {
      color: '#cccccc',
      'background-color': 'rgba(117, 117, 117, 0.12)',
      border: '0.15em solid rgba(117, 117, 117, 0.65)'
    },

    // ── Онлайн карточки ──
    '.online-prestige.ts-online-torrent .online-prestige__footer': {
      'flex-wrap': 'wrap',
      'align-items': 'flex-end'
    },
    '.online-prestige.ts-online-torrent .online-prestige__info': {
      'min-width': '0'
    },
    '.online-prestige.ts-online-torrent .ts-online-torrent-row': {
      'display': 'flex',
      'align-items': 'center',
      'flex-wrap': 'wrap',
      'gap': '0.45em',
      'flex-basis': '100%',
      'margin-top': '0.55em',
      'font-size': '0.9em'
    },
    '.online-prestige.ts-online-torrent .ts-online-torrent-tracker, .online-prestige.ts-online-torrent .ts-online-torrent-quality': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'min-height': '1.7em',
      'padding': '0.15em 0.5em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'line-height': '1',
      'white-space': 'nowrap',
      'background-color': 'rgba(255, 255, 255, 0.12)',
      'border': '0.15em solid rgba(255, 255, 255, 0.32)'
    },
    '.online-prestige.ts-online-torrent .ts-online-torrent-tracker': {
      color: '#ffffff'
    },
    '.online-prestige.ts-online-torrent .ts-online-torrent-quality': {
      color: '#ffc371',
      'background-color': 'rgba(255, 195, 113, 0.12)',
      border: '0.15em solid rgba(255, 195, 113, 0.7)'
    },
    '.online-prestige.ts-online-torrent .ts-online-torrent-row > .ts-online-torrent-quality': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'box-sizing': 'border-box',
      'min-height': '1.7em',
      'padding': '0.15em 0.55em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'line-height': '1',
      'white-space': 'nowrap',
      color: '#ffc371',
      'background-color': 'rgba(255, 195, 113, 0.12)',
      border: '0.15em solid rgba(255, 195, 113, 0.7)'
    },
    '.online-prestige.ts-online-torrent .ts-online-field': {
      'display': 'inline-flex',
      'align-items': 'center',
      'gap': '0.28em',
      'white-space': 'nowrap'
    },
    '.online-prestige.ts-online-source .online-prestige__footer': {
      'flex-wrap': 'wrap',
      'align-items': 'flex-end'
    },
    '.online-prestige.ts-online-source .ts-online-source-row': {
      'display': 'flex',
      'align-items': 'center',
      'flex-wrap': 'wrap',
      'gap': '0.45em',
      'flex-basis': '100%',
      'margin-top': '0.55em',
      'font-size': '0.9em'
    },
    '.online-prestige.ts-online-source .ts-online-source-chip': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'min-height': '1.7em',
      'padding': '0.15em 0.5em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'line-height': '1',
      'white-space': 'nowrap',
      'background-color': 'rgba(255, 255, 255, 0.12)',
      'border': '0.15em solid rgba(255, 255, 255, 0.32)',
      color: '#ffffff'
    },
    '.online-prestige.ts-online-source .ts-online-source-chip.ts-source-ua': {
      color: '#7fd8ff',
      'background-color': 'rgba(77, 182, 255, 0.12)',
      border: '0.15em solid rgba(77, 182, 255, 0.72)'
    },
    '.online-prestige.ts-online-source .ts-online-source-chip.ts-source-quality': {
      color: '#ffc371',
      'background-color': 'rgba(255, 195, 113, 0.12)',
      border: '0.15em solid rgba(255, 195, 113, 0.72)'
    },
    '.online-prestige.ts-online-source .ts-online-source-chip.ts-source-premium': {
      color: '#5cd4b0',
      'background-color': 'rgba(92, 212, 176, 0.12)',
      border: '0.15em solid rgba(92, 212, 176, 0.72)'
    },
    '.online-prestige .ts-online-movie-chip': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'min-height': '1.7em',
      'padding': '0.15em 0.5em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'line-height': '1',
      'white-space': 'nowrap'
    },
    '.online-prestige .ts-online-movie-chip.ts-movie-rating': {
      color: '#ffc371',
      'background-color': 'rgba(255, 195, 113, 0.12)',
      border: '0.15em solid rgba(255, 195, 113, 0.72)'
    },
    '.online-prestige .ts-online-movie-chip.ts-movie-age': {
      color: '#ffffff',
      'background-color': 'rgba(255, 255, 255, 0.10)',
      border: '0.15em solid rgba(255, 255, 255, 0.48)'
    },
    '.online-prestige .ts-online-compat': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'min-height': '1.7em',
      'padding': '0.15em 0.5em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'line-height': '1',
      'white-space': 'nowrap'
    },
    '.online-prestige .ts-online-compat.ts-compat-good': {
      color: '#5cd4b0',
      'background-color': 'rgba(92, 212, 176, 0.12)',
      border: '0.15em solid rgba(92, 212, 176, 0.78)',
      'box-shadow': '0 0 0.45em rgba(92, 212, 176, 0.18)'
    },
    '.online-prestige .ts-online-compat.ts-compat-warn': {
      color: '#ffc371',
      'background-color': 'rgba(255, 195, 113, 0.12)',
      border: '0.15em solid rgba(255, 195, 113, 0.82)',
      'box-shadow': '0 0 0.45em rgba(255, 195, 113, 0.20)'
    },
    '.online-prestige .ts-online-compat.ts-compat-bad': {
      color: '#ff5f6d',
      'background-color': 'rgba(255, 95, 109, 0.14)',
      border: '0.15em solid rgba(255, 95, 109, 0.86)',
      'box-shadow': '0 0 0.45em rgba(255, 95, 109, 0.22)'
    },

    // ── HDR-бейджи ──
    '.online-prestige .ts-hdr-badge': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'min-height': '1.7em',
      'padding': '0.15em 0.5em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'line-height': '1',
      'white-space': 'nowrap'
    },
    '.online-prestige .ts-hdr-badge.ts-hdr-dv': {
      color: '#d8a4ff',
      'background-color': 'rgba(180, 100, 255, 0.13)',
      border: '0.15em solid rgba(180, 100, 255, 0.72)',
      'box-shadow': '0 0 0.55em rgba(180, 100, 255, 0.22)'
    },
    '.online-prestige .ts-hdr-badge.ts-hdr-hdr10plus': {
      color: '#ffb347',
      'background-color': 'rgba(255, 179, 71, 0.14)',
      border: '0.15em solid rgba(255, 179, 71, 0.80)',
      'box-shadow': '0 0 0.55em rgba(255, 179, 71, 0.24)'
    },
    '.online-prestige .ts-hdr-badge.ts-hdr-hdr10': {
      color: '#ffc371',
      'background-color': 'rgba(255, 195, 113, 0.12)',
      border: '0.15em solid rgba(255, 195, 113, 0.75)',
      'box-shadow': '0 0 0.45em rgba(255, 195, 113, 0.22)'
    },
    '.online-prestige .ts-hdr-badge.ts-hdr-hlg': {
      color: '#5cd4b0',
      'background-color': 'rgba(92, 212, 176, 0.10)',
      border: '0.15em solid rgba(92, 212, 176, 0.70)'
    },

    // ── Аудио-бейджи ──
    '.online-prestige .ts-audio-badge': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'min-height': '1.7em',
      'padding': '0.15em 0.5em',
      'border-radius': '0.5em',
      'font-weight': '700',
      'line-height': '1',
      'white-space': 'nowrap'
    },
    '.online-prestige .ts-audio-badge.ts-audio-premium': {
      color: '#ffc371',
      'background-color': 'rgba(255, 195, 113, 0.13)',
      border: '0.15em solid rgba(255, 195, 113, 0.80)',
      'box-shadow': '0 0 0.55em rgba(255, 195, 113, 0.26)'
    },
    '.online-prestige .ts-audio-badge.ts-audio-dts': {
      color: '#4db6ff',
      'background-color': 'rgba(77, 182, 255, 0.12)',
      border: '0.15em solid rgba(77, 182, 255, 0.78)',
      'box-shadow': '0 0 0.45em rgba(77, 182, 255, 0.20)'
    },
    '.online-prestige .ts-audio-badge.ts-audio-ac3': {
      color: '#a0b8d0',
      'background-color': 'rgba(160, 184, 208, 0.10)',
      border: '0.15em solid rgba(160, 184, 208, 0.55)'
    },
    '.online-prestige .ts-audio-badge.ts-audio-flac': {
      color: '#5cd4b0',
      'background-color': 'rgba(92, 212, 176, 0.10)',
      border: '0.15em solid rgba(92, 212, 176, 0.72)'
    },
    '.online-prestige .ts-audio-badge.ts-audio-aac': {
      color: '#43cea2',
      'background-color': 'rgba(67, 206, 162, 0.10)',
      border: '0.15em solid rgba(67, 206, 162, 0.65)'
    },

    '.scroll__body': {
      margin: '5px'
    },

    // ── Кнопка копирования в торрент-строке ──
    '.ts-copy-btn': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'padding': '0.15em 0.65em',
      'border-radius': '0.5em',
      'border': '0.15em solid rgba(92, 212, 176, 0.60)',
      'background': 'rgba(92, 212, 176, 0.09)',
      'color': '#5cd4b0',
      'font-size': '0.9em',
      'font-weight': '700',
      'cursor': 'pointer',
      'min-height': '1.7em',
      'white-space': 'nowrap',
      'margin-left': 'auto',
      'user-select': 'none',
      'letter-spacing': '0.02em',
      'transition': 'background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease'
    },
    '.ts-copy-btn:hover': {
      'background': 'rgba(92, 212, 176, 0.20)',
      'border-color': 'rgba(92, 212, 176, 0.90)',
      'box-shadow': '0 0 0.9em rgba(92, 212, 176, 0.38)',
      'color': '#7fffd4'
    },
    '.ts-copy-btn.ts-copied': {
      'background': 'rgba(67, 206, 162, 0.22)',
      'border-color': 'rgba(67, 206, 162, 0.95)',
      'color': '#43cea2',
      'box-shadow': '0 0 1.1em rgba(67, 206, 162, 0.50)'
    },

    // ── Попап оверлей ──
    '.ts-popup-overlay': {
      'position': 'fixed',
      'inset': '0',
      'top': '0',
      'left': '0',
      'right': '0',
      'bottom': '0',
      'z-index': '99999',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'background': 'rgba(5, 8, 16, 0.78)',
      '-webkit-backdrop-filter': 'blur(14px)',
      'backdrop-filter': 'blur(14px)',
      'animation': 'ts-overlay-in 0.22s ease forwards'
    },

    // ── Попап контейнер ──
    '.ts-popup': {
      'position': 'relative',
      'background': 'linear-gradient(160deg, rgba(18, 26, 42, 0.97) 0%, rgba(10, 16, 28, 0.99) 100%)',
      'border': '1px solid rgba(92, 212, 176, 0.30)',
      'border-radius': '1.2em',
      'box-shadow': '0 0 0 1px rgba(92, 212, 176, 0.08), 0 0 60px rgba(92, 212, 176, 0.18), 0 30px 80px rgba(0,0,0,0.75)',
      'padding': '0',
      'max-width': '720px',
      'width': '88vw',
      'overflow': 'hidden',
      'animation': 'ts-popup-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
    },

    // ── Попап: цветная полоска сверху ──
    '.ts-popup-accent': {
      'height': '3px',
      'background': 'linear-gradient(90deg, #5cd4b0 0%, #4db6ff 40%, #b855e8 80%, #5cd4b0 100%)',
      'background-size': '200% 100%',
      'animation': 'ts-gradient-scroll 3s linear infinite'
    },

    // ── Попап: шапка ──
    '.ts-popup-header': {
      'display': 'flex',
      'align-items': 'center',
      'gap': '0.6em',
      'padding': '1.1em 1.4em 0.75em',
      'border-bottom': '1px solid rgba(255,255,255,0.06)'
    },
    '.ts-popup-icon': {
      'font-size': '1.25em',
      'line-height': '1'
    },
    '.ts-popup-title': {
      'font-size': '1em',
      'font-weight': '700',
      'color': 'rgba(255,255,255,0.75)',
      'letter-spacing': '0.04em',
      'text-transform': 'uppercase'
    },

    // ── Попап: тело ──
    '.ts-popup-body': {
      'padding': '1.2em 1.4em 1.0em'
    },
    '.ts-popup-name': {
      'font-family': '"Courier New", Courier, monospace',
      'font-size': '0.98em',
      'color': '#e8f4f0',
      'line-height': '1.6',
      'word-break': 'break-all',
      'background': 'rgba(92, 212, 176, 0.05)',
      'border': '1px solid rgba(92, 212, 176, 0.18)',
      'border-radius': '0.65em',
      'padding': '0.85em 1.0em',
      'letter-spacing': '0.01em',
      'user-select': 'all',
      '-webkit-user-select': 'all'
    },
    '.ts-popup-hint': {
      'margin-top': '0.55em',
      'font-size': '0.78em',
      'color': 'rgba(255,255,255,0.30)',
      'text-align': 'center',
      'letter-spacing': '0.02em'
    },

    // ── Попап: подвал с кнопками ──
    '.ts-popup-footer': {
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'flex-end',
      'gap': '0.65em',
      'padding': '0.85em 1.4em 1.15em',
      'border-top': '1px solid rgba(255,255,255,0.06)'
    },

    // ── Попап: кнопки ──
    '.ts-popup-btn': {
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      'padding': '0.55em 1.3em',
      'border-radius': '0.65em',
      'font-size': '0.92em',
      'font-weight': '700',
      'cursor': 'pointer',
      'border': '0.15em solid transparent',
      'letter-spacing': '0.03em',
      'transition': 'all 0.18s ease',
      'min-width': '7em'
    },
    '.ts-popup-btn.ts-btn-copy': {
      'background': 'linear-gradient(135deg, rgba(92, 212, 176, 0.22), rgba(77, 182, 255, 0.18))',
      'border-color': 'rgba(92, 212, 176, 0.72)',
      'color': '#5cd4b0',
      'box-shadow': '0 0 0.8em rgba(92, 212, 176, 0.22)'
    },
    '.ts-popup-btn.ts-btn-copy:hover': {
      'background': 'linear-gradient(135deg, rgba(92, 212, 176, 0.35), rgba(77, 182, 255, 0.28))',
      'border-color': 'rgba(92, 212, 176, 0.95)',
      'box-shadow': '0 0 1.4em rgba(92, 212, 176, 0.45)',
      'color': '#7fffd4'
    },
    '.ts-popup-btn.ts-btn-copy.ts-copied': {
      'background': 'linear-gradient(135deg, rgba(67, 206, 162, 0.35), rgba(92, 212, 176, 0.25))',
      'border-color': '#43cea2',
      'color': '#43cea2',
      'box-shadow': '0 0 1.6em rgba(67, 206, 162, 0.55)'
    },
    '.ts-popup-btn.ts-btn-close': {
      'background': 'rgba(255, 255, 255, 0.06)',
      'border-color': 'rgba(255, 255, 255, 0.18)',
      'color': 'rgba(255,255,255,0.55)'
    },
    '.ts-popup-btn.ts-btn-close:hover': {
      'background': 'rgba(255, 255, 255, 0.12)',
      'border-color': 'rgba(255, 255, 255, 0.40)',
      'color': 'rgba(255,255,255,0.85)'
    }
  };

  var TS_ANIM_ATTR = 'data-' + config.pluginId + '-anim';

  function injectPopupKeyframes() {
    if (document.querySelector('style[' + TS_ANIM_ATTR + '="true"]')) return;
    try {
      var s = document.createElement('style');
      s.setAttribute(TS_ANIM_ATTR, 'true');
      s.innerHTML = [
        '@keyframes ts-overlay-in {',
        '  from { opacity: 0; }',
        '  to   { opacity: 1; }',
        '}',
        '@keyframes ts-popup-in {',
        '  from { opacity: 0; transform: scale(0.82) translateY(18px); }',
        '  to   { opacity: 1; transform: scale(1)    translateY(0);    }',
        '}',
        '@keyframes ts-popup-out {',
        '  from { opacity: 1; transform: scale(1)    translateY(0);    }',
        '  to   { opacity: 0; transform: scale(0.88) translateY(12px); }',
        '}',
        '@keyframes ts-gradient-scroll {',
        '  0%   { background-position: 0%   50%; }',
        '  50%  { background-position: 100% 50%; }',
        '  100% { background-position: 0%   50%; }',
        '}'
      ].join('\n');
      document.head.appendChild(s);
    } catch (e) { }
  }

  function injectStyles() {
    try {
      document.querySelectorAll('style[' + TS_STYLE_ATTR + '="true"]').forEach(function (node) {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      });
      injectPopupKeyframes();

      var style = document.createElement('style');
      var css = Object.keys(styles)
        .map(function (selector) {
          var props = styles[selector];
          var rules = Object.keys(props)
            .map(function (prop) {
              return prop + ': ' + props[prop] + ' !important';
            })
            .join('; ');
          return selector + ' { ' + rules + ' }';
        })
        .join('\n');

      style.setAttribute(TS_STYLE_ATTR, 'true');
      style.innerHTML = css;
      document.head.appendChild(style);
    } catch (e) {
      console.error(config.name, 'ошибка инъекции стилей:', e);
    }
  }

  function isStylesEnabled() {
    try {
      if (typeof Lampa === 'undefined' || !Lampa.Storage) return false;
      var value = Lampa.Storage.get(TS_ENABLED_KEY, false);
      return value === true || value === 'true' || value === 1 || value === '1';
    } catch (e) {
      return false;
    }
  }

  function removeInjectedStyles() {
    try {
      document.querySelectorAll('style[' + TS_STYLE_ATTR + '="true"]').forEach(function (node) {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      });
    } catch (e) { }
  }

  function cleanupTorrentStyles() {
    try {
      removeInjectedStyles();

      document.querySelectorAll('.ts-online-torrent-row, .ts-online-source-row, .ts-nuvio-torrent-row').forEach(function (row) {
        if (row && row.parentNode) row.parentNode.removeChild(row);
      });

      document.querySelectorAll('.ts-online-torrent, .ts-online-source').forEach(function (card) {
        card.classList.remove('ts-online-torrent', 'ts-online-source');
        card.removeAttribute('data-ts-online-signature');
        card.removeAttribute('data-ts-source-signature');
      });

      document.querySelectorAll('[data-ts-nuvio-sig]').forEach(function (el) {
        el.removeAttribute('data-ts-nuvio-sig');
      });

      document.querySelectorAll('.ts-seeds, .ts-grabs, .ts-bitrate, .ts-size').forEach(function (el) {
        el.classList.remove(
          'ts-seeds', 'low-seeds', 'good-seeds', 'high-seeds',
          'ts-grabs', 'high-grabs',
          'ts-bitrate', 'high-bitrate', 'very-high-bitrate',
          'ts-size', 'mid-size', 'high-size', 'top-size'
        );
      });
    } catch (e) {
      console.error(config.name, 'ошибка очистки стилей:', e);
    }
  }

  function applyStyleState() {
    if (isStylesEnabled()) {
      injectStyles();
      scheduleUpdate(0);
    } else {
      cleanupTorrentStyles();
    }
  }

  var tsUpdateTimer = null;
  function scheduleUpdate(delayMs) {
    if (!isStylesEnabled()) {
      cleanupTorrentStyles();
      return;
    }

    try {
      if (tsUpdateTimer) clearTimeout(tsUpdateTimer);
    } catch (e) { }

    var ms = typeof delayMs === 'number' ? delayMs : TH.debounce_ms;
    tsUpdateTimer = setTimeout(function () {
      tsUpdateTimer = null;
      updateTorrentStyles();
    }, ms);
  }

  function tsParseFloat(text) {
    var t = ((text || '') + '').trim();
    var m = t.match(/(\d+(?:[.,]\d+)?)/);
    return m ? (parseFloat(m[1].replace(',', '.')) || 0) : 0;
  }

  function tsParseInt(text) {
    var t = ((text || '') + '').trim();
    var v = parseInt(t, 10);
    return isNaN(v) ? 0 : v;
  }

  function tsApplyTier(el, classesToClear, classToAdd) {
    try {
      for (var i = 0; i < classesToClear.length; i++) el.classList.remove(classesToClear[i]);
      if (classToAdd) el.classList.add(classToAdd);
    } catch (e) { }
  }

  function tsParseSizeToGb(text) {
    try {
      var t = ((text || '') + '').replace(/\u00A0/g, ' ').trim();
      var m = t.match(/(\d+(?:[.,]\d+)?)\s*(kb|mb|gb|tb|кб|мб|гб|тб)/i);
      if (!m) return null;

      var num = parseFloat((m[1] || '0').replace(',', '.')) || 0;
      var unit = (m[2] || '').toLowerCase();
      var gb = 0;

      if (unit === 'tb' || unit === 'тб') gb = num * 1024;
      else if (unit === 'gb' || unit === 'гб') gb = num;
      else if (unit === 'mb' || unit === 'мб') gb = num / 1024;
      else if (unit === 'kb' || unit === 'кб') gb = num / (1024 * 1024);
      else gb = 0;

      return gb;
    } catch (e) {
      return null;
    }
  }

  function tsText(value) {
    return ((value || '') + '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tsCurrentOnlineSource() {
    var text = '';

    try {
      var visible = '';
      document.querySelectorAll('.filter--sort span, .filter--sort').forEach(function (el) {
        var t = tsText(el.textContent);
        if (t) visible += ' ' + t;
      });

      visible = tsText(visible);
      if (visible) return visible;
    } catch (e) { }

    try {
      if (typeof Lampa !== 'undefined' && Lampa.Storage) {
        text += ' ' + (Lampa.Storage.get('active_balanser', '') || '');
        text += ' ' + (Lampa.Storage.get('online_balanser', '') || '');
      }
    } catch (e) { }

    try {
      document.querySelectorAll('.filter--sort, .filter--sort span, .simple-button, .selector').forEach(function (el) {
        var t = tsText(el.textContent);
        if (/pidtor|jacktor|lme_jacktor/i.test(t)) text += ' ' + t;
      });
    } catch (e) { }

    return tsText(text);
  }

  function tsSourceLabel(text) {
    text = text || '';
    if (/jacktor|lme_jacktor/i.test(text)) return 'JackTor';
    if (/pidtor/i.test(text)) return 'PidTor';
    return '';
  }

  var TS_ONLINE_SOURCES = [
    ['kinoukr',      'KinoUkr',      true,  false],
    ['eneyida',      'Eneyida',      true,  false],
    ['klonfun',      'KlonFun',      true,  false],
    ['batkomakhno',  'BatkoMakhno',  true,  false],
    ['uaflix',       'UaFlix',       true,  false],
    ['uafilmme',     'UafilmME',     true,  false],
    ['uakino',       'UaKino',       true,  false],
    ['uafilm',       'UaFilm',       true,  false],
    ['filmix',       'Filmix',       false, false],
    ['spectre',      'Spectre',      false, true],
    ['mirage',       'Mirage',       false, true],
    ['zetflix',      'Zetflix',      false, false],
    ['phantom',      'Phantom',      false, true],
    ['rezka',        'Rezka',        false, false],
    ['collaps',      'Collaps',      false, false],
    ['videocdn',     'VideoCDN',     false, false],
    ['kodik',        'Kodik',        false, false],
    ['hdvb',         'HDVB',         false, false],
    ['ashdi',        'Ashdi',        false, false],
    ['alloha',       'Alloha',       false, false],
    ['bazon',        'Bazon',        false, false],
    ['lumex',        'Lumex',        false, false]
  ];

  function tsRegularSourceMeta(text) {
    text = (text || '').toLowerCase();
    if (tsSourceLabel(text)) return null;

    for (var i = 0; i < TS_ONLINE_SOURCES.length; i++) {
      if (text.indexOf(TS_ONLINE_SOURCES[i][0]) > -1) {
        return {
          source: TS_ONLINE_SOURCES[i][1],
          ua: TS_ONLINE_SOURCES[i][2],
          premium: TS_ONLINE_SOURCES[i][3] || /👑|💎/.test(text)
        };
      }
    }

    return null;
  }

  function tsCardBaseText(card) {
    var text = tsText(card.textContent);

    try {
      card.querySelectorAll('.ts-online-torrent-row, .ts-online-source-row').forEach(function (row) {
        var rowText = tsText(row.textContent);
        if (rowText) text = tsText(text.replace(rowText, ' '));
      });
    } catch (e) { }

    return text;
  }

  function tsNormalizeQuality(value) {
    value = (value || '').toLowerCase();
    if (!value) return '';
    if (value === '4k' || value === 'uhd') return '2160p';
    if (value === 'fhd') return '1080p';
    if (value === 'hd') return '720p';
    return value;
  }

  function tsExtractQuality(text) {
    var match = (text || '').match(/\b(2160p|1080p|720p|480p|4k|uhd|fhd|hd)\b/i);
    return match ? tsNormalizeQuality(match[1]) : '';
  }

  // ── HDR-тип ──
  function tsExtractHdrType(text) {
    text = text || '';
    if (/\b(dolby[\s._-]*vision|dovi|\bDV\b)/i.test(text)) {
      return { label: 'Dolby Vision', cls: 'ts-hdr-dv' };
    }
    if (/\bHDR10\+/i.test(text) || /\bHDR10PLUS\b/i.test(text)) {
      return { label: 'HDR10+', cls: 'ts-hdr-hdr10plus' };
    }
    if (/\bHDR10\b/i.test(text) || (/\bHDR\b/i.test(text) && !/hlg/i.test(text))) {
      return { label: 'HDR10', cls: 'ts-hdr-hdr10' };
    }
    if (/\bHLG\b/i.test(text)) {
      return { label: 'HLG', cls: 'ts-hdr-hlg' };
    }
    return null;
  }

  // ── Аудиоформат (существующий) ──
  function tsExtractAudioFormat(text) {
    text = text || '';
    if (/\batmos\b/i.test(text)) return { label: 'Atmos', cls: 'ts-audio-premium' };
    if (/\btruehd\b/i.test(text)) return { label: 'TrueHD', cls: 'ts-audio-premium' };
    if (/\bdts[\s._-]*hd[\s._-]*ma\b/i.test(text)) return { label: 'DTS-HD MA', cls: 'ts-audio-dts' };
    if (/\bdts[\s._-]*hd\b/i.test(text)) return { label: 'DTS-HD', cls: 'ts-audio-dts' };
    if (/\bdts\b/i.test(text)) return { label: 'DTS', cls: 'ts-audio-dts' };
    if (/\bflac\b/i.test(text)) return { label: 'FLAC', cls: 'ts-audio-flac' };
    if (/\b(eac3|e[\s._-]*ac[\s._-]*3|dd\+|ddplus)\b/i.test(text)) return { label: 'EAC3', cls: 'ts-audio-ac3' };
    if (/\b(ac3|dolby[\s._-]*digital)\b/i.test(text)) return { label: 'AC3', cls: 'ts-audio-ac3' };
    if (/\baac\b/i.test(text)) return { label: 'AAC', cls: 'ts-audio-aac' };
    return null;
  }

  function tsAppendCodecBadges(row, text) {
    var hdr = tsExtractHdrType(text);
    if (hdr) {
      var hdrChip = document.createElement('span');
      hdrChip.className = 'ts-hdr-badge ' + hdr.cls;
      hdrChip.textContent = hdr.label;
      row.appendChild(hdrChip);
    }

    var audio = tsExtractAudioFormat(text);
    if (audio) {
      var audioChip = document.createElement('span');
      audioChip.className = 'ts-audio-badge ' + audio.cls;
      audioChip.textContent = audio.label;
      row.appendChild(audioChip);
    }
  }

  // ══════════════════════════════════════════════
  // ── NUVIO BADGES ──
  // ══════════════════════════════════════════════

  // Стриминговый сервис
  function tsExtractStreamingService(text) {
    text = text || '';
    if (/\b(nflx|nf|netflix)\b/i.test(text)) return { label: 'NETFLIX', cls: 'ts-stream-netflix' };
    if (/\b(amzn|amazon(?:\s*prime)?|prime\s*video)\b/i.test(text)) return { label: 'PRIME', cls: 'ts-stream-prime' };
    if (/\b(atvp|appletv|apple\s*tv)\b/i.test(text)) return { label: 'APPLE TV+', cls: 'ts-stream-atvp' };
    if (/\b(dsnp|dsny|disney(?:\+)?)\b/i.test(text)) return { label: 'DISNEY+', cls: 'ts-stream-disney' };
    if (/\b(hmax|hbomax|hbo\s*max)\b/i.test(text)) return { label: 'MAX', cls: 'ts-stream-max' };
    if (/\bhulu\b/i.test(text)) return { label: 'HULU', cls: 'ts-stream-hulu' };
    if (/\b(pcok|peacock)\b/i.test(text)) return { label: 'PEACOCK', cls: 'ts-stream-peacock' };
    if (/\b(pmtp|pamp|paramount\+)\b/i.test(text) || /\bparamount\b/i.test(text)) return { label: 'PARAMOUNT+', cls: 'ts-stream-paramount' };
    if (/\b(crunchyroll|crunchy|croll)\b/i.test(text)) return { label: 'CRUNCHYROLL', cls: 'ts-stream-croll' };
    if (/\bcrave\b/i.test(text)) return { label: 'CRAVE', cls: 'ts-stream-crave' };
    return null;
  }

  // Уровень релиза (WEB-DL / BLU-RAY / REMUX)
  function tsExtractReleaseTier(text) {
    text = text || '';
    if (/\bremux\b/i.test(text)) return { label: 'REMUX', cls: 'ts-tier-remux' };
    if (/\b(blu[\s._-]?ray|bluray|bdrip|bdmux)\b/i.test(text)) return { label: 'BLU-RAY', cls: 'ts-tier-bluray' };
    if (/\b(web[\s._-]?dl|webdl)\b/i.test(text)) return { label: 'WEB-DL', cls: 'ts-tier-web' };
    if (/\b(webrip|web[\s._-]?rip)\b/i.test(text)) return { label: 'WEBRip', cls: 'ts-tier-web' };
    return null;
  }

  // Видеокодек
  function tsExtractVideoCodec(text) {
    text = text || '';
    if (/\b(h\.?265|x265|hevc)\b/i.test(text)) return { label: 'HEVC', cls: 'ts-codec-hevc' };
    if (/\b(h\.?264|x264|avc)\b/i.test(text)) return { label: 'AVC', cls: 'ts-codec-avc' };
    return null;
  }

  // Битовая глубина
  function tsExtractBitDepth(text) {
    text = text || '';
    if (/\b(10[\s._-]?bit|10b|hi10p)\b/i.test(text)) return { label: '10-bit', cls: 'ts-depth-10bit' };
    if (/\b(8[\s._-]?bit|8b)\b/i.test(text)) return { label: '8-bit', cls: 'ts-depth-8bit' };
    return null;
  }

  // Аудиоканалы
  function tsExtractChannels(text) {
    text = text || '';
    if (/[^0-9][7-8][. ][01](?![0-9])/.test(text)) return { label: '7.1', cls: 'ts-ch-71' };
    if (/[^0-9]6[ .][01](?![0-9])/.test(text)) return { label: '6.1', cls: 'ts-ch-61' };
    if (/[^0-9]5[ .][01](?![0-9])/.test(text)) return { label: '5.1', cls: 'ts-ch-51' };
    if (/[^0-9]2\.[01](?![0-9])/.test(text)) return { label: '2.0', cls: 'ts-ch-20' };
    return null;
  }

  // Доп. аудиоформаты (не покрытые tsExtractAudioFormat: OPUS, MP3, PCM)
  function tsExtractExtraAudio(text) {
    text = text || '';
    if (/\bopus\b/i.test(text)) return { label: 'OPUS', cls: 'ts-audio-opus' };
    if (/\bmp3\b/i.test(text)) return { label: 'MP3', cls: 'ts-audio-mp3' };
    if (/\b(?:pcm|lpcm)\b/i.test(text)) return { label: 'PCM', cls: 'ts-audio-pcm' };
    return null;
  }

  // Специальные теги (SEADEX, Director's Cut и пр.)
  function tsExtractSpecialTag(text) {
    text = text || '';
    if (/\bseadex\b/i.test(text)) return { label: 'SEADEX', cls: 'ts-tag-seadex' };
    if (/\bdirector'?s?[\s._-]?cut\b|\bdircut\b/i.test(text)) return { label: 'DIR CUT', cls: 'ts-tag-dircut' };
    if (/\bextended(?:[\s._-]?(?:cut|edition))?\b|\bext[\s._-]?cut\b/i.test(text)) return { label: 'EXTENDED', cls: 'ts-tag-extended' };
    if (/\btrue[\s._-]?hue\b/i.test(text)) return { label: 'TRUE-HUE', cls: 'ts-tag-truehue' };
    if (/\bauthentic[\s._-]?(?:bw|black(?:[\s._-]?(?:and|&)[\s._-]?white)?)\b/i.test(text)) return { label: 'B&W', cls: 'ts-tag-bw' };
    return null;
  }

  // Добавляет все Nuvio бейджи в строку на основе текста
  function tsAppendNuvioBadges(row, text) {
    var chip;

    var tag = tsExtractSpecialTag(text);
    if (tag) {
      chip = document.createElement('span');
      chip.className = 'ts-nuvio-badge ' + tag.cls;
      chip.textContent = tag.label;
      row.appendChild(chip);
    }

    var stream = tsExtractStreamingService(text);
    if (stream) {
      chip = document.createElement('span');
      chip.className = 'ts-nuvio-badge ' + stream.cls;
      chip.textContent = stream.label;
      row.appendChild(chip);
    }

    var tier = tsExtractReleaseTier(text);
    if (tier) {
      chip = document.createElement('span');
      chip.className = 'ts-nuvio-badge ' + tier.cls;
      chip.textContent = tier.label;
      row.appendChild(chip);
    }

    var codec = tsExtractVideoCodec(text);
    if (codec) {
      chip = document.createElement('span');
      chip.className = 'ts-nuvio-badge ' + codec.cls;
      chip.textContent = codec.label;
      row.appendChild(chip);
    }

    var depth = tsExtractBitDepth(text);
    if (depth) {
      chip = document.createElement('span');
      chip.className = 'ts-nuvio-badge ' + depth.cls;
      chip.textContent = depth.label;
      row.appendChild(chip);
    }

    var ch = tsExtractChannels(text);
    if (ch) {
      chip = document.createElement('span');
      chip.className = 'ts-nuvio-badge ' + ch.cls;
      chip.textContent = ch.label;
      row.appendChild(chip);
    }

    var extraAudio = tsExtractExtraAudio(text);
    if (extraAudio) {
      chip = document.createElement('span');
      chip.className = 'ts-nuvio-badge ' + extraAudio.cls;
      chip.textContent = extraAudio.label;
      row.appendChild(chip);
    }
  }

  // ══════════════════════════════════════════════
  // ── Конец NUVIO BADGES ──
  // ══════════════════════════════════════════════

  function tsCompatibility(text) {
    text = text || '';

    var isH264 = /\b(h\.?264|x264|avc)\b/i.test(text);
    var isH265 = /\b(h\.?265|x265|hevc)\b/i.test(text);
    var isSdr = /\bsdr\b/i.test(text);
    var is2160 = /\b(2160p|4k|uhd)\b/i.test(text);
    var hasHdr = /\b(hdr10\+?|hdr|hlg|dolby\s*vision|dv|10-?bit|yuv420p10)\b/i.test(text);
    var hasHardAudio = /\b(dts|truehd|atmos|flac|opus|e-?ac-?3)\b/i.test(text);

    if (hasHdr || hasHardAudio) {
      return {
        label: 'Может не играть',
        cls: 'ts-compat-bad',
        reason: hasHdr
          ? 'HDR/Dolby Vision/10-bit часто не поддерживается системными плеерами'
          : 'DTS/TrueHD/Atmos/FLAC/EAC3 часто не поддерживается системными плеерами'
      };
    }

    if (isH265 || is2160) {
      return {
        label: 'Риск',
        cls: 'ts-compat-warn',
        reason: isH265
          ? 'H.265/HEVC может не воспроизводиться на некоторых телевизорах'
          : '2160p может быть тяжёлым для системного плеера'
      };
    }

    if ((isH264 && isSdr) || (isSdr && !isH265)) {
      return {
        label: 'Совместимо',
        cls: 'ts-compat-good',
        reason: 'SDR/H.264 или простой SDR обычно совместим с системными плеерами'
      };
    }

    return null;
  }

  function tsAppendCompatibility(row, text) {
    var compat = tsCompatibility(text);
    if (!compat) return;

    var chip = document.createElement('span');
    chip.className = 'ts-online-compat ' + compat.cls;
    chip.textContent = compat.label;
    chip.title = compat.reason;
    row.appendChild(chip);
  }

  function tsVisible(el) {
    try {
      if (!el) return false;
      var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
      if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) return false;
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    } catch (e) {
      return true;
    }
  }

  function tsMovieObjectMeta() {
    var result = {};

    function readMovie(obj, depth) {
      if (!obj || depth > 3) return;

      var movie = obj.movie || obj.card || obj.data || obj.object || obj;
      var rating = movie.vote_average || movie.vote || movie.rating || movie.rate || movie.r_themovie;
      if (!result.rating && rating) {
        var value = parseFloat((rating + '').replace(',', '.'));
        if (value > 0 && value <= 10) result.rating = value.toFixed(1);
      }

      var age = movie.pg || movie.age || movie.certification || movie.mpaa || movie.content_rating;
      if (!result.age && age && /^\d{1,2}\+$/.test((age + '').trim())) result.age = (age + '').trim();

      if (!result.rating || !result.age) {
        readMovie(movie.movie, depth + 1);
        readMovie(movie.card, depth + 1);
      }
    }

    try {
      if (typeof Lampa !== 'undefined' && Lampa.Activity && typeof Lampa.Activity.active === 'function') {
        readMovie(Lampa.Activity.active(), 0);
      }
    } catch (e) { }

    return result;
  }

  function tsMovieDomMeta() {
    var meta = tsMovieObjectMeta();

    try {
      if (!meta.rating) {
        document.querySelectorAll('.full-start .info__rate span, .info__rate span').forEach(function (el) {
          if (meta.rating || !tsVisible(el)) return;
          var text = tsText(el.textContent);
          var match = text.match(/^(\d+(?:[.,]\d+)?)$/);
          if (!match) return;

          var value = parseFloat(match[1].replace(',', '.'));
          if (value > 0 && value <= 10) meta.rating = value.toFixed(1);
        });
      }

      if (!meta.age) {
        document.querySelectorAll('.full-start span, .full-start div, .full-descr span, .full-descr div, .activity__body span, .activity__body div').forEach(function (el) {
          if (meta.age || !tsVisible(el)) return;
          if (el.querySelector && el.querySelector('*')) return;

          var text = tsText(el.textContent);
          if (/^\d{1,2}\+$/.test(text)) meta.age = text;
        });
      }
    } catch (e) { }

    return meta;
  }

  function tsAppendMovieBadges(row) {
    var meta = tsMovieDomMeta();

    if (meta.rating) {
      var rating = document.createElement('span');
      rating.className = 'ts-online-movie-chip ts-movie-rating';
      rating.textContent = '★ ' + meta.rating;
      row.appendChild(rating);
    }

    if (meta.age) {
      var age = document.createElement('span');
      age.className = 'ts-online-movie-chip ts-movie-age';
      age.textContent = meta.age;
      row.appendChild(age);
    }
  }

  function tsParseOnlineMeta(card, sourceText) {
    var info = tsText(card.querySelector('.online-prestige__info') ? card.querySelector('.online-prestige__info').textContent : '');
    var qualityText = tsText(card.querySelector('.online-prestige__quality') ? card.querySelector('.online-prestige__quality').textContent : '');
    var title = tsText(card.querySelector('.online-prestige__title') ? card.querySelector('.online-prestige__title').textContent : '');
    var full = tsText([title, info, qualityText].join(' / '));
    var sourceLabel = tsSourceLabel(sourceText);

    if (!sourceLabel) return null;

    var seedsMatch = full.match(/(?:↑|в†')\s*(\d+)/i) || full.match(/\/\s*(\d+)\s*$/);
    var peersMatch = full.match(/(?:↓|в†")\s*(\d+)/i);
    var sizeMatch = full.match(/(\d+(?:[.,]\d+)?)\s*(TB|GB|MB|KB|ТБ|ГБ|МБ|КБ|РўР'|Р"Р'|РњР'|РљР')/i);
    var qualityMatch = full.match(/\b(2160p|1080p|720p|480p)\b/i) || qualityText.match(/\b(2160|1080|720|480)\b/);
    var trackerMatch = full.match(/\b(toloka|mazepa|rutracker|kinozal|nnm|selezen|megapeer|lostfilm|anilibria|rustorka|rutor|nnmclub|animelayer|torrentby|kinozalme|tpb)\b/i);

    if (!sourceLabel && !seedsMatch && !sizeMatch && !trackerMatch) return null;

    return {
      source: sourceLabel,
      tracker: trackerMatch ? trackerMatch[1] : '',
      quality: qualityMatch ? (qualityMatch[1].toLowerCase().indexOf('p') > -1 ? qualityMatch[1] : qualityMatch[1] + 'p') : '',
      seeds: seedsMatch ? seedsMatch[1] : '',
      peers: peersMatch ? peersMatch[1] : '',
      size: sizeMatch ? (sizeMatch[1].replace('.', ',') + ' ' + sizeMatch[2].toUpperCase()) : '',
      full: full
    };
  }

  function tsParseRegularOnlineMeta(card, sourceText) {
    // Торрент-агрегатори обробляє tsAdaptOnlineTorrentCards — пропускаємо
    if (tsSourceLabel(sourceText)) return null;

    var info = tsText(card.querySelector('.online-prestige__info') ? card.querySelector('.online-prestige__info').textContent : '');
    var qualityText = tsText(card.querySelector('.online-prestige__quality') ? card.querySelector('.online-prestige__quality').textContent : '');
    var title = tsText(card.querySelector('.online-prestige__title') ? card.querySelector('.online-prestige__title').textContent : '');
    var full = tsText([sourceText, title, info, qualityText].join(' / '));

    var source = tsRegularSourceMeta(sourceText);

    if (source) {
      return {
        source: source.source,
        ua: source.ua || /укра|ukr| ua |🇺🇦/i.test(full),
        premium: source.premium || /👑|💎/.test(full),
        quality: tsExtractQuality(full),
        full: full
      };
    }

    // Невпізнане джерело — все одно намагаємося витягнути корисні мета-дані
    var fallbackQuality = tsExtractQuality(full);
    var hasHdr = !!tsExtractHdrType(full);
    var hasAudio = !!tsExtractAudioFormat(full);
    var hasStream = !!tsExtractStreamingService(full);
    var hasTier = !!tsExtractReleaseTier(full);
    var hasCodec = !!tsExtractVideoCodec(full);

    // Не додаємо рядок якщо взагалі нічого не знайдено
    if (!fallbackQuality && !hasHdr && !hasAudio && !hasStream && !hasTier && !hasCodec) return null;

    return {
      source: '',
      ua: /укра|ukr|\bua\b|🇺🇦/i.test(full),
      premium: /👑|💎/.test(full),
      quality: fallbackQuality,
      full: full
    };
  }

  function tsAddBadge(row, className, label, value) {
    if (value === undefined || value === null || value === '') return;

    var wrap = document.createElement('span');
    wrap.className = className + ' ts-online-field';
    wrap.appendChild(document.createTextNode(label + ' '));

    var span = document.createElement('span');
    span.textContent = value;
    wrap.appendChild(span);

    row.appendChild(wrap);
  }

  function tsAdaptOnlineTorrentCards() {
    try {
      var sourceText = tsCurrentOnlineSource();

      document.querySelectorAll('.online-prestige.online-prestige--full').forEach(function (card) {
        var footer = card.querySelector('.online-prestige__footer');
        if (!footer) return;

        var signature = TS_ROW_VERSION + '|' + tsCardBaseText(card) + '|' + sourceText;
        if (card.getAttribute('data-ts-online-signature') === signature) return;

        var old = card.querySelector('.ts-online-torrent-row');
        if (old && old.parentNode) old.parentNode.removeChild(old);

        var meta = tsParseOnlineMeta(card, sourceText);
        if (!meta) {
          card.classList.remove('ts-online-torrent');
          card.removeAttribute('data-ts-online-signature');
          return;
        }

        var row = document.createElement('div');
        row.className = 'ts-online-torrent-row';

        if (meta.tracker) {
          var tracker = document.createElement('span');
          tracker.className = 'ts-online-torrent-tracker';
          tracker.textContent = meta.tracker;
          row.appendChild(tracker);
        }

        if (meta.quality) {
          var quality = document.createElement('span');
          quality.className = 'ts-online-torrent-quality';
          quality.textContent = meta.quality;
          row.appendChild(quality);
        }

        tsAppendCompatibility(row, meta.full);
        tsAppendCodecBadges(row, meta.full);
        tsAppendNuvioBadges(row, meta.full);
        tsAppendMovieBadges(row);

        tsAddBadge(row, 'torrent-item__seeds', '↑', meta.seeds);
        tsAddBadge(row, 'torrent-item__grabs', '↓', meta.peers);

        if (meta.size) {
          var size = document.createElement('span');
          size.className = 'torrent-item__size ts-online-field';
          size.textContent = meta.size;
          row.appendChild(size);
        }

        if (row.children.length === 0) return;

        card.classList.add('ts-online-torrent');
        footer.appendChild(row);
        card.setAttribute('data-ts-online-signature', signature);
      });
    } catch (e) {
      console.error(config.name, 'ошибка адаптации торрент-карточек:', e);
    }
  }

  function tsAppendSourceChip(row, text, extraClass) {
    if (!text) return;

    var chip = document.createElement('span');
    chip.className = 'ts-online-source-chip' + (extraClass ? ' ' + extraClass : '');
    chip.textContent = text;
    row.appendChild(chip);
  }

  function tsRemoveOldSourceNameChips(scope) {
    try {
      (scope || document).querySelectorAll('.ts-online-source-row .ts-online-source-chip:not(.ts-source-ua):not(.ts-source-quality):not(.ts-source-premium)').forEach(function (chip) {
        if (chip && chip.parentNode) chip.parentNode.removeChild(chip);
      });
    } catch (e) { }
  }

  function tsAdaptRegularOnlineCards() {
    try {
      var sourceText = tsCurrentOnlineSource();
      tsRemoveOldSourceNameChips(document);

      document.querySelectorAll('.online-prestige.online-prestige--full').forEach(function (card) {
        var footer = card.querySelector('.online-prestige__footer');
        if (!footer) return;

        var signature = TS_ROW_VERSION + '|' + tsCardBaseText(card) + '|' + sourceText;
        tsRemoveOldSourceNameChips(card);
        if (card.getAttribute('data-ts-source-signature') === signature) return;

        var old = card.querySelector('.ts-online-source-row');
        if (old && old.parentNode) old.parentNode.removeChild(old);

        var meta = tsParseRegularOnlineMeta(card, sourceText);
        if (!meta) {
          card.classList.remove('ts-online-source');
          card.removeAttribute('data-ts-source-signature');
          return;
        }

        var row = document.createElement('div');
        row.className = 'ts-online-source-row';

        if (meta.ua) tsAppendSourceChip(row, 'UA', 'ts-source-ua');
        if (meta.quality) tsAppendSourceChip(row, meta.quality, 'ts-source-quality');
        if (meta.premium) tsAppendSourceChip(row, 'VIP', 'ts-source-premium');
        tsAppendCompatibility(row, meta.full);
        tsAppendCodecBadges(row, meta.full);
        tsAppendNuvioBadges(row, meta.full);
        tsAppendMovieBadges(row);

        card.classList.add('ts-online-source');
        footer.appendChild(row);
        card.setAttribute('data-ts-source-signature', signature);
      });
    } catch (e) {
      console.error(config.name, 'ошибка адаптации онлайн-источников:', e);
    }
  }

  // ── Попап с названием торрента ──
  function tsShowTorrentPopup(name) {
    try {
      var existing = document.querySelector('.ts-popup-overlay');
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

      var overlay = document.createElement('div');
      overlay.className = 'ts-popup-overlay';

      var popup = document.createElement('div');
      popup.className = 'ts-popup';

      // Цветная полоска сверху
      var accent = document.createElement('div');
      accent.className = 'ts-popup-accent';
      popup.appendChild(accent);

      // Шапка
      var header = document.createElement('div');
      header.className = 'ts-popup-header';

      var icon = document.createElement('span');
      icon.className = 'ts-popup-icon';
      icon.textContent = '📋';

      var title = document.createElement('span');
      title.className = 'ts-popup-title';
      title.textContent = 'Название торрента';

      header.appendChild(icon);
      header.appendChild(title);
      popup.appendChild(header);

      // Тело
      var body = document.createElement('div');
      body.className = 'ts-popup-body';

      var nameEl = document.createElement('div');
      nameEl.className = 'ts-popup-name';
      nameEl.textContent = name;
      body.appendChild(nameEl);

      var hint = document.createElement('div');
      hint.className = 'ts-popup-hint';
      hint.textContent = 'Нажмите «Скопировать» или выделите текст вручную';
      body.appendChild(hint);

      popup.appendChild(body);

      // Подвал с кнопками
      var footer = document.createElement('div');
      footer.className = 'ts-popup-footer';

      var closeBtn = document.createElement('button');
      closeBtn.className = 'ts-popup-btn ts-btn-close';
      closeBtn.textContent = 'Закрыть';

      var copyBtn = document.createElement('button');
      copyBtn.className = 'ts-popup-btn ts-btn-copy';
      copyBtn.textContent = '📋 Скопировать';

      footer.appendChild(closeBtn);
      footer.appendChild(copyBtn);
      popup.appendChild(footer);
      overlay.appendChild(popup);
      document.body.appendChild(overlay);

      function closePopup() {
        try {
          overlay.style.animation = 'ts-popup-out 0.20s ease forwards';
          popup.style.animation = 'ts-popup-out 0.20s cubic-bezier(0.36, 0, 0.66, -0.56) forwards';
          setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          }, 220);
        } catch (e) {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }
      }

      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closePopup();
      });

      copyBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        tsCopyToClipboard(name, function (ok) {
          if (ok) {
            copyBtn.textContent = '✓ Скопировано!';
            copyBtn.classList.add('ts-copied');
            hint.textContent = 'Текст скопирован в буфер обмена';
            setTimeout(function () {
              copyBtn.textContent = '📋 Скопировать';
              copyBtn.classList.remove('ts-copied');
            }, 2200);
          }
        });
      });

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closePopup();
      });

      document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
          document.removeEventListener('keydown', onKey);
          closePopup();
        }
      });
    } catch (e) {
      console.error(config.name, 'ошибка попапа:', e);
    }
  }

  function tsCopyToClipboard(text, callback) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          callback && callback(true);
        }, function () {
          tsCopyFallback(text, callback);
        });
        return;
      }
    } catch (e) { }
    tsCopyFallback(text, callback);
  }

  function tsCopyFallback(text, callback) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      callback && callback(ok);
    } catch (e) {
      callback && callback(false);
    }
  }

  function tsCopyTorrentName(name, btn) {
    tsCopyToClipboard(name, function (ok) {
      if (ok) {
        var prev = btn.textContent;
        btn.textContent = '✓';
        btn.classList.add('ts-copied');
        setTimeout(function () {
          btn.textContent = prev;
          btn.classList.remove('ts-copied');
        }, 2000);
      } else {
        tsShowTorrentPopup(name);
      }
    });
  }

  // ── Nuvio бейджи для списка торрентов ──
  function tsAdaptTorrentNuvioBadges() {
    try {
      document.querySelectorAll('.torrent-item').forEach(function (item) {
        var titleText = '';

        var titleEl = item.querySelector('.torrent-item__title') ||
                      item.querySelector('.torrent-item__name') ||
                      item.querySelector('.title');

        if (titleEl) {
          titleText = tsText(titleEl.textContent);
        } else {
          var clone = item.cloneNode(true);
          clone.querySelectorAll('.torrent-item__seeds, .torrent-item__grabs, .torrent-item__bitrate, .torrent-item__size, .ts-nuvio-torrent-row').forEach(function (el) {
            if (el.parentNode) el.parentNode.removeChild(el);
          });
          titleText = tsText(clone.textContent);
        }

        if (!titleText) return;

        var signature = TS_ROW_VERSION + '|' + titleText;
        if (item.getAttribute('data-ts-nuvio-sig') === signature) return;

        var old = item.querySelector('.ts-nuvio-torrent-row');
        if (old && old.parentNode) old.parentNode.removeChild(old);

        var row = document.createElement('div');
        row.className = 'ts-nuvio-torrent-row';

        tsAppendNuvioBadges(row, titleText);
        tsAppendCodecBadges(row, titleText);

        // Кнопка копирования — всегда, даже без бейджей
        var copyBtn = document.createElement('button');
        copyBtn.className = 'ts-copy-btn';
        copyBtn.textContent = '📋';
        copyBtn.title = 'Скопировать название торрента';

        (function (n, b) {
          b.addEventListener('click', function (e) {
            e.stopPropagation();
            tsCopyTorrentName(n, b);
          });
        }(titleText, copyBtn));

        row.appendChild(copyBtn);

        item.setAttribute('data-ts-nuvio-sig', signature);
        item.appendChild(row);
      });
    } catch (e) {
      console.error(config.name, 'ошибка Nuvio бейджей для торрентов:', e);
    }
  }

  function updateTorrentStyles() {
    try {
      if (!isStylesEnabled()) {
        cleanupTorrentStyles();
        return;
      }

      tsAdaptOnlineTorrentCards();
      tsAdaptRegularOnlineCards();
      tsAdaptTorrentNuvioBadges();

      document.querySelectorAll('.torrent-item__seeds span').forEach(function (span) {
        var value = tsParseInt(span.textContent);
        span.classList.add('ts-seeds');

        var seedTier = '';
        if (value < TH.seeds.danger_below) seedTier = 'low-seeds';
        else if (value >= TH.seeds.top_from) seedTier = 'high-seeds';
        else if (value >= TH.seeds.good_from) seedTier = 'good-seeds';
        tsApplyTier(span, ['low-seeds', 'good-seeds', 'high-seeds'], seedTier);
      });

      document.querySelectorAll('.torrent-item__bitrate span').forEach(function (span) {
        var value = tsParseFloat(span.textContent);
        span.classList.add('ts-bitrate');

        var brTier = '';
        if (value > TH.bitrate.danger_from) brTier = 'very-high-bitrate';
        else if (value >= TH.bitrate.warn_from) brTier = 'high-bitrate';
        tsApplyTier(span, ['high-bitrate', 'very-high-bitrate'], brTier);
      });

      document.querySelectorAll('.torrent-item__grabs span').forEach(function (span) {
        var value = tsParseInt(span.textContent);
        span.classList.add('ts-grabs');
        tsApplyTier(span, ['high-grabs'], value > 10 ? 'high-grabs' : '');
      });

      document.querySelectorAll('.torrent-item__size').forEach(function (el) {
        var text = (el.textContent || '');
        el.classList.add('ts-size');

        var gb = tsParseSizeToGb(text);
        if (gb === null) {
          tsApplyTier(el, ['mid-size', 'high-size', 'top-size'], '');
          return;
        }

        var szTier = '';
        if (gb > TH.size.top_from_gb) szTier = 'top-size';
        else if (gb >= TH.size.high_from_gb) szTier = 'high-size';
        else if (gb >= TH.size.mid_from_gb) szTier = 'mid-size';
        tsApplyTier(el, ['mid-size', 'high-size', 'top-size'], szTier);
      });
    } catch (e) {
      console.error(config.name, 'ошибка обновления стилей:', e);
    }
  }

  function observeDom() {
    try {
      var observer = new MutationObserver(function (mutations) {
        var needsUpdate = false;
        for (var i = 0; i < mutations.length; i++) {
          var mutation = mutations[i];
          if (mutation.addedNodes && mutation.addedNodes.length) {
            needsUpdate = true;
            break;
          }
          if (mutation.type === 'characterData' ||
            (mutation.type === 'childList' && mutation.target &&
              (mutation.target.classList &&
                (mutation.target.classList.contains('torrent-item__bitrate') ||
                  mutation.target.classList.contains('torrent-item__seeds') ||
                  mutation.target.classList.contains('torrent-item__grabs') ||
                  mutation.target.classList.contains('torrent-item__size'))))) {
            needsUpdate = true;
            break;
          }
        }
        if (needsUpdate) scheduleUpdate();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      scheduleUpdate(0);
    } catch (e) {
      console.error(config.name, 'ошибка наблюдателя DOM:', e);
      scheduleUpdate(0);
    }
  }

  function registerPlugin() {
    try {
      if (typeof Lampa !== 'undefined') {
        Lampa.Manifest = Lampa.Manifest || {};
        Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};

        Lampa.Manifest.plugins[config.pluginId] = {
          type: 'other',
          name: config.name,
          version: config.version,
          description: 'Дополнительные стили для карточек торрентов и онлайн-источников. Nuvio-бейджи.'
        };
      }
    } catch (e) {
      console.error(config.name, 'ошибка регистрации плагина:', e);
    } finally {
      window['plugin_' + config.pluginId + '_ready'] = true;
    }
  }

  function registerSettings() {
    try {
      if (!window.Lampa || !Lampa.SettingsApi || window.torrent_styles_mod_settings_added)
        return false;

      window.torrent_styles_mod_settings_added = true;

      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
          name: TS_ENABLED_KEY,
          type: 'trigger',
          "default": false
        },
        field: { name: 'Стиль отображения онлайн/торрентов' },
        onChange: function () {
          setTimeout(applyStyleState, 50);
        }
      });

      return true;
    } catch (e) {
      console.error(config.name, 'ошибка настроек:', e);
      return false;
    }
  }

  function initSettings() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (registerSettings() || tries > 80)
        clearInterval(timer);
    }, 400);
  }

  function init() {
    initSettings();
    observeDom();
    applyStyleState();

    if (window.appready) {
      registerPlugin();
      applyStyleState();
    } else if (typeof Lampa !== 'undefined' && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
          registerPlugin();
          initSettings();
          applyStyleState();
        }
      });
    } else {
      setTimeout(registerPlugin, 500);
    }

    console.log(config.name, 'Плагин загружен, версия:', config.version);
  }

  init();

})();
