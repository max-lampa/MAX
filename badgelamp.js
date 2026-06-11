(function () {
    'use strict';

    var PLUGIN_NAME = 'NuvioBadges';
    var STORAGE_PREFIX = 'nuvio_badge_';

    // ─────────────────────────────────────────────
    // FULL BADGE DATA (Nuvio_badges.json embedded)
    // ─────────────────────────────────────────────
    var BADGE_GROUPS = [
        { id: 'gst',         name: 'Special Tags',  borderColor: '#FF6A1B9A' },
        { id: 'gs',          name: 'Streaming',     borderColor: '#FF546E7A' },
        { id: 'gms',         name: 'Tiers',         borderColor: '#FF1565C0' },
        { id: 'gq',          name: 'Quality',       borderColor: '#FF27C04F' },
        { id: 'grl',         name: 'Release',       borderColor: '#FF5C6B76' },
        { id: 'gr',          name: 'Resolution',    borderColor: '#FF27C04F' },
        { id: 'gv',          name: 'Visual',        borderColor: '#FFFFD54F' },
        { id: 'ga',          name: 'Audio',         borderColor: '#FFFFFFFF' },
        { id: 'gc',          name: 'Channels',      borderColor: '#FFFFFFFF' },
        { id: 'gl',          name: 'Language',      borderColor: '#FFFFFFFF' },
        { id: 'source',      name: 'Source',        borderColor: '#FFCC0000' },
        { id: 'video-codec', name: 'Video Codec',   borderColor: '#FFCC0000' },
        { id: 'bit-depth',   name: 'Bit Depth',     borderColor: '#FFCC0000' }
    ];

    var BADGES = [
        // ── Special Tags ─────────────────────────────────────────────────────────
        { id: 'seadex-release',       groupId: 'gst', name: 'SEADEX',       imageURL: 'https://i.postimg.cc/rwh87wwK/SEADEX.png',         borderColor: '#FF6A1B9A', pattern: '(?i)(?:\\u200b\\u200c\\u200d|\\b(?:seadex|best[\\s._-]?release|alt[\\s._-]?(?:best[\\s._-]?)?release)\\b|ᴀʟᴛ[\\s._-]?ʙᴇsᴛ[\\s._-]?ʀᴇʟᴇᴀsᴇ|ᴀʟᴛ[\\s._-]?ʀᴇʟᴇᴀsᴇ|ʙᴇsᴛ[\\s._-]?ʀᴇʟᴇᴀsᴇ)' },
        { id: 'edition-directors-cut',groupId: 'gst', name: 'DIR CUT',      imageURL: 'https://files.catbox.moe/tkmx9b.png',              borderColor: '#FF5C6BC0', pattern: "(?i)(?:\\u206c|\\bDirector'?s?[\\s._-]?Cut|Director\\.Cut|DIRCUT\\b)" },
        { id: 'edition-extended',     groupId: 'gst', name: 'EXTENDED',     imageURL: 'https://files.catbox.moe/jcitjs.png',              borderColor: '#FF00897B', pattern: '(?i)(?!.*\\bExtended\\s+Clip\\b)(?!.*\\bExtended[\\s._-]+Mix\\b)(?:\\u206d|\\bExtended(?:[\\s._-]?(?:Cut|Edition))?|EXT[\\s._-]?CUT\\b)' },
        { id: 'edition-true-hue',     groupId: 'gst', name: 'TRUE-HUE',     imageURL: 'https://files.catbox.moe/7ke924.png',              borderColor: '#FFE65100', pattern: '(?i)(?:\\u206a|\\bTrue[\\s._-]?Hue(?:[\\s._-]?(?:Full[\\s._-]?)?Color)?|True\\.Hue\\b)' },
        { id: 'edition-bw',           groupId: 'gst', name: 'B&W',          imageURL: 'https://files.catbox.moe/j1jy8z.png',              borderColor: '#FF757575', pattern: '(?i)(?!.*\\bTrue[\\s._-]?Hue(?:[\\s._-]?(?:Full[\\s._-]?)?Color)?|True\\.Hue\\b)(?:\\u206b|\\bAuthentic[\\s._-]?(?:BW|Black(?:[\\s._-]?(?:and|&)[\\s._-]?White)?)|Authentic\\.BW|Black[\\s._-]?and[\\s._-]?White\\b)' },

        // ── Streaming ────────────────────────────────────────────────────────────
        { id: 'gs-crave',  groupId: 'gs', name: 'CRAVE',       imageURL: 'https://i.postimg.cc/T3KcYCm7/CRAVE.png',          borderColor: '#8088ff',   pattern: '(?i)\\bcrave\\b' },
        { id: 's-nflx',    groupId: 'gs', name: 'NETFLIX',     imageURL: 'https://files.catbox.moe/2x5m84.png',              borderColor: '#FFE50914', pattern: '(?i)(?:⁠⁡|\\b(?:nflx|nf|netflix)\\b)' },
        { id: 's-amzn',    groupId: 'gs', name: 'PRIME',       imageURL: 'https://files.catbox.moe/d6gao4.png',              borderColor: '#FF00A8E1', pattern: '(?i)(?:⁠⁢|\\b(?:amzn|amazon(?:\\s*prime)?|prime\\s*video)\\b)' },
        { id: 's-atvp',    groupId: 'gs', name: 'APPLE TV+',   imageURL: 'https://files.catbox.moe/67jwoj.png',              borderColor: '#FF000000', pattern: '(?i)(?:⁠⁣|\\b(?:atvp|appletv|apple\\s*tv)\\b)' },
        { id: 's-dsnp',    groupId: 'gs', name: 'DISNEY+',     imageURL: 'https://files.catbox.moe/8x6cp2.png',              borderColor: '#FF00C7DC', pattern: '(?i)(?:⁠⁤|\\b(?:dsnp|dsny|disney|disney\\+)\\b)' },
        { id: 's-hmax',    groupId: 'gs', name: 'MAX',         imageURL: 'https://files.catbox.moe/pq4et5.png',              borderColor: '#FFB100FF', pattern: '(?i)(?:⁠⁥|\\b(?:hmax|hbomax|hbo\\s*max)\\b)' },
        { id: 's-hulu',    groupId: 'gs', name: 'HULU',        imageURL: 'https://files.catbox.moe/tgdp1c.png',              borderColor: '#FF1CE783', pattern: '(?i)(?:⁠⁦|\\bhulu\\b)' },
        { id: 's-pcok',    groupId: 'gs', name: 'PEACOCK',     imageURL: 'https://files.catbox.moe/l69pfg.png',              borderColor: '#FFFFB81C', pattern: '(?i)(?:⁠⁧|\\b(?:pcok|peacock)\\b)' },
        { id: 's-pamp',    groupId: 'gs', name: 'PARAMOUNT+',  imageURL: 'https://files.catbox.moe/ucqtcn.png',              borderColor: '#FF0050D0', pattern: '(?i)(?:⁠⁨|\\b(?:pmtp|pamp|paramount\\+)\\b|\\bparamount\\b)' },
        { id: 's-croll',   groupId: 'gs', name: 'CRUNCHYROLL', imageURL: 'https://files.catbox.moe/f3enlu.png',              borderColor: '#FFF47521', pattern: '(?i)(?:⁠⁩|\\b(?:crunchyroll|crunchy|croll)\\b)' },
        { id: 's-dnvd',    groupId: 'gs', name: 'DNVD',        imageURL: 'https://files.catbox.moe/7qb4ob.png',              borderColor: '#FF0057FF', pattern: '(?i)(?:⁠⁪|\\b(?:dnvd|dnvideo)\\b)' },
        { id: 's-stan',    groupId: 'gs', name: 'STAN',        imageURL: 'https://files.catbox.moe/7n5e5u.png',              borderColor: '#FFFF0000', pattern: '(?i)(?:⁠⁫|\\bstan\\b)' },

        // ── Tiers (gms) ──────────────────────────────────────────────────────────
        { id: 'gms-remux', groupId: 'gms', name: 'REMUX',      imageURL: '',  borderColor: '#FF1565C0', pattern: '(?i)\\bremux\\b' },
        { id: 'gms-uhd',   groupId: 'gms', name: 'UHD',        imageURL: '',  borderColor: '#FF1565C0', pattern: '(?i)\\bUHD\\b' },
        { id: 'gms-fhd',   groupId: 'gms', name: 'FHD',        imageURL: '',  borderColor: '#FF1565C0', pattern: '(?i)\\bFHD\\b' },
        { id: 'gms-hd',    groupId: 'gms', name: 'HD',         imageURL: '',  borderColor: '#FF1565C0', pattern: '(?i)\\bHD\\b' },
        { id: 'gms-sd',    groupId: 'gms', name: 'SD',         imageURL: '',  borderColor: '#FF1565C0', pattern: '(?i)\\bSD\\b' },

        // ── Quality ───────────────────────────────────────────────────────────────
        { id: 'q-bluray',  groupId: 'gq', name: 'BLURAY',      imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\b(?:bluray|blu-ray|bdrip|bluray)\\b' },
        { id: 'q-webdl',   groupId: 'gq', name: 'WEB-DL',      imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\bweb[-.]?dl\\b' },
        { id: 'q-webrip',  groupId: 'gq', name: 'WEBRIP',      imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\bweb[-.]?rip\\b' },
        { id: 'q-hdtv',    groupId: 'gq', name: 'HDTV',        imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\bhdtv\\b' },
        { id: 'q-dvdrip',  groupId: 'gq', name: 'DVDRIP',      imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\bdvd[-.]?rip\\b' },
        { id: 'q-camrip',  groupId: 'gq', name: 'CAMRIP',      imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\b(?:cam|camrip|hdcam|ts|telesync|tc|telecine)\\b' },

        // ── Release ───────────────────────────────────────────────────────────────
        { id: 'rl-proper',  groupId: 'grl', name: 'PROPER',    imageURL: '',  borderColor: '#FF5C6B76', pattern: '(?i)\\bproper\\b' },
        { id: 'rl-repack',  groupId: 'grl', name: 'REPACK',    imageURL: '',  borderColor: '#FF5C6B76', pattern: '(?i)\\brepack\\b' },
        { id: 'rl-real',    groupId: 'grl', name: 'REAL',      imageURL: '',  borderColor: '#FF5C6B76', pattern: '(?i)\\breal\\b' },
        { id: 'rl-subpack', groupId: 'grl', name: 'SUBPACK',   imageURL: '',  borderColor: '#FF5C6B76', pattern: '(?i)\\bsubpack\\b' },
        { id: 'rl-internal',groupId: 'grl', name: 'INTERNAL',  imageURL: '',  borderColor: '#FF5C6B76', pattern: '(?i)\\binternal\\b' },
        { id: 'rl-limited', groupId: 'grl', name: 'LIMITED',   imageURL: '',  borderColor: '#FF5C6B76', pattern: '(?i)\\blimited\\b' },
        { id: 'rl-retail',  groupId: 'grl', name: 'RETAIL',    imageURL: '',  borderColor: '#FF5C6B76', pattern: '(?i)\\bretail\\b' },
        { id: 'rl-nfofix',  groupId: 'grl', name: 'NFOFIX',    imageURL: '',  borderColor: '#FF5C6B76', pattern: '(?i)\\bnfofix\\b' },

        // ── Resolution ────────────────────────────────────────────────────────────
        { id: 'r-2160p',   groupId: 'gr', name: '2160p',       imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\b2160[pi]\\b|\\b4K\\b' },
        { id: 'r-1080p',   groupId: 'gr', name: '1080p',       imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\b1080p\\b' },
        { id: 'r-1080i',   groupId: 'gr', name: '1080i',       imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\b1080i\\b' },
        { id: 'r-720p',    groupId: 'gr', name: '720p',        imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\b720p\\b' },
        { id: 'r-576p',    groupId: 'gr', name: '576p',        imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\b576p\\b' },
        { id: 'r-480p',    groupId: 'gr', name: '480p',        imageURL: '',  borderColor: '#FF27C04F', pattern: '(?i)\\b480p\\b' },

        // ── Visual ────────────────────────────────────────────────────────────────
        { id: 'v-hdr10plus',groupId: 'gv', name: 'HDR10+',     imageURL: '',  borderColor: '#FFFFD54F', pattern: '(?i)\\bHDR10\\+\\b|\\bHDR10Plus\\b' },
        { id: 'v-hdr10',   groupId: 'gv', name: 'HDR10',       imageURL: '',  borderColor: '#FFFFD54F', pattern: '(?i)\\bHDR10\\b' },
        { id: 'v-hdr',     groupId: 'gv', name: 'HDR',         imageURL: '',  borderColor: '#FFFFD54F', pattern: '(?i)\\bHDR\\b' },
        { id: 'v-dv',      groupId: 'gv', name: 'DOLBY VISION',imageURL: '',  borderColor: '#FFFFD54F', pattern: '(?i)\\b(?:DV|DoVi|Dolby[\\s._-]?Vision)\\b' },
        { id: 'v-hlg',     groupId: 'gv', name: 'HLG',         imageURL: '',  borderColor: '#FFFFD54F', pattern: '(?i)\\bHLG\\b' },
        { id: 'v-sdr',     groupId: 'gv', name: 'SDR',         imageURL: '',  borderColor: '#FFFFD54F', pattern: '(?i)\\bSDR\\b' },
        { id: 'v-3d',      groupId: 'gv', name: '3D',          imageURL: '',  borderColor: '#FFFFD54F', pattern: '(?i)\\b3D\\b|\\bHSBS\\b|\\bHOU\\b' },

        // ── Audio ─────────────────────────────────────────────────────────────────
        { id: 'a-truehd',  groupId: 'ga', name: 'TRUEHD',      imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bTrueHD\\b' },
        { id: 'a-atmos',   groupId: 'ga', name: 'ATMOS',        imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bAtmos\\b' },
        { id: 'a-dtshdma', groupId: 'ga', name: 'DTS-HD MA',   imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bDTS[-.]?HD[-.]?MA\\b' },
        { id: 'a-dtsxma',  groupId: 'ga', name: 'DTS:X',       imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bDTS[-.]?X\\b' },
        { id: 'a-dts',     groupId: 'ga', name: 'DTS',         imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bDTS\\b' },
        { id: 'a-dd',      groupId: 'ga', name: 'DD',          imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\b(?:DD|Dolby[\\s._-]?Digital)\\b' },
        { id: 'a-ddplus',  groupId: 'ga', name: 'DD+',         imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\b(?:DD\\+|EAC3|E-AC-3|Dolby[\\s._-]?Digital[\\s._-]?Plus)\\b' },
        { id: 'a-aac',     groupId: 'ga', name: 'AAC',         imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bAAC\\b' },
        { id: 'a-flac',    groupId: 'ga', name: 'FLAC',        imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bFLAC\\b' },
        { id: 'a-mp3',     groupId: 'ga', name: 'MP3',         imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bMP3\\b' },
        { id: 'a-opus',    groupId: 'ga', name: 'OPUS',        imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bOpus\\b' },

        // ── Channels ──────────────────────────────────────────────────────────────
        { id: 'c-7ch',     groupId: 'gc', name: '7.1',         imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\b7[._-]?1\\b' },
        { id: 'c-5ch',     groupId: 'gc', name: '5.1',         imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\b5[._-]?1\\b' },
        { id: 'c-2ch',     groupId: 'gc', name: '2.0',         imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\b2[._-]?0\\b|\\bstereo\\b' },
        { id: 'c-mono',    groupId: 'gc', name: 'MONO',        imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bmono\\b' },

        // ── Language ──────────────────────────────────────────────────────────────
        { id: 'l-multi',   groupId: 'gl', name: 'MULTI',       imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\b(?:multi|multilang|multilingual)\\b' },
        { id: 'l-dual',    groupId: 'gl', name: 'DUAL',        imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\bdual[\\s._-]?(?:audio|lang|language)?\\b' },
        { id: 'l-sub',     groupId: 'gl', name: 'SUB',         imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\b(?:subbed|sub)\\b' },
        { id: 'l-dub',     groupId: 'gl', name: 'DUB',         imageURL: '',  borderColor: '#FFFFFFFF', pattern: '(?i)\\b(?:dubbed|dub)\\b' },

        // ── Source ────────────────────────────────────────────────────────────────
        { id: 'src-bluray',groupId: 'source', name: 'BD',      imageURL: '',  borderColor: '#FFCC0000', pattern: '(?i)\\b(?:BD|Blu-?Ray)\\b' },
        { id: 'src-dvd',   groupId: 'source', name: 'DVD',     imageURL: '',  borderColor: '#FFCC0000', pattern: '(?i)\\bDVD\\b' },
        { id: 'src-web',   groupId: 'source', name: 'WEB',     imageURL: '',  borderColor: '#FFCC0000', pattern: '(?i)\\bWEB\\b' },
        { id: 'src-tv',    groupId: 'source', name: 'TV',      imageURL: '',  borderColor: '#FFCC0000', pattern: '(?i)\\bHDTV\\b|\\bPDTV\\b' },

        // ── Video Codec ───────────────────────────────────────────────────────────
        { id: 'vc-hevc',   groupId: 'video-codec', name: 'HEVC',   imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\b(?:HEVC|x265|h265|H\\.265)\\b' },
        { id: 'vc-avc',    groupId: 'video-codec', name: 'AVC',    imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\b(?:AVC|x264|h264|H\\.264)\\b' },
        { id: 'vc-av1',    groupId: 'video-codec', name: 'AV1',    imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\bAV1\\b' },
        { id: 'vc-vp9',    groupId: 'video-codec', name: 'VP9',    imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\bVP9\\b' },
        { id: 'vc-mpeg2',  groupId: 'video-codec', name: 'MPEG2',  imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\bMPEG[-.]?2\\b' },
        { id: 'vc-xvid',   groupId: 'video-codec', name: 'XVID',   imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\bXVID\\b' },
        { id: 'vc-divx',   groupId: 'video-codec', name: 'DIVX',   imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\bDIVX\\b' },

        // ── Bit Depth ─────────────────────────────────────────────────────────────
        { id: 'bd-10bit',  groupId: 'bit-depth', name: '10-bit',  imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\b(?:10.?bit|Hi10P?)\\b' },
        { id: 'bd-8bit',   groupId: 'bit-depth', name: '8-bit',   imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\b8.?bit\\b' },
        { id: 'bd-12bit',  groupId: 'bit-depth', name: '12-bit',  imageURL: '', borderColor: '#FFCC0000', pattern: '(?i)\\b12.?bit\\b' }
    ];

    // ─────────────────────────────────────────────
    // UTILS
    // ─────────────────────────────────────────────

    // Convert ARGB hex (#AARRGGBB or #RRGGBB) to rgba()
    function hexToRgba(hex, fallbackAlpha) {
        if (!hex || hex === '#00000000') return 'transparent';
        hex = hex.replace('#', '');
        var a = 1, r, g, b;
        if (hex.length === 8) {
            a = parseInt(hex.substring(0, 2), 16) / 255;
            r = parseInt(hex.substring(2, 4), 16);
            g = parseInt(hex.substring(4, 6), 16);
            b = parseInt(hex.substring(6, 8), 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            a = (fallbackAlpha !== undefined) ? fallbackAlpha : 1;
        } else {
            return 'transparent';
        }
        if (a === 0) return 'transparent';
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')';
    }

    // Check if a badge is enabled
    function isBadgeEnabled(id) {
        var val = Lampa.Storage.get(STORAGE_PREFIX + id, 'true');
        return val !== 'false' && val !== false;
    }

    // Save badge state
    function setBadgeEnabled(id, enabled) {
        Lampa.Storage.set(STORAGE_PREFIX + id, enabled ? 'true' : 'false');
    }

    // Convert JSON pattern string to JS RegExp
    function buildRegex(pattern) {
        try {
            var src = pattern.replace(/^\(\?i\)/, '');
            return new RegExp(src, 'i');
        } catch (e) {
            return null;
        }
    }

    // ─────────────────────────────────────────────
    // CSS INJECTION
    // ─────────────────────────────────────────────
    function injectStyles() {
        var css = [
            '.nuvio-badges-wrap {',
            '  display: flex;',
            '  flex-wrap: wrap;',
            '  gap: 4px;',
            '  margin-top: 6px;',
            '  align-items: center;',
            '}',
            '.nuvio-badge {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 3px;',
            '  padding: 2px 6px;',
            '  border-radius: 4px;',
            '  border: 1.5px solid;',
            '  font-size: 10px;',
            '  font-weight: 700;',
            '  letter-spacing: 0.5px;',
            '  text-transform: uppercase;',
            '  background: rgba(0,0,0,0.55);',
            '  color: #fff;',
            '  backdrop-filter: blur(4px);',
            '  line-height: 1.4;',
            '  white-space: nowrap;',
            '}',
            '.nuvio-badge img {',
            '  height: 14px;',
            '  width: auto;',
            '  object-fit: contain;',
            '  vertical-align: middle;',
            '}',
            // Settings panel styles
            '.nuvio-settings-wrap {',
            '  padding: 0 0 10px 0;',
            '}',
            '.nuvio-settings-group {',
            '  margin-bottom: 14px;',
            '}',
            '.nuvio-settings-group-title {',
            '  font-size: 13px;',
            '  font-weight: 700;',
            '  color: #aaa;',
            '  text-transform: uppercase;',
            '  letter-spacing: 1px;',
            '  padding: 6px 0 4px 0;',
            '  border-bottom: 1px solid rgba(255,255,255,0.08);',
            '  margin-bottom: 6px;',
            '}',
            '.nuvio-settings-item {',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  padding: 5px 4px;',
            '  border-radius: 6px;',
            '  cursor: pointer;',
            '  transition: background 0.2s;',
            '}',
            '.nuvio-settings-item:hover, .nuvio-settings-item.selected {',
            '  background: rgba(255,255,255,0.07);',
            '}',
            '.nuvio-settings-item-left {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 8px;',
            '}',
            '.nuvio-badge-preview {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 3px;',
            '  padding: 1px 5px;',
            '  border-radius: 3px;',
            '  border: 1.5px solid;',
            '  font-size: 9px;',
            '  font-weight: 700;',
            '  background: rgba(0,0,0,0.55);',
            '  color: #fff;',
            '  min-width: 38px;',
            '  justify-content: center;',
            '}',
            '.nuvio-badge-preview img {',
            '  height: 12px;',
            '  width: auto;',
            '}',
            '.nuvio-toggle {',
            '  width: 34px;',
            '  height: 18px;',
            '  border-radius: 9px;',
            '  background: #333;',
            '  position: relative;',
            '  transition: background 0.2s;',
            '  flex-shrink: 0;',
            '}',
            '.nuvio-toggle.on { background: #27C04F; }',
            '.nuvio-toggle-knob {',
            '  position: absolute;',
            '  top: 2px;',
            '  left: 2px;',
            '  width: 14px;',
            '  height: 14px;',
            '  border-radius: 50%;',
            '  background: #fff;',
            '  transition: left 0.2s;',
            '}',
            '.nuvio-toggle.on .nuvio-toggle-knob { left: 18px; }',
            '.nuvio-settings-item-name {',
            '  font-size: 13px;',
            '  color: #ddd;',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.id = 'nuvio-badges-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ─────────────────────────────────────────────
    // BADGE RENDERING
    // ─────────────────────────────────────────────

    function renderBadge(badge) {
        var borderColor = hexToRgba(badge.borderColor, 1);
        var el = document.createElement('span');
        el.className = 'nuvio-badge';
        el.style.borderColor = borderColor;

        if (badge.imageURL) {
            var img = document.createElement('img');
            img.src = badge.imageURL;
            img.alt = badge.name;
            img.onerror = function () {
                img.style.display = 'none';
                el.appendChild(document.createTextNode(badge.name));
            };
            el.appendChild(img);
        } else {
            el.appendChild(document.createTextNode(badge.name));
        }

        return el;
    }

    function getBadgesForFilename(filename) {
        if (!filename) return [];
        var matched = [];
        for (var i = 0; i < BADGES.length; i++) {
            var badge = BADGES[i];
            if (!isBadgeEnabled(badge.id)) continue;
            var rx = buildRegex(badge.pattern);
            if (rx && rx.test(filename)) {
                matched.push(badge);
            }
        }
        return matched;
    }

    function injectBadgesIntoElement($el, title) {
        $el.find('.nuvio-badges-wrap').remove();
        var matched = getBadgesForFilename(title || '');
        if (!matched.length) return;

        var wrap = document.createElement('div');
        wrap.className = 'nuvio-badges-wrap';
        matched.forEach(function (badge) {
            wrap.appendChild(renderBadge(badge));
        });

        $el.append(wrap);
    }

    // ─────────────────────────────────────────────
    // LAMPA HOOKS
    // ─────────────────────────────────────────────

    // Hook into torrent/file list items
    function hookTorrentList() {
        Lampa.Listener.follow('torrent', function (e) {
            if (e.type === 'item') {
                var $item = $(e.object.render);
                var title = (e.data && (e.data.title || e.data.name || e.data.filename)) || '';
                injectBadgesIntoElement($item, title);
            }
        });
    }

    // Hook into file items (online/stream lists)
    function hookFileList() {
        Lampa.Listener.follow('files', function (e) {
            if (e.type === 'item') {
                var $item = $(e.object.render);
                var title = (e.data && (e.data.title || e.data.name || e.data.filename || e.data.quality)) || '';
                injectBadgesIntoElement($item, title);
            }
        });
    }

    // Hook into card renders (full page, card previews)
    function hookCard() {
        Lampa.Listener.follow('card', function (e) {
            if (e.type === 'complite') {
                var $card = $(e.object.render());
                var movie = e.object.movie || {};
                var title = movie.title || movie.original_title || movie.name || '';
                injectBadgesIntoElement($card.find('.card__view, .card__info').first(), title);
            }
        });
    }

    // ─────────────────────────────────────────────
    // SETTINGS PAGE
    // ─────────────────────────────────────────────

    function buildSettingsHTML() {
        var html = '<div class="nuvio-settings-wrap">';

        // Group badges by group
        var groups = {};
        BADGES.forEach(function (badge) {
            if (!groups[badge.groupId]) groups[badge.groupId] = [];
            groups[badge.groupId].push(badge);
        });

        BADGE_GROUPS.forEach(function (group) {
            var badges = groups[group.id];
            if (!badges || !badges.length) return;

            var groupColor = hexToRgba(group.borderColor, 1);
            html += '<div class="nuvio-settings-group">';
            html += '<div class="nuvio-settings-group-title" style="border-bottom-color:' + groupColor + '">' + group.name + '</div>';

            badges.forEach(function (badge) {
                var enabled = isBadgeEnabled(badge.id);
                var borderColor = hexToRgba(badge.borderColor, 1);
                var toggleClass = enabled ? 'nuvio-toggle on' : 'nuvio-toggle';

                html += '<div class="nuvio-settings-item" data-badge-id="' + badge.id + '">';
                html += '  <div class="nuvio-settings-item-left">';
                html += '    <span class="nuvio-badge-preview" style="border-color:' + borderColor + '">';
                if (badge.imageURL) {
                    html += '<img src="' + badge.imageURL + '" alt="' + badge.name + '" />';
                } else {
                    html += badge.name;
                }
                html += '    </span>';
                html += '    <span class="nuvio-settings-item-name">' + badge.name + '</span>';
                html += '  </div>';
                html += '  <div class="' + toggleClass + '"><div class="nuvio-toggle-knob"></div></div>';
                html += '</div>';
            });

            html += '</div>'; // group
        });

        html += '</div>'; // wrap
        return html;
    }

    function openSettingsScreen() {
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html = $(buildSettingsHTML());

        html.on('click', '.nuvio-settings-item', function () {
            var id = $(this).data('badge-id');
            var enabled = isBadgeEnabled(id);
            setBadgeEnabled(id, !enabled);
            var $toggle = $(this).find('.nuvio-toggle');
            $toggle.toggleClass('on', !enabled);
        });

        // TV navigation (up/down)
        var $items = html.find('.nuvio-settings-item');
        var currentIndex = 0;
        function focusItem(idx) {
            $items.removeClass('selected');
            $items.eq(idx).addClass('selected');
            $items.eq(idx)[0].scrollIntoView({ block: 'nearest' });
        }
        focusItem(0);

        Lampa.Controller.add('nuvio_settings', {
            toggle: function () {
                Lampa.Controller.collectionSet(html);
                Lampa.Controller.collectionFocus($items.eq(currentIndex)[0], html[0]);
            },
            up: function () {
                if (currentIndex > 0) {
                    currentIndex--;
                    focusItem(currentIndex);
                } else {
                    Lampa.Controller.back();
                }
            },
            down: function () {
                if (currentIndex < $items.length - 1) {
                    currentIndex++;
                    focusItem(currentIndex);
                }
            },
            enter: function () {
                $items.eq(currentIndex).trigger('click');
            },
            back: function () {
                Lampa.Activity.backward();
            },
            left: function () {
                Lampa.Controller.back();
            }
        });

        scroll.render().append(html);

        Lampa.Activity.push({
            url: '',
            title: 'Nuvio Badges',
            component: 'nuvio_badges_settings_view',
            page: 1
        });

        // Inject into the actual activity after push
        setTimeout(function () {
            try {
                var $body = $('.activity--active .activity__body, .activity__body').last();
                if ($body.length) {
                    $body.empty().append(scroll.render());
                    Lampa.Controller.toggle('nuvio_settings');
                }
            } catch (e) {}
        }, 50);
    }

    // Register as a component for the activity system
    function registerComponent() {
        Lampa.Component.add('nuvio_badges_settings_view', function (object) {
            var scroll = new Lampa.Scroll({ mask: true, over: true });
            var html = $(buildSettingsHTML());
            var $items;
            var currentIndex = 0;

            html.on('click', '.nuvio-settings-item', function () {
                var id = $(this).data('badge-id');
                var enabled = isBadgeEnabled(id);
                setBadgeEnabled(id, !enabled);
                var $toggle = $(this).find('.nuvio-toggle');
                $toggle.toggleClass('on', !enabled);
            });

            this.render = function () {
                return scroll.render();
            };

            this.start = function () {
                scroll.render().append(html);
                $items = html.find('.nuvio-settings-item');

                function focusItem(idx) {
                    $items.removeClass('selected');
                    $items.eq(idx).addClass('selected');
                    try { $items.eq(idx)[0].scrollIntoView({ block: 'nearest' }); } catch(e) {}
                }
                focusItem(0);

                Lampa.Controller.add('nuvio_settings', {
                    toggle: function () {},
                    up: function () {
                        if (currentIndex > 0) { currentIndex--; focusItem(currentIndex); }
                        else { Lampa.Activity.backward(); }
                    },
                    down: function () {
                        if (currentIndex < $items.length - 1) { currentIndex++; focusItem(currentIndex); }
                    },
                    enter: function () {
                        $items.eq(currentIndex).trigger('click');
                    },
                    back: function () {
                        Lampa.Activity.backward();
                    },
                    left: function () {
                        Lampa.Controller.back();
                    }
                });
                Lampa.Controller.toggle('nuvio_settings');
            };

            this.pause = function () {};
            this.stop = function () {};
            this.destroy = function () {
                scroll.destroy();
            };
        });
    }

    // Add button to Settings menu
    function addSettingsButton() {
        Lampa.Settings.listener.follow('open', function (e) {
            // Wait for settings panel to render
            setTimeout(function () {
                try {
                    var $panel = $(e.body || '.settings-android');
                    if (!$panel.length) $panel = $('.settings-android');
                    if ($panel.find('.nuvio-settings-btn').length) return;

                    var $btn = $('<div class="nuvio-settings-btn settings-param selector" style="cursor:pointer;">' +
                        '<div class="settings-param__name">Nuvio Badges</div>' +
                        '<div class="settings-param__value">Управление бейджами</div>' +
                        '</div>');

                    $btn.on('hover:enter click', function () {
                        Lampa.Activity.push({
                            url: '',
                            title: 'Nuvio Badges — Настройки',
                            component: 'nuvio_badges_settings_view',
                            page: 1
                        });
                    });

                    $panel.find('.settings-param').last().after($btn);
                } catch (ex) {}
            }, 100);
        });
    }

    // ─────────────────────────────────────────────
    // MAIN ENTRY
    // ─────────────────────────────────────────────

    function startPlugin() {
        injectStyles();
        registerComponent();
        hookTorrentList();
        hookFileList();
        hookCard();
        addSettingsButton();

        // Also hook into the torrent-file items inside player file list
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                try {
                    var $render = e.object.activity.render();
                    // Re-scan after any dynamic content
                    setTimeout(function () {
                        $render.find('.torrent-item, .files-item, .stream-item').each(function () {
                            var $el = $(this);
                            var title = $el.find('.torrent-item__title, .files-item__title, .item-title').text() || '';
                            injectBadgesIntoElement($el, title);
                        });
                    }, 300);
                } catch (ex) {}
            }
        });

        console.log('[NuvioBadges] Plugin loaded. Badges: ' + BADGES.length);
    }

    // ─────────────────────────────────────────────
    // BOOTSTRAP — wait for Lampa to be ready
    // ─────────────────────────────────────────────

    if (window.Lampa) {
        if (Lampa.Manifest && Lampa.Manifest.app_digital) {
            startPlugin();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') startPlugin();
            });
        }
    } else {
        var _timer = setInterval(function () {
            if (window.Lampa) {
                clearInterval(_timer);
                startPlugin();
            }
        }, 200);
    }

})();
