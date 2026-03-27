(function () {
    'use strict';

    //======= ДОМЕНИ ТА КОНСТАНТИ =======//
    var PORNO365_DOMAIN = 'https://w.porno365.gold', LENKINO_DOMAIN = 'https://wes.lenkino.adult', LONGVIDEOS_DOMAIN = 'https://www.longvideos.xxx', PORNHUB_DOMAIN = 'https://rt.pornhub.com', PORNDISH_DOMAIN = 'https://www.porndish.com', YOUPERV_DOMAIN = 'https://youperv.com', PORNMZ_DOMAIN = 'https://pornmz.net';
    var PH_CATS = [{title:"Все",val:""},{title:"Азиатки",val:"1"},{title:"Анальный секс",val:"35"},{title:"Арабское",val:"98"},{title:"БДСМ",val:"10"},{title:"Бисексуалы",val:"76"},{title:"Блондинки",val:"9"},{title:"Большая грудь",val:"8"},{title:"Большие члены",val:"7"},{title:"Бразильское",val:"102"},{title:"Британское",val:"96"},{title:"Брызги",val:"69"},{title:"Брюнетки",val:"11"},{title:"Буккаке",val:"14"},{title:"В школе",val:"88"},{title:"Веб-камера",val:"61"},{title:"Вечеринки",val:"53"},{title:"Гонзо",val:"41"},{title:"Грубый секс",val:"67"},{title:"Групповуха",val:"80"},{title:"Девушки (соло)",val:"492"},{title:"Двойное проникновение",val:"72"},{title:"Дрочит",val:"20"},{title:"Европейцы",val:"55"},{title:"Жесткий секс",val:"21"},{title:"Женский оргазм",val:"502"},{title:"За кадром",val:"141"},{title:"Звезды",val:"12"},{title:"Золотой дождь",val:"211"},{title:"Зрелые",val:"28"},{title:"Игрушки",val:"23"},{title:"Индийское",val:"101"},{title:"Итальянское",val:"97"},{title:"Кастинги",val:"90"},{title:"Кончают",val:"16"},{title:"Корейское",val:"103"},{title:"Косплей",val:"241"},{title:"Кунилингус",val:"131"},{title:"Курящие",val:"91"},{title:"Латинки",val:"26"},{title:"Лесбиянки",val:"27"},{title:"Любительское",val:"3"},{title:"Маленькая грудь",val:"59"},{title:"Мамочки",val:"29"},{title:"Массаж",val:"78"},{title:"Мастурбация",val:"22"},{title:"Межрассовый Секс",val:"25"},{title:"Минет",val:"13"},{title:"Музыка",val:"121"},{title:"Мулаты",val:"17"},{title:"Мультики",val:"86"},{title:"Мускулистые Мужчины",val:"512"},{title:"На публике",val:"24"},{title:"Немецкое",val:"95"},{title:"Ноги",val:"93"},{title:"Няни",val:"89"},{title:"Парни (соло)",val:"92"},{title:"Пародия",val:"201"},{title:"Попки",val:"4"},{title:"Приколы",val:"32"},{title:"Проверенное Любительское",val:"138"},{title:"Проверенные Модели",val:"139"},{title:"Проверенные Пары",val:"482"},{title:"Реальный секс",val:"31"},{title:"Ретро",val:"43"},{title:"Рогоносцы",val:"242"},{title:"Ролевые Игры",val:"81"},{title:"Русское",val:"99"},{title:"Секс втроем",val:"65"},{title:"60FPS",val:"105"}];
    var PH_SORTS = [{title:"Новые",val:"cm"},{title:"Популярные",val:"mv"},{title:"Лучшие",val:"tr"},{title:"Горячие",val:"ht"}];

    function startPlugin() {
        if (window.pluginx_ready) return; window.pluginx_ready = true;

        //======= СТИЛІ (Сітки та Картки) =======//
        var css = '<style>.main-grid { padding: 0 !important; } @media screen and (max-width: 580px) { .main-grid .card { width: 100% !important; margin-bottom: 10px !important; padding: 0 5px !important; } .main-grid.is-categories-grid .card, .main-grid.is-models-grid .card, .main-grid.is-noimg-grid .card, .main-grid.is-pornmz-grid .card { width: 50% !important; } } @media screen and (min-width: 581px) { .main-grid .card { width: 25% !important; margin-bottom: 15px !important; padding: 0 8px !important; } .main-grid.is-categories-grid .card, .main-grid.is-models-grid .card, .main-grid.is-noimg-grid .card, .main-grid.is-pornmz-grid .card { width: 16.666% !important; } } .main-grid .card__view { padding-bottom: 56.25% !important; border-radius: 12px !important; position: relative !important; } .main-grid.is-categories-grid .card__view { padding-bottom: 80% !important; background: #ffffff !important; } .main-grid.is-models-grid .card__view { padding-bottom: 150% !important; background: #ffffff !important; } .main-grid.is-pornmz-grid .card__view { padding-bottom: 56.25% !important; background: #ffffff !important; border-radius: 8px !important; } .main-grid .card__img { object-fit: cover !important; border-radius: 12px !important; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 1 !important; } .main-grid.is-pornmz-grid .card__img { border-radius: 8px !important; } .main-grid .card__title { display: -webkit-box !important; -webkit-line-clamp: 3 !important; -webkit-box-orient: vertical !important; overflow: hidden !important; white-space: normal !important; text-align: left !important; line-height: 1.2 !important; max-height: 3.6em !important; padding-top: 2px !important; margin-top: 0 !important; text-overflow: ellipsis !important; } .main-grid.is-categories-grid .card__title, .main-grid.is-models-grid .card__title, .main-grid.is-pornmz-grid .card__title { -webkit-line-clamp: 2 !important; text-align: center !important; font-weight: normal !important; margin-top: 5px !important; } .main-grid.is-noimg-grid .card { position: relative !important; } .main-grid.is-noimg-grid .card__view { padding-bottom: 25% !important; background: #c4c4c4 !important; border-radius: 8px !important; border: 1px solid #aaa; transition: transform 0.2s; } .main-grid.is-noimg-grid .card.focus .card__view { transform: scale(1.05); background: #b0b0b0 !important; border-color: #fff; box-shadow: 0 0 10px rgba(255,255,255,0.8); } .main-grid.is-noimg-grid .card__img { display: none !important; } .main-grid.is-noimg-grid .card__title { position: absolute !important; top: 0; left: 0; width: 100%; height: 100%; display: flex !important; align-items: center !important; justify-content: center !important; color: #000000 !important; font-weight: bold !important; font-size: 1.3em !important; line-height: 1.2 !important; text-align: center !important; white-space: normal !important; word-break: break-word !important; -webkit-line-clamp: unset !important; -webkit-box-orient: unset !important; padding: 8px !important; margin: 0 !important; z-index: 10; box-sizing: border-box !important; background: transparent !important; text-shadow: none !important; } .main-grid.is-porndish-list .card { width: 100% !important; margin-bottom: 10px !important; padding: 0 10px !important; height: auto !important; } .main-grid.is-porndish-list .card__view { display: none !important; } .main-grid.is-porndish-list .card__title { position: relative !important; width: 100% !important; height: 100% !important; color: #ffffff !important; font-weight: normal !important; font-size: 1.3em !important; text-align: center !important; display: flex !important; align-items: center !important; justify-content: center !important; white-space: normal !important; word-break: break-word !important; -webkit-line-clamp: unset !important; -webkit-box-orient: unset !important; padding: 15px 15px !important; margin: 0 !important; background: rgba(35,35,35,0.9) !important; border-radius: 8px !important; border: 1px solid rgba(255,255,255,0.1) !important; transition: transform 0.2s, background 0.2s !important; } .main-grid.is-porndish-list .card.focus .card__title { transform: scale(1.01) !important; background: rgba(70,70,70,0.95) !important; border-color: #fff !important; box-shadow: 0 0 10px rgba(255,255,255,0.3) !important; z-index: 10 !important; } @media screen and (min-width: 581px) { .main-grid.is-porndish-list .card { width: 50% !important; } .main-grid.is-porndish-list .card__title { font-size: 1.4em !important; } } .main-grid .card__age, .main-grid .card__textbox { display: none !important; } .pluginx-filter-btn { order: -1 !important; margin-right: auto !important; }</style>'; $('body').append(css);

        //======= МЕРЕЖА ТА ПРЕВ'Ю =======//
        var previewTimeout, activePreviewNode; function hidePreview() { clearTimeout(previewTimeout); if (activePreviewNode) { var vid = activePreviewNode.find('video')[0]; if (vid) { try { vid.pause(); } catch(e) {} vid.removeAttribute('src'); vid.load(); } activePreviewNode.remove(); activePreviewNode = null; } } function showPreview(target, src) { var previewContainer = $('<div class="sisi-video-preview" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;overflow:hidden;z-index:4;background:#000;"><video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video></div>'); var videoEl = previewContainer.find('video')[0], sources = Array.isArray(src) ? src : [src]; if (!sources || sources.length === 0 || !sources[0]) return; var currentIdx = 0; videoEl.src = sources[currentIdx]; videoEl.onerror = function() { currentIdx++; if (currentIdx < sources.length) { videoEl.src = sources[currentIdx]; var p = videoEl.play(); if (p !== undefined) p.catch(function(){}); } }; target.find('.card__view').append(previewContainer); activePreviewNode = previewContainer; var playPromise = videoEl.play(); if (playPromise !== undefined) playPromise.catch(function(){}); } function formatTitle(name, info, symbol) { if (!info) return name; var cleanInfo = info.replace(/[^0-9:]/g, ''); return name + ' ' + symbol + ' ' + cleanInfo; }
        function smartRequest(url, onSuccess, onError, customHeaders) { var network = new Lampa.Reguest(), headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" }; if (customHeaders) { for (var k in customHeaders) headers[k] = customHeaders[k]; } var isAndroid = typeof window !== 'undefined' && window.Lampa && window.Lampa.Platform && window.Lampa.Platform.is('android'); if (isAndroid) network.native(url, function (res) { onSuccess(typeof res === 'object' ? JSON.stringify(res) : res); }, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 }); else network.silent(url, onSuccess, function (err) { if (onError) onError(err); }, false, { dataType: 'text', headers: headers, timeout: 10000 }); }

        var Adapters = {};
        //======= АДАПТЕР PORNO365 =======//
        Adapters['porno365'] = {
            domain: PORNO365_DOMAIN,
            parse: function(doc, obj) {
                var targetPath = (obj.url || '').replace(this.domain, '').split('?')[0];
                
                if (targetPath === '/categories' || obj.is_categories) { 
                    var resCat = [], links = doc.querySelectorAll('.categories-list-div a'), added = []; 
                    for (var i = 0; i < links.length; i++) { 
                        var el = links[i], title = (el.getAttribute('title') || el.textContent || '').trim(), href = el.getAttribute('href'); 
                        if (!title || !href) continue; 
                        var imgEl = el.querySelector('img'), img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : ''; 
                        if (img && img.indexOf('//') === 0) img = 'https:' + img; 
                        if (added.indexOf(href) === -1) { 
                            // Захист від подвійного домену
                            var vUrlC = href.startsWith('http') ? href : this.domain + (href.startsWith('/') ? '' : '/') + href;
                            resCat.push({ name: title, url: vUrlC, picture: img, img: img, is_grid: true }); 
                            added.push(href); 
                        } 
                    } 
                    return resCat; 
                }
                
                if (obj.is_models || targetPath === '/models' || targetPath.indexOf('/models/sort-by-') === 0) { 
                    var resM = [], mEls = doc.querySelectorAll('.item_model'); 
                    for (var k = 0; k < mEls.length; k++) { 
                        var elM = mEls[k], linkM = elM.querySelector('a'), nameM = elM.querySelector('.model_eng_name'), countM = elM.querySelector('.cnt_span'), imgM = elM.querySelector('img'); 
                        if (linkM && nameM) {
                            var mHref = linkM.getAttribute('href');
                            var vUrlM = mHref.startsWith('http') ? mHref : this.domain + (mHref.startsWith('/') ? '' : '/') + mHref;
                            resM.push({ name: formatTitle((nameM.textContent || '').trim(), countM ? (countM.textContent || '').trim() : '', '☰'), url: vUrlM, picture: imgM ? imgM.getAttribute('src') : '', img: imgM ? imgM.getAttribute('src') : '', is_grid: true, is_models_grid: true }); 
                        }
                    } 
                    return resM; 
                }
                
                var sel = obj.is_related ? '.related .related_video' : 'li.video_block, li.trailer', elements = doc.querySelectorAll(sel), res = [];
                for (var j = 0; j < elements.length; j++) { 
                    var el2 = elements[j], linkEl2 = el2.querySelector('a.image'), titleEl = el2.querySelector('a.image p, .title'), imgEl2 = el2.querySelector('img'), timeEl = el2.querySelector('.duration'), vP = el2.querySelector('video#videoPreview') || el2.querySelector('video'); 
                    if (linkEl2 && titleEl) { 
                        var img2 = imgEl2 ? (imgEl2.getAttribute('data-src') || imgEl2.getAttribute('data-original') || imgEl2.getAttribute('src')) : ''; 
                        if (img2 && img2.indexOf('//') === 0) img2 = 'https:' + img2; 
                        
                        // Захист посилання відео
                        var href = linkEl2.getAttribute('href');
                        var vUrl = href.startsWith('http') ? href : this.domain + (href.startsWith('/') ? '' : '/') + href;
                        
                        var pUrl = vP ? (vP.getAttribute('src') || vP.getAttribute('data-src') || '') : ''; 
                        if (pUrl && pUrl.indexOf('//') === 0) pUrl = 'https:' + pUrl; 
                        
                        var previewData = pUrl, matchId = vUrl.match(/\/movie\/(\d+)/); 
                        if (matchId && matchId[1]) { 
                            var vidId = matchId[1], f1 = vidId.charAt(0), f2 = vidId.length > 1 ? vidId.charAt(1) : '0', subs = ['53', '33', '26', '18', '51', '32', '54']; 
                            if (!previewData) previewData = []; 
                            if (Array.isArray(previewData)) {
                                for (var s = 0; s < subs.length; s++) previewData.push('https://tr' + subs[s] + '.vide365.com/porno365/trailers/' + f1 + '/' + f2 + '/' + vidId + '.webm'); 
                            }
                        } 
                        var name = (titleEl.textContent || '').trim(), time = timeEl ? (timeEl.textContent || '').trim() : ''; 
                        res.push({ name: formatTitle(name, time, '▶'), url: vUrl, picture: img2, img: img2, preview: previewData }); 
                    } 
                } 
                return res;
            },
            getFilter: function() { 
                return [ { title: '🗄️ Категорії', action: 'categories' }, { title: '👸 Моделі', action: 'models' } ]; 
            },
            getSort: function(doc) {
                var activeTitle = 'Новые', items = [], stext = doc.querySelector('.stext_wrapper');
                if (stext) { 
                    var divs = stext.querySelectorAll('.div_sort'); 
                    for (var d = 0; d < divs.length; d++) { 
                        var span = divs[d].querySelector('span');
                        var prefix = span ? span.textContent.replace(/:$/, '').trim() + ' - ' : ''; 
                        var links = divs[d].querySelectorAll('a'); 
                        
                        for (var l = 0; l < links.length; l++) { 
                            var text = links[l].textContent.trim(); 
                            if (text === 'Сортування' || text === '') continue; 
                            
                            var fullTitle = prefix + text; 
                            var parentLi = links[l].closest('li');
                            
                            // Комплексна перевірка активного класу (за твоїм HTML)
                            var isActive = (!span && (divs[d].classList.contains('active_sort') || divs[d].classList.contains('current_sort'))) || 
                                           (parentLi && (parentLi.classList.contains('active_sort') || parentLi.classList.contains('current_sort'))) || 
                                           links[l].classList.contains('active_sort') || links[l].classList.contains('current_sort');
                            
                            if (isActive) { 
                                activeTitle = fullTitle; 
                                items.push({ title: '⇅ ' + fullTitle, action: 'none' }); 
                            } else if (links[l].getAttribute('href') && links[l].getAttribute('href').indexOf('/ru') === -1) { 
                                var h = links[l].getAttribute('href');
                                var sUrl = h.startsWith('http') ? h : this.domain + (h.startsWith('/') ? '' : '/') + h;
                                items.push({ title: fullTitle, url: sUrl }); 
                            } 
                        } 
                    } 
                } 
                return { active: activeTitle, items: items };
            },
            getMenu: function(doc) { 
                var m = [], q = doc.querySelectorAll('.quality_chooser a'); 
                if (q.length > 1) m.push({ title: 'Відтворити в ' + q[q.length - 2].textContent.trim(), action: 'play_direct', url: q[q.length - 2].getAttribute('href') }); 
                var mEls = doc.querySelectorAll('.video-categories.video-models a'); 
                for (var i = 0; i < mEls.length; i++) m.push({ title: mEls[i].textContent.trim(), action: 'direct', url: mEls[i].getAttribute('href') }); 
                m.push({ title: 'Категорії', action: 'cats_custom', sel: '.video-categories:not(.video-models) a' }, 
                       { title: 'Теги', action: 'cats_custom', sel: '.video-tags a' }, 
                       { title: 'Схожі відео', action: 'sim' }); 
                return m; 
            },
            play: function(doc, el) { 
                var str = [], q = doc.querySelectorAll('.quality_chooser a'); 
                for (var j = q.length - 1; j >= 0; j--) { 
                    var qHref = q[j].getAttribute('href'); 
                    if (qHref) str.push({ title: (q[j].textContent || '').trim(), url: qHref }); 
                } 
                if (str.length > 0) { 
                    var pData = { title: el.name, url: str[0].url, quality: str }; 
                    Lampa.Player.play(pData); 
                    Lampa.Player.playlist([pData]); 
                } 
            }
        };


        //======= АДАПТЕР LENKINO =======//
        Adapters['lenkino'] = {
            domain: LENKINO_DOMAIN,
            parse: function(doc, obj) {
                var currentDomain = (obj.url && obj.url.startsWith('http')) ? obj.url.match(/^https?:\/\/[^\/]+/)[0] : this.domain;
                var targetPath = (obj.url || '').replace(/^https?:\/\/[^\/]+/, '').split('?')[0];
                if (!targetPath) targetPath = '/';

                // 1. ПАРСИНГ КАТЕГОРІЙ (Повернуто логіку каталогу)
                if (targetPath.indexOf('/categories') !== -1 || obj.is_categories) { 
                    var resCat = [], cats = doc.querySelectorAll('.grd-cat .item, #list_categories_categories_list_items .item, .grd-cat a'); 
                    for(var c=0; c<cats.length; c++) { 
                        var lC = cats[c].tagName === 'A' ? cats[c] : cats[c].querySelector('a');
                        if (!lC) continue;
                        var tC = lC.getAttribute('title') || lC.textContent.trim();
                        var titC = cats[c].querySelector('.itm-tit'); if (titC) tC = titC.textContent.trim();
                        var iC = cats[c].querySelector('img'), sC = iC ? (iC.getAttribute('data-src')||iC.getAttribute('src')) : ''; 
                        if (sC) sC = sC.split(',')[0].split(' ')[0].trim(); 
                        if(sC && sC.indexOf('//')===0) sC='https:'+sC; else if(sC && sC.indexOf('/')===0) sC=currentDomain+sC;
                        var hC = lC.getAttribute('href'); 
                        if(tC && hC && tC.toLowerCase().indexOf('категории') === -1) {
                            var uC = hC.startsWith('http') ? hC : currentDomain + (hC.startsWith('/')?'':'/') + hC;
                            resCat.push({name: tC, url: uC, picture: sC, img: sC, is_grid: true, is_categories: false}); 
                        }
                    } 
                    if (resCat.length > 0) return resCat; 
                }

                // 2. ПАРСИНГ МОДЕЛЕЙ (Повернуто логіку каталогу)
                if (targetPath.indexOf('/pornstars') !== -1 || targetPath.indexOf('/models') !== -1 || obj.is_models) { 
                    var resM = [], mdls = doc.querySelectorAll('.grd-mdl .item, #list_models_models_list_items .item, .grd-mdl a'); 
                    for(var m=0; m<mdls.length; m++) { 
                        var lM = mdls[m].tagName === 'A' ? mdls[m] : mdls[m].querySelector('a');
                        if(!lM) continue;
                        var iM = mdls[m].querySelector('img'), tM = mdls[m].querySelector('.itm-tit'), cM = mdls[m].querySelector('.itm-opt li');
                        var nM = tM ? tM.textContent.trim() : (iM?iM.getAttribute('alt'):(lM.getAttribute('title')||'Model')); 
                        var sM = iM ? (iM.getAttribute('data-src')||iM.getAttribute('src')) : ''; 
                        if (sM) sM = sM.split(',')[0].split(' ')[0].trim();
                        if(sM && sM.indexOf('//')===0) sM='https:'+sM; else if(sM && sM.indexOf('/')===0) sM=currentDomain+sM;
                        var hM = lM.getAttribute('href');
                        if (nM && hM) {
                            var uM = hM.startsWith('http') ? hM : currentDomain + (hM.startsWith('/')?'':'/') + hM;
                            resM.push({name: formatTitle(nM.trim(), cM?cM.textContent.trim():'', '☰'), url: uM, picture: sM, img: sM, is_grid: true, is_models_grid: true}); 
                        }
                    } 
                    if (resM.length > 0) return resM; 
                }

                // 3. ПАРСИНГ СТУДІЙ (Повернуто логіку каталогу)
                if (obj.is_studios || targetPath.indexOf('/channels') !== -1) {
                    var resS = [], spns = doc.querySelectorAll('.itm-crd-spn, .itm-crd, #list_channels_channels_list_items .item, .grd-mdl .item');
                    for(var s=0; s<spns.length; s++) {
                        var lS = spns[s].tagName === 'A' ? spns[s] : spns[s].querySelector('a.len_pucl, a');
                        if(!lS) continue;
                        var tS = spns[s].querySelector('.itm-opt, .itm-tit'), iS = spns[s].querySelector('img'), durS = spns[s].querySelector('.itm-opt li, .itm-dur');
                        var nS = lS.getAttribute('title') || (tS?tS.textContent:'') || (iS?iS.getAttribute('alt'):'') || lS.textContent;
                        var srcS = iS ? (iS.getAttribute('data-srcset')||iS.getAttribute('data-src')||iS.getAttribute('src')) : '';
                        if (srcS) srcS = srcS.split(',')[0].split(' ')[0].trim();
                        if(srcS && srcS.indexOf('//')===0) srcS='https:'+srcS; else if(srcS && srcS.indexOf('/')===0) srcS=currentDomain+srcS;
                        var hS = lS.getAttribute('href');
                        if (nS && hS) {
                            var uS = hS.startsWith('http') ? hS : currentDomain + (hS.startsWith('/')?'':'/') + hS;
                            resS.push({name: formatTitle(nS.trim(), durS?durS.textContent.trim():'', '☰'), url: uS, picture: srcS, img: srcS, is_grid: true});
                        }
                    }
                    if (resS.length > 0) return resS;
                }

                // 4. ПАРСИНГ ВІДЕО (Жорсткий ID для основних списків)
                var res = [], container = doc.querySelector('#list_videos_videos_list_items'), els = container ? container.querySelectorAll('a.len_pucl') : doc.querySelectorAll('.grd-vid a.len_pucl, #list_videos_related_videos_items a.len_pucl'); 
                for(var i=0; i<els.length; i++) { 
                    var link = els[i], tit = link.querySelector('.itm-tit'), imgEl = link.querySelector('img'), dur = link.querySelector('.itm-dur'); 
                    if(link) { 
                        var name = tit ? tit.textContent.trim() : link.getAttribute('title');
                        if (!name && imgEl) name = imgEl.getAttribute('alt');
                        var src = '', pUrl = '';
                        if (imgEl) {
                            src = imgEl.getAttribute('data-srcset') || imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
                            if (src) src = src.split(',')[0].split(' ')[0].trim(); 
                            pUrl = imgEl.getAttribute('data-preview') || '';
                        }
                        if (!src) { var bgDiv = link.querySelector('.itm-img'); if (bgDiv && bgDiv.getAttribute('style')) { var bgMatch = bgDiv.getAttribute('style').match(/url\((['"]?)(.*?)\1\)/); if (bgMatch && bgMatch[2]) src = bgMatch[2]; } }
                        if(src && src.indexOf('//')===0) src = 'https:'+src; else if(src && src.indexOf('/')===0) src = currentDomain+src; 
                        if(pUrl && pUrl.indexOf('//')===0) pUrl = 'https:'+pUrl; else if(pUrl && pUrl.indexOf('/')===0) pUrl = currentDomain+pUrl; 
                        var vHref = link.getAttribute('href');
                        if(name && vHref) {
                            var vUrl = vHref.startsWith('http') ? vHref : currentDomain + (vHref.startsWith('/')?'':'/') + vHref.replace(/^\//,'');
                            res.push({name: formatTitle(name.trim(), dur?dur.textContent.trim():'', '▶'), url: vUrl, picture: src, img: src, preview: pUrl}); 
                        }
                    } 
                } 
                return res;
            },
            getFilter: function() { return [ { title: '🗄️ Категорії', action: 'categories' }, { title: '👸 Моделі', action: 'models' }, { title: '🎬 Студії', action: 'studios' } ]; },
            getSort: function(doc) { 
                var act = 'Новые', items = [], btns = doc.querySelector('.btns.btns-s, .tabs .btns'); 
                if (btns) { 
                    var links = btns.querySelectorAll('a, span.act'); 
                    for (var i=0; i<links.length; i++) { 
                        var t = links[i].textContent.trim();
                        // Фільтруємо навігаційне сміття типу "Все категории"
                        if (!t || t.toLowerCase().indexOf('категории') !== -1) continue;
                        if(links[i].tagName === 'SPAN' || links[i].classList.contains('act')) {
                            act = t; items.push({title: '⇅ ' + t, action: 'none'});
                        } else {
                            var h = links[i].getAttribute('href'), u = h.startsWith('http') ? h : this.domain + (h.startsWith('/')?'':'/') + h;
                            items.push({title: t, url: u});
                        }
                    } 
                } 
                return { active: act, items: items }; 
            },
            getMenu: function(doc) { 
                var m = [], added = [], mEls = doc.querySelectorAll('.grd-mdl a, .itm-mdl a, a[href*="/models/"]'); 
                for (var i = 0; i < mEls.length; i++) { 
                    var tM = mEls[i].textContent.trim(), hM = mEls[i].getAttribute('href');
                    if(tM && hM && added.indexOf(tM) === -1 && !tM.includes('img') && tM.length > 1) { m.push({ title: tM, action: 'direct', url: hM }); added.push(tM); }
                } 
                var sEls = doc.querySelectorAll('.vid-aut a, .itm-aut a, .grd-spn a, a[href*="/channels/"]'); 
                for (var j = 0; j < sEls.length; j++) { 
                    var st = sEls[j].textContent.trim().replace(/\s+/g, ' '), hs = sEls[j].getAttribute('href'); 
                    if(st && hs && added.indexOf(st) === -1 && !st.includes('img') && st.length > 1) { m.push({ title: st, action: 'direct', url: hs }); added.push(st); }
                } 
                m.push({ title: 'Категорії', action: 'cats_custom', sel: '.vid-cat a, .itm-tag a' }, { title: 'Схожі відео', action: 'sim' }); 
                return m; 
            },
            play: function(doc, el) { 
                var str = [], a = doc.documentElement.innerHTML.match(/video_alt_url:[\t ]+'([^']+)'/), u = doc.documentElement.innerHTML.match(/video_url:[\t ]+'([^']+)'/); 
                if (a) str.push({ title: 'HD', url: a[1] }); 
                if (u) str.push({ title: 'SD', url: u[1] }); 
                if (str.length > 0) { 
                    var currentDomain = (el.url && el.url.startsWith('http')) ? el.url.match(/^https?:\/\/[^\/]+/)[0] : this.domain;
                    var pData = { title: el.name, url: str[0].url, quality: str, headers: { 'Referer': currentDomain+'/', 'Origin': currentDomain } }; 
                    Lampa.Player.play(pData); Lampa.Player.playlist([pData]); 
                } else Lampa.Noty.show('Відео не знайдено');
            }
        };


        //======= АДАПТЕР LONGVIDEOS =======//
        Adapters['longvideos'] = {
            domain: LONGVIDEOS_DOMAIN,
            parse: function(doc, obj) {
                var path = (obj.url || '').replace(this.domain, '').split('?')[0].replace(/\/+$/, '');
                if (obj.is_models || path === '/models') { var resM = [], mEls = doc.querySelectorAll('.list-models .item'); for(var m=0; m<mEls.length; m++) { if(mEls[m].querySelector('.no-thumb')) continue; var iM = mEls[m].querySelector('img'); if(!iM) continue; var sM = iM.getAttribute('data-original')||iM.getAttribute('data-src')||iM.getAttribute('src'); if(sM && sM.indexOf('data:image')===0) sM = iM.getAttribute('data-src')||iM.getAttribute('data-original'); if(sM && sM.indexOf('//')===0) sM='https:'+sM; else if(sM && sM.indexOf('/')===0) sM=this.domain+sM; var lM = mEls[m].tagName==='A'?mEls[m]:(mEls[m].querySelector('a')||mEls[m]), nM = iM.getAttribute('alt')||lM.getAttribute('title')||'', tM = mEls[m].querySelector('.title, .name, h5'); if(!nM && tM) nM = tM.textContent.trim(); var cM = mEls[m].querySelector('.videos'); if(nM && sM) resM.push({name: formatTitle(nM, cM?cM.textContent.trim():'', '☰'), url: this.domain+lM.getAttribute('href'), picture: sM, is_grid: true, is_models_grid: true}); } return resM; }
                if (obj.is_studios || path === '/sites') { var resS = [], sEls = doc.querySelectorAll('#list_content_sources_sponsors_list_items .headline'); for(var s=0; s<sEls.length; s++) { var lS = sEls[s].querySelector('a.more')||sEls[s].querySelector('a'), tS = sEls[s].querySelector('h1, h2, h3, h4, .title')||lS; if(lS) { var nS = tS.textContent.trim(), sp = tS.querySelector('span'); if(sp) nS = nS.replace(sp.textContent.trim(), '').trim(); if(nS) resS.push({name: nS, url: this.domain+lS.getAttribute('href'), is_grid: true, is_studios_noimg: true}); } } return resS; }
                if (obj.is_categories || obj.is_trends || path === '/categories') { var resC = [], cEls = doc.querySelectorAll(obj.is_trends ? '.tags__item' : '.list-categories__row--list a'); for(var c=0; c<cEls.length; c++) { var nC = cEls[c].textContent.trim(), hC = cEls[c].getAttribute('href'); if(nC && hC) resC.push({name: nC, url: hC.startsWith('http')?hC:this.domain+hC, is_grid: true}); } return resC; }
                var res = [], sel = obj.is_related ? '.related-videos .item' : '.list-videos .item, .item', els = doc.querySelectorAll(sel); for(var i=0; i<els.length; i++) { var l = els[i].querySelector('a.thumb_title'); if(!l) continue; var n = l.textContent.trim(), imgEl = els[i].querySelector('img.thumb'), img = imgEl ? (imgEl.getAttribute('data-src')||imgEl.getAttribute('src')) : ''; if(img && img.indexOf('//')===0) img='https:'+img; else if(img && img.indexOf('/')===0) img=this.domain+img; var pEl = els[i].querySelector('.img.thumb__img'), pUrl = pEl ? pEl.getAttribute('data-preview') : ''; if(pUrl && pUrl.indexOf('//')===0) pUrl='https:'+pUrl; var tEl = els[i].querySelector('.duration'); res.push({name: formatTitle(n, tEl?tEl.textContent.replace(/Full Video/gi,'').trim():'', '▶'), url: this.domain+l.getAttribute('href'), picture: img, preview: pUrl}); } return res;
            },
            getFilter: function() { return [{ title: '🗄️ Категорії', action: 'lv_cat_list' }, { title: '🔥 Тренди', action: 'lv_trend_list' }, { title: '👸 Моделі', action: 'models' }, { title: '🎬 Студії', action: 'studios' }]; },
            getSort: function(doc, curUrl) { var act = 'Latest', items = [], list = doc.querySelector('#_sort_list, #list_videos_common_videos_list_sort_list, #list_content_sources_sponsors_list_sort_list'); var pfx = curUrl.indexOf('/top-rated')!==-1 ? 'Top Rated - ' : (curUrl.indexOf('/most-popular')!==-1 ? 'Most Viewed - ' : ''); if (list) { var links = list.querySelectorAll('a'); for (var i=0; i<links.length; i++) items.push({title: pfx + links[i].textContent.trim(), url: this.domain + links[i].getAttribute('href')}); var sSt = doc.querySelector('.sort strong, .filter-channels strong'); if(sSt) { var rT = sSt.textContent.trim(), iSp = sSt.querySelector('span, small'); if(iSp) rT = rT.replace(iSp.textContent.trim(), '').trim(); act = pfx + rT; } } else if (curUrl.indexOf('/models')===-1 && curUrl.indexOf('/sites')===-1 && curUrl.indexOf('/search')===-1) { if(pfx==='Top Rated - ') act = 'Top Rated'; else if(pfx==='Most Viewed - ') act = 'Most Viewed'; items.push({title: 'Latest', url: this.domain+'/latest-updates/'}, {title: 'Top Rated', url: this.domain+'/top-rated/all/'}, {title: 'Most Viewed', url: this.domain+'/most-popular/all/'}); } return { active: act, items: items }; },
            getMenu: function(doc) { var m = [], src = doc.querySelectorAll('video source'); if (src.length > 1) m.push({ title: 'Відтворити в ' + (src[1].getAttribute('label') || 'SD'), action: 'play_direct', url: src[1].getAttribute('src') }); var mods = doc.querySelectorAll('.btn_model'), added = []; for (var i = 0; i < mods.length; i++) { var t = mods[i].textContent.trim(), u = mods[i].getAttribute('href'); if (t && u && added.indexOf(t) === -1) { m.push({ title: t, action: 'direct', url: u }); added.push(t); } } var spon = doc.querySelectorAll('.btn_sponsor, .btn_sponsor_group'); for (var j = 0; j < spon.length; j++) { var st = spon[j].textContent.trim(); if(spon[j].classList.contains('btn_sponsor_group')) st += ' (Network)'; m.push({ title: st, action: 'direct', url: spon[j].getAttribute('href') }); } m.push({ title: 'Категорії', action: 'cats_custom', sel: '.btn_tag, .btn_tag.hidden' }, { title: 'Схожі відео', action: 'sim' }); return m; },
            play: function(doc, el) { var str = [], src = doc.querySelectorAll('video source'); for(var i=0;i<src.length;i++) str.push({title: src[i].getAttribute('label')||'Оригінал', url: src[i].getAttribute('src')}); if(str.length>0) { Lampa.Player.play({title: el.name, url: str[0].url, quality: str}); Lampa.Player.playlist([{title: el.name, url: str[0].url, quality: str}]); } }
        };

        //======= АДАПТЕР PORNHUB =======//
        Adapters['pornhub'] = {
            domain: PORNHUB_DOMAIN,
            parse: function(doc, obj) {
                var path = (obj.url || '').replace(this.domain, '').split('?')[0];
                if (path.indexOf('/categories') !== -1) { var resCat = [], catEls = doc.querySelectorAll('#categoriesListSection li.tagColumn'); for(var c=0; c<catEls.length; c++) { var lC = catEls[c].querySelector('a'), iC = catEls[c].querySelector('img'); if(lC && iC) { var nC = catEls[c].querySelector('.category-title') ? catEls[c].querySelector('.category-title').textContent.trim() : iC.getAttribute('alt'), hC = lC.getAttribute('href'); if(nC) resCat.push({name: nC, url: hC.startsWith('http')?hC:this.domain+hC, picture: iC.getAttribute('src'), is_grid: true}); } } return resCat; }
                if (path === '/pornstars' || path === '/channels' || obj.is_models) { var isSt = path === '/channels', resM = [], sel = isSt ? '.channelsList li' : '#pornstarListSection li', mEls = doc.querySelectorAll(sel); for(var m=0; m<mEls.length; m++) { var lM = mEls[m].querySelector('a'), iM = mEls[m].querySelector('img'), tM = mEls[m].querySelector('.title'); if(lM && iM) { var nM = tM ? tM.textContent.trim() : iM.getAttribute('alt'); if(nM) resM.push({name: formatTitle(nM, '', '☰'), url: this.domain+lM.getAttribute('href'), picture: iM.getAttribute('src'), is_grid: true, is_models_grid: !isSt, is_studios_noimg: isSt}); } } return resM; }
                var res = [], elements = doc.querySelectorAll('li.videoblock, li.pcVideoListItem'); for (var i = 0; i < elements.length; i++) { var el = elements[i]; if (el.className.indexOf('marker-next-videos') !== -1) continue; var linkEl = el.querySelector('a.linkVideoThumb, a.title, .title a, a'), imgEl = el.querySelector('img'), timeEl = el.querySelector('.duration'); if (linkEl && imgEl) { var name = imgEl.getAttribute('title') || imgEl.getAttribute('alt') || linkEl.textContent.trim(), vUrl = linkEl.getAttribute('href'); if (vUrl && vUrl.indexOf('javascript') === -1) { var img = imgEl.getAttribute('data-mediumthumb') || imgEl.getAttribute('data-thumb_url') || imgEl.getAttribute('src') || ''; if(img && img.indexOf('//')===0) img='https:'+img; var pUrl = imgEl.getAttribute('data-mediabook') || ''; if(pUrl && pUrl.indexOf('//')===0) pUrl='https:'+pUrl; var time = timeEl ? (timeEl.textContent || '').trim() : ''; res.push({ name: formatTitle(name, time, '▶'), url: this.domain + (vUrl.startsWith('/')?'':'/') + vUrl.replace(/^\//,''), picture: img, preview: pUrl }); } } } return res;
            },
            getFilter: function() { return [ { title: '🗄️ Категорії', action: 'ph_cat_list' }, { title: '👸 Моделі', action: 'models' }, { title: '🎬 Студії', action: 'studios' } ]; },
            getSort: function(doc, curUrl) { var uMatch = curUrl.match(/c=([^&]+)/), currentC = uMatch ? uMatch[1] : '', oMatch = curUrl.match(/o=([^&]+)/), currentO = oMatch ? oMatch[1] : '', active = 'Новые', items = []; for (var st = 0; st < PH_SORTS.length; st++) { if (PH_SORTS[st].val === currentO || (currentO === '' && PH_SORTS[st].val === 'cm')) active = PH_SORTS[st].title; } items.push({ title: '⇅ ' + active, action: 'none' }); for (var st2 = 0; st2 < PH_SORTS.length; st2++) { if (PH_SORTS[st2].title === active) continue; var nUrl = this.domain + '/video', params = []; if (currentC) params.push('c=' + currentC); if (PH_SORTS[st2].val) params.push('o=' + PH_SORTS[st2].val); if (params.length > 0) nUrl += '?' + params.join('&'); items.push({ title: PH_SORTS[st2].title, url: nUrl }); } return { active: active, items: items }; },
            getMenu: function(doc) { var m = [], match = doc.documentElement.innerHTML.match(/var\s+flashvars_\d+\s*=\s*(\{[\s\S]+?\});/); if (match) { try { var fv = JSON.parse(match[1]); if (fv.mediaDefinitions) { var defs = fv.mediaDefinitions.filter(function(d){ return d.videoUrl && d.videoUrl !== ''; }); defs.sort(function(a,b){return (parseInt(b.quality)||0)-(parseInt(a.quality)||0);}); if(defs.length>1) m.push({title: 'Відтворити в '+(defs[1].quality||'SD'), action: 'play_direct', url: defs[1].videoUrl.replace(/\\/g, ''), headers: {'Referer': this.domain+'/', 'Origin': this.domain} }); } } catch(e){} } var phMods = doc.querySelectorAll('.pornstarsWrapper .pstar-list-btn'); for (var p = 0; p < phMods.length; p++) m.push({ title: phMods[p].textContent.trim(), action: 'direct', url: this.domain + phMods[p].getAttribute('href') }); m.push({ title: 'Схожі відео', action: 'sim' }); return m; },
            play: function(doc, el) { var match = doc.documentElement.innerHTML.match(/var\s+flashvars_\d+\s*=\s*(\{[\s\S]+?\});/), str = []; if (match) { try { var fv = JSON.parse(match[1]); if (fv.mediaDefinitions) { var defs = fv.mediaDefinitions.filter(function(d){ return d.videoUrl && d.videoUrl !== ''; }); defs.sort(function(a, b) { return (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0); }); for(var k=0; k<defs.length; k++) { var qTitle = defs[k].quality || 'MP4'; if (typeof qTitle === 'number' || !isNaN(qTitle)) qTitle += 'p'; str.push({ title: qTitle, url: defs[k].videoUrl.replace(/\\/g, '') }); } } } catch(e) {} } if (str.length > 0) { var pData = { title: el.name, url: str[0].url, quality: str, headers: { 'Referer': this.domain+'/', 'Origin': this.domain } }; Lampa.Player.play(pData); Lampa.Player.playlist([pData]); } }
        };
        //======= АДАПТЕР PORNDISH =======//
        Adapters['porndish'] = {
            domain: PORNDISH_DOMAIN,
            parse: function(doc, obj) {
                var path = (obj.url || '').replace(this.domain, '').split('?')[0];
                if (path === '/categories' || obj.is_categories) { var resCat = [], cats = doc.querySelectorAll('.g1-nav-menu li a, .entry-category'); for(var c=0; c<cats.length; c++) { var tC = cats[c].textContent.trim(), hC = cats[c].getAttribute('href'); if(tC && hC) resCat.push({name: tC, url: hC.startsWith('http')?hC:this.domain+hC, is_grid: true}); } return resCat; }
                var res = [], elements = doc.querySelectorAll('article.post, .g1-collection-item article, .g1-featured-item article, .g1-mosaic-item article, article.entry-tpl-tile, article.entry-tpl-grid'); for (var i = 0; i < elements.length; i++) { var el = elements[i], linkEl = el.querySelector('.entry-title a') || el.querySelector('a.g1-frame'), titleEl = el.querySelector('.entry-title a'), imgEl = el.querySelector('img'), timeEl = el.querySelector('.mace-video-duration'); if (linkEl) { var vUrl = linkEl.getAttribute('href'); if(vUrl && vUrl.indexOf('http')!==0) vUrl = this.domain+(vUrl.startsWith('/')?'':'/')+vUrl.replace(/^\//,''); var name = titleEl ? titleEl.textContent.trim() : (imgEl?imgEl.getAttribute('alt'):linkEl.textContent.trim()), time = timeEl ? timeEl.textContent.trim() : ''; if (name && vUrl) res.push({ name: formatTitle(name, time, '▶'), url: vUrl, is_porndish_list: true }); } } return res;
            },
            getFilter: function() { return [ { title: '🗄️ Категорії', action: 'categories' } ]; },
            getMenu: function() { return [ { title: 'Схожі відео', action: 'sim' } ]; },
            play: function(doc, el) { var streamix = doc.documentElement.innerHTML.match(/streamixContent.*?src=\\?["']([^"'\s>]+)\\?["']/i); if (streamix) { var rawUrl = streamix[1].replace(/\\/g, ''), parts = rawUrl.match(/https?:\/\/([^\/]+)\/.*?(?:e|v|embed|d)\/([a-zA-Z0-9_-]+)/i); if (parts) { smartRequest('https://' + parts[1] + '/api/stream?filecode=' + parts[2], function(j) { try { var jd = JSON.parse(j); if (jd.streaming_url) { Lampa.Player.play({ title: el.name, url: jd.streaming_url }); Lampa.Player.playlist([{ title: el.name, url: jd.streaming_url }]); } } catch(e){} }, null, { "Referer": "https://" + parts[1] + "/" }); return; } } }
        };

        //======= АДАПТЕР YOUPERV =======//
        Adapters['youperv'] = {
            domain: YOUPERV_DOMAIN,
            parse: function(doc, obj) { var res = [], blocks = doc.querySelectorAll('.items.clearfix'), container = obj.is_related ? (blocks.length > 0 ? blocks[blocks.length - 1] : doc) : doc, elements = container.querySelectorAll('.item'); for (var i = 0; i < elements.length; i++) { var el = elements[i]; if (!el.closest('.items') && !el.closest('.pages-bg')) continue; var linkEl = el.querySelector('a.item-link') || el.querySelector('.item-title a'), imgEl = el.querySelector('img.xfieldimage.poster'), timeEl = el.querySelector('.item-meta.meta-time') || el.querySelector('.item-title .tim'), titleEl = el.querySelector('.item-title h2'); if (linkEl) { var vUrl = this.domain + (linkEl.getAttribute('href').startsWith('/') ? '' : '/') + linkEl.getAttribute('href').replace(/^\//, ''), img = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '') : ''; if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = this.domain + img; var name = titleEl ? titleEl.textContent.trim() : (imgEl ? imgEl.getAttribute('alt') : linkEl.textContent.trim()); name = name.replace(/\(\s*\d{2}\.\d{2}\.\d{4}\s*\)/, '').trim(); var time = timeEl ? timeEl.textContent.trim() : ''; if (name && vUrl) res.push({ name: formatTitle(name, time, '▶'), url: vUrl, picture: img, img: img }); } } return res; },
            getFilter: function() { return [ { title: '🗄️ Популярні категорії', action: 'yp_pop_cats' } ]; },
            getSort: function(doc, curUrl) { var path = curUrl.replace(this.domain, '').split('?')[0], active = 'New'; if (path.indexOf('most-viewed') !== -1) active = 'Most Viewed 30 Days'; else if (path.indexOf('top-porn') !== -1) active = 'Top Rated 30 Days'; var items = []; items.push({ title: '⇅ ' + active, action: 'none' }); if (active !== 'New') items.push({ title: 'New', url: this.domain + '/' }); if (active !== 'Most Viewed 30 Days') items.push({ title: 'Most Viewed 30 Days', url: this.domain + '/top-50-most-viewed-videos.html' }); if (active !== 'Top Rated 30 Days') items.push({ title: 'Top Rated 30 Days', url: this.domain + '/top-porn-videos.html' }); return { active: active, items: items }; },
            getMenu: function(doc) { var m = [], fmetaBlock = doc.querySelector('.fmeta'); if (fmetaBlock) { var ypModels = fmetaBlock.querySelectorAll('a[href*="/xfsearch/pornstar/"]'), addedYP = []; for (var ym = 0; ym < ypModels.length; ym++) { var mName = ypModels[ym].textContent.trim(), mHref = ypModels[ym].getAttribute('href'); if (mName && addedYP.indexOf(mName) === -1) { m.push({ title: mName, action: 'direct', url: mHref }); addedYP.push(mName); } } } m.push({ title: 'Категорії', action: 'cats_custom', sel: '.full-tags a' }, { title: 'Схожі відео', action: 'sim' }); return m; },
            play: function(doc, el) { var str = [], ypSources = doc.querySelectorAll('video source'); for(var y=0; y<ypSources.length; y++) { var sUrl = ypSources[y].getAttribute('src'); if (sUrl) str.push({ title: 'Оригінал', url: sUrl }); } if (str.length > 0) { var pData = { title: el.name, url: str[0].url, quality: str, headers: { 'Referer': this.domain+'/', 'Origin': this.domain } }; Lampa.Player.play(pData); Lampa.Player.playlist([pData]); } }
        };
        //======= АДАПТЕР PORNMZ =======//
        Adapters['pornmz'] = {
            domain: PORNMZ_DOMAIN,
            parse: function(doc, obj) {
                var path = (obj.url || '').replace(this.domain, '').split('?')[0];
                var isGrid = obj.is_categories || obj.is_models || path.indexOf('/categories') !== -1 || path.indexOf('/actors') !== -1;
                var res = [], elements = doc.querySelectorAll('.videos-list article, article[data-video-id], article.thumb-block');
                for (var i = 0; i < elements.length; i++) {
                    var el = elements[i], linkEl = el.querySelector('a'), titleEl = el.querySelector('.title') || el.querySelector('.cat-title') || el.querySelector('.entry-title');
                    if (linkEl) {
                        var vUrl = linkEl.getAttribute('href'); if (vUrl && vUrl.indexOf('http') !== 0) vUrl = this.domain + (vUrl.startsWith('/') ? '' : '/') + vUrl.replace(/^\//, '');
                        var img = el.getAttribute('data-main-thumb') || ''; if (!img) { var imgEl = el.querySelector('img'); if(imgEl) img = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || ''; }
                        if (img && img.indexOf('//') === 0) img = 'https:' + img; else if (img && img.indexOf('/') === 0) img = this.domain + img;
                        var name = titleEl ? titleEl.textContent.trim() : (linkEl.getAttribute('title') || '');
                        if (!name && el.querySelector('img')) name = el.querySelector('img').getAttribute('alt') || '';
                        var timeEl = el.querySelector('.duration, .time'), time = timeEl ? timeEl.textContent.trim() : '';
                        if (name && vUrl) res.push({ name: isGrid ? name : formatTitle(name, time, '▶'), url: vUrl, picture: img, img: img, is_grid: isGrid, is_16x9_grid: isGrid });
                    }
                } return res;
            },
            getFilter: function() { return [ { title: '🗄️ Категорії', action: 'categories' }, { title: '👸 Моделі', action: 'models' } ]; },
            getSort: function(doc) { var active = 'Newest', items = [], list = doc.querySelector('.filters-list'); if (list) { var actA = list.querySelector('a.active'); if (actA) active = actA.textContent.trim(); var links = list.querySelectorAll('a'); for (var i = 0; i < links.length; i++) { var t = links[i].textContent.trim(), h = links[i].getAttribute('href'); if (h && h.indexOf('http') !== 0) h = this.domain + (h.startsWith('/')?'':'/') + h.replace(/^\//, ''); if (t === active) items.push({ title: '⇅ ' + t, action: 'none' }); else items.push({ title: t, url: h }); } } return { active: active, items: items }; },
            getMenu: function(doc) { var m = [], mzModels = doc.querySelectorAll('.tags-list a[href*="pmactor"]'); for (var zm = 0; zm < mzModels.length; zm++) { var mdlTitle = mzModels[zm].textContent.trim(); if (mdlTitle) m.push({ title: mdlTitle, action: 'direct', url: mzModels[zm].getAttribute('href') }); } m.push({ title: 'Категорії', action: 'cats_custom', sel: '.tags-list a[href*="/c/"]' }, { title: 'Схожі відео', action: 'sim' }); return m; },
            play: function(doc, el) { 
                var metaVid = doc.querySelector('meta[itemprop="contentURL"]'), vSrc = metaVid ? metaVid.getAttribute('content') : null;
                if (vSrc && vSrc.indexOf('.m3u8') !== -1) {
                    smartRequest(vSrc, function(m3Text) {
                        var lines = m3Text.split('\n'), bestRes = -1, bestUrl = '';
                        for (var l = 0; l < lines.length; l++) { if (lines[l].indexOf('#EXT-X-STREAM-INF') !== -1) { var resM = lines[l].match(/RESOLUTION=\d+x(\d+)/), resVal = resM ? parseInt(resM[1]) : 0, nextL = lines[l+1] ? lines[l+1].trim() : ''; if (nextL && nextL.indexOf('#') !== 0 && resVal > bestRes) { bestRes = resVal; var sUrl = nextL; if (sUrl.indexOf('http') !== 0) { if (sUrl.indexOf('/') === 0) sUrl = vSrc.match(/^(https?:\/\/[^\/]+)/)[1] + sUrl; else sUrl = vSrc.substring(0, vSrc.lastIndexOf('/') + 1) + sUrl; } bestUrl = sUrl; } } }
                        var pData = { title: el.name, url: bestUrl || vSrc, headers: { 'Referer': PORNMZ_DOMAIN+'/', 'Origin': PORNMZ_DOMAIN } }; Lampa.Player.play(pData); Lampa.Player.playlist([pData]);
                    }, function() { var pData2 = { title: el.name, url: vSrc, headers: { 'Referer': PORNMZ_DOMAIN+'/', 'Origin': PORNMZ_DOMAIN } }; Lampa.Player.play(pData2); Lampa.Player.playlist([pData2]); });
                } else if (vSrc) { Lampa.Player.play({ title: el.name, url: vSrc }); Lampa.Player.playlist([{ title: el.name, url: vSrc }]); } else { var pzSources = doc.querySelectorAll('video source'), str = []; for(var z=0; z<pzSources.length; z++) { var zUrl = pzSources[z].getAttribute('src'); if (zUrl) str.push({ title: pzSources[z].getAttribute('label') || 'Оригінал', url: zUrl }); } if (str.length > 0) { Lampa.Player.play({ title: el.name, url: str[0].url, quality: str }); Lampa.Player.playlist([{ title: el.name, url: str[0].url, quality: str }]); } }
            },
            checkEnd: function(doc, url, page) { var canon = doc.querySelector('link[rel="canonical"]'); if (page > 1 && canon && canon.href && url.indexOf('/page/' + page) !== -1 && canon.href.indexOf('/page/' + page) === -1) return true; var pagination = doc.querySelector('.pagination'); if (pagination) { var currentSpan = pagination.querySelector('.current'); if (!currentSpan || parseInt(currentSpan.textContent) !== page) return true; } else if (page > 1) return true; return false; }
        };
        //======= ГОЛОВНИЙ КОНТРОЛЕР LAMPA =======//
        function CustomCatalog(object) {
            var comp = new Lampa.InteractionCategory(object), currentSite = object.site || 'porno365';

            comp.create = function () {
                var _this = this; this.activity.loader(true);
                if (currentSite === 'bookmarks') { var bmarks = window.Lampa.Storage.get('pluginx_bookmarks', []); if (bmarks.length > 0) { _this.build({ results: bmarks, collection: true, total_pages: 1, page: 1 }); var rendered = _this.render(); rendered.addClass('main-grid'); if (bmarks[0].is_porndish_list) rendered.addClass('is-porndish-list'); else if (bmarks[0].is_16x9_grid) rendered.addClass('is-16x9-grid'); else if (bmarks[0].is_studios_noimg) rendered.addClass('is-noimg-grid'); else if (bmarks[0].is_models_grid) rendered.addClass('is-models-grid'); else if (bmarks[0].is_grid) rendered.addClass('is-categories-grid'); } else _this.empty(); return; }
                
                var adapter = Adapters[currentSite] || Adapters['porno365'];
                var target = object.url || adapter.domain;
                
                if (currentSite === 'lenkino' || currentSite === 'youperv' || currentSite === 'pornmz') { var uParts = target.split('?'), baseS = uParts[0].replace(/\/page\/[0-9]+(\/?)$/, '').replace(/\/+$/, ''); if(baseS.indexOf('.html') === -1 && target.indexOf('do=search') === -1) target = baseS + (object.page > 1 ? '/page/' + object.page + '/' : '/') + (uParts.length > 1 ? '?' + uParts[1] : ''); } else if ((currentSite === 'longvideos' || currentSite === 'porndish') && object.page > 1) { var uParts2 = target.split('?'), baseS2 = uParts2[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/+$/, ''); if (!baseS2.endsWith('/')) baseS2 += '/'; target = baseS2 + 'page/' + object.page + '/' + (uParts2.length > 1 ? '?' + uParts2[1] : ''); } else if (currentSite === 'pornhub' && object.page > 1) { target = target + (target.indexOf('?') === -1 ? '?' : '&') + 'page=' + object.page; }
                
                smartRequest(target, function (htmlText) {
                    var parser = new DOMParser(), doc = parser.parseFromString(htmlText, 'text/html');
                    if (adapter.checkEnd && adapter.checkEnd(doc, target, object.page || 1)) { _this.empty(); return; }
                    _this._sortData = adapter.getSort ? adapter.getSort(doc, target) : null;
                    var res = adapter.parse(doc, object);
                    if (res && res.length > 0) { 
                        _this.build({ results: res, collection: true, total_pages: 1000, page: object.page || 1 }); 
                        var rendered = _this.render(); rendered.addClass('main-grid'); 
                        if (res[0].is_porndish_list) rendered.addClass('is-porndish-list'); 
                        else if (res[0].is_16x9_grid) rendered.addClass('is-16x9-grid'); 
                        else if (res[0].is_studios_noimg) rendered.addClass('is-noimg-grid'); 
                        else if (res[0].is_models_grid) rendered.addClass('is-models-grid'); 
                        else if (res[0].is_grid) rendered.addClass('is-categories-grid'); 
                    } else _this.empty(); 
                }, this.empty.bind(this));
            };

            comp.nextPageReuest = function (object, resolve, reject) {
                if (currentSite === 'bookmarks' || object.is_related) return reject(); 
                var adapter = Adapters[currentSite] || Adapters['porno365'];
                var targetPath = (object.url || '').replace(adapter.domain, '').split('?')[0].replace(/\/+$/, ''); 
                if (targetPath === '/categories' || object.is_categories || object.is_trends) return reject(); 
                if (currentSite === 'youperv' && (targetPath.indexOf('.html') !== -1 || (object.url || '').indexOf('do=search') !== -1)) return reject(); 
                
                var url = object.url || adapter.domain; 
                if (currentSite === 'lenkino' || currentSite === 'youperv' || currentSite === 'pornmz') { var uP = url.split('?'), bL = uP[0].replace(/\/page\/[0-9]+(\/?)$/, '').replace(/\/+$/, ''); if(bL.indexOf('.html') === -1 && url.indexOf('do=search') === -1) url = bL + '/page/' + object.page + '/' + (uP.length > 1 ? '?' + uP[1] : ''); } else if (currentSite === 'longvideos' || currentSite === 'porndish') { var uP2 = url.split('?'), bL2 = uP2[0].replace(/\/page\/[0-9]+\/?$/, '').replace(/\/+$/, ''); if (!bL2.endsWith('/')) bL2 += '/'; url = bL2 + 'page/' + object.page + '/' + (uP2.length > 1 ? '?' + uP2[1] : ''); } else if (currentSite === 'pornhub') { url = (object.url || (PORNHUB_DOMAIN + '/video')) + ((object.url || '').indexOf('?') === -1 ? '?' : '&') + 'page=' + object.page; } else { var base365 = (adapter.domain).replace(/\/page\/[0-9]+$/, '').replace(/\/+$/, ''); url = base365 + (base365.indexOf('?') !== -1 ? '&' : '/') + object.page; }
                
                smartRequest(url, function (htmlText) { 
                    var parser = new DOMParser(), doc = parser.parseFromString(htmlText, 'text/html');
                    if (adapter.checkEnd && adapter.checkEnd(doc, url, object.page)) return reject();
                    var res = adapter.parse(doc, object); 
                    if (res && res.length > 0) resolve({ results: res, collection: true, total_pages: 1000, page: object.page }); 
                    else reject(); 
                }, reject);
            };
            comp.filter = function () {
                var adapter = Adapters[currentSite] || Adapters['porno365'];
                var items = [ { title: '🏠 Головна', action: 'home' }, { title: '🔍 Пошук', action: 'search' }, { title: '⭐ Обране', action: 'bookmarks' } ];
                if (adapter.getFilter) items = items.concat(adapter.getFilter());
                
                // Дворядкове сортування
                if (this._sortData && this._sortData.items && this._sortData.items.length > 0) {
                    items.push({ title: '↕️ Сортування', subtitle: '⇅ ' + this._sortData.active.replace('⇅ ', ''), action: 'sort' });
                }
                
                Lampa.Select.show({ title: 'Навігація', items: items, onSelect: function (a) {
                    if (a.action === 'none') return;
                    if (a.action === 'home') { Lampa.Activity.push({ url: adapter.domain + (currentSite==='longvideos'?'/latest-updates/':(currentSite==='pornhub'?'/video':'/')), title: 'Головна', component: 'pluginx_comp', site: currentSite, page: 1 }); }
                    else if (a.action === 'search') { Lampa.Input.edit({ title: 'Пошук', value: '', free: true, nosave: true }, function(v) { if (v) { var sUrl = adapter.domain + '/search/?q=' + encodeURIComponent(v); if (currentSite === 'lenkino') sUrl = adapter.domain + '/search/' + encodeURIComponent(v); if (currentSite === 'longvideos') sUrl = adapter.domain + '/search/' + encodeURIComponent(v) + '/relevance/'; if (currentSite === 'pornhub') sUrl = adapter.domain + '/video/search?search=' + encodeURIComponent(v); if (currentSite === 'porndish' || currentSite === 'pornmz') sUrl = adapter.domain + '/?s=' + encodeURIComponent(v); if (currentSite === 'youperv') { if(v.length < 4) { Lampa.Noty.show('Мінімум 4 символи для YouPerv'); return; } sUrl = adapter.domain + '/index.php?do=search&subaction=search&story=' + encodeURIComponent(v); } Lampa.Activity.push({ url: sUrl, title: 'Пошук: ' + v, component: 'pluginx_comp', site: currentSite, page: 1 }); } Lampa.Controller.toggle('content'); }); }
                    else if (a.action === 'bookmarks') Lampa.Activity.push({ title: '⭐ Обране', component: 'pluginx_comp', site: 'bookmarks', page: 1 });
                    else if (a.action === 'categories') Lampa.Activity.push({ url: adapter.domain + (currentSite === 'porndish' ? '/' : '/categories'), title: '🗄️ Категорії', component: 'pluginx_comp', site: currentSite, page: 1, is_categories: true });
                    else if (a.action === 'models') Lampa.Activity.push({ url: adapter.domain + (currentSite === 'lenkino' || currentSite === 'pornhub' ? '/pornstars' : (currentSite === 'pornmz' ? '/actors' : '/models/')), title: '👸 Моделі', component: 'pluginx_comp', site: currentSite, page: 1, is_models: true });
                    else if (a.action === 'studios') Lampa.Activity.push({ url: adapter.domain + (currentSite === 'longvideos' ? '/sites/' : '/channels'), title: '🎬 Студії', component: 'pluginx_comp', site: currentSite, page: 1, is_studios: true });
                    else if (a.action === 'yp_pop_cats') { smartRequest(adapter.domain + '/', function(html) { var doc = new DOMParser().parseFromString(html, 'text/html'), links = doc.querySelectorAll('span[class^="clouds_"] a'), menu = [], added = []; for(var i=0; i<links.length; i++) { var h = links[i].getAttribute('href'), t = (links[i].textContent || '').trim(); if(h && t && added.indexOf(t) === -1) { menu.push({title: t, url: h.startsWith('http') ? h : adapter.domain + h}); added.push(t); } } if(menu.length) Lampa.Select.show({ title: '🗄️ Популярні категорії', items: menu, onSelect: function(it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: currentSite, page: 1 }); }, onBack: function() { comp.filter(); } }); }); }
                    else if (a.action === 'lv_cat_list' || a.action === 'lv_trend_list') { smartRequest(adapter.domain + '/categories/', function(html) { var doc = new DOMParser().parseFromString(html, 'text/html'), links = doc.querySelectorAll(a.action === 'lv_trend_list' ? '.tags__item' : '.list-categories__row--list a'), menu = []; for(var i=0; i<links.length; i++) { var h = links[i].getAttribute('href'); if(h) menu.push({title: (links[i].textContent || '').trim(), url: h.startsWith('http') ? h : adapter.domain + h}); } if(menu.length) Lampa.Select.show({ title: a.action === 'lv_trend_list' ? '🔥 Трендові запити' : '🗄️ Категорії', items: menu, onSelect: function(it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: currentSite, page: 1 }); }, onBack: function() { comp.filter(); } }); }); }
                    else if (a.action === 'ph_cat_list') { var mPH = []; for(var c=0; c<PH_CATS.length; c++) mPH.push({title: PH_CATS[c].title, url: adapter.domain + '/video' + (PH_CATS[c].val ? '?c=' + PH_CATS[c].val : '') }); Lampa.Select.show({ title: '🗄️ Категорії', items: mPH, onSelect: function(it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: currentSite, page: 1 }); }, onBack: function() { comp.filter(); } }); }
                    else if (a.action === 'sort') Lampa.Select.show({ title: 'Сортування', items: comp._sortData.items, onSelect: function(s) { if (s.action === 'none') return; var cleanTitle = s.title.replace('Top Rated - ', '').replace('Most Viewed - ', '').replace('⇅ ', ''); Lampa.Activity.push({ url: s.url, title: cleanTitle, component: 'pluginx_comp', site: currentSite, page: 1, is_models: object.is_models, is_studios: object.is_studios }); }, onBack: function() { comp.filter(); } });
                }, onBack: function () { Lampa.Controller.toggle('content'); } });
            };

            comp.cardRender = function (card, element, events) {
                events.onEnter = function () {
                    var targetSite = currentSite; if (currentSite === 'bookmarks') { if (element.url.indexOf(LENKINO_DOMAIN) !== -1) targetSite = 'lenkino'; else if (element.url.indexOf(LONGVIDEOS_DOMAIN) !== -1) targetSite = 'longvideos'; else if (element.url.indexOf(PORNHUB_DOMAIN) !== -1) targetSite = 'pornhub'; else if (element.url.indexOf(PORNDISH_DOMAIN) !== -1) targetSite = 'porndish'; else if (element.url.indexOf(YOUPERV_DOMAIN) !== -1) targetSite = 'youperv'; else if (element.url.indexOf(PORNMZ_DOMAIN) !== -1) targetSite = 'pornmz'; else targetSite = 'porno365'; }
                    if (element.is_grid) { Lampa.Activity.push({ url: element.url, title: element.name, component: 'pluginx_comp', site: targetSite, page: 1, is_models: false }); return; }
                    var adapter = Adapters[targetSite] || Adapters['porno365'];
                    smartRequest(element.url, function(htmlText) {
                        var doc = new DOMParser().parseFromString(htmlText, 'text/html');
                        adapter.play(doc, element);
                    }, function() { Lampa.Noty.show('Помилка мережі'); });
                };

                events.onFocus = function (target) { hidePreview(); if (element.preview && !element.is_grid) previewTimeout = setTimeout(function () { showPreview($(target), element.preview); }, 1000); };
                
                events.onMenu = function () {
                    hidePreview(); var bmarks = window.Lampa.Storage.get('pluginx_bookmarks', []); var isBookmarked = bmarks.some(function(b) { return b.url === element.url; }); var toggleBookmark = function() { var currentBmarks = window.Lampa.Storage.get('pluginx_bookmarks', []); var idx = currentBmarks.findIndex(function(b) { return b.url === element.url; }); if (idx !== -1) { currentBmarks.splice(idx, 1); Lampa.Noty.show('Видалено з обраного'); } else { currentBmarks.unshift(element); Lampa.Noty.show('Додано до обраного'); } window.Lampa.Storage.set('pluginx_bookmarks', currentBmarks); };
                    var targetSite = currentSite; if (currentSite === 'bookmarks') { if (element.url.indexOf(LENKINO_DOMAIN) !== -1) targetSite = 'lenkino'; else if (element.url.indexOf(LONGVIDEOS_DOMAIN) !== -1) targetSite = 'longvideos'; else if (element.url.indexOf(PORNHUB_DOMAIN) !== -1) targetSite = 'pornhub'; else if (element.url.indexOf(PORNDISH_DOMAIN) !== -1) targetSite = 'porndish'; else if (element.url.indexOf(YOUPERV_DOMAIN) !== -1) targetSite = 'youperv'; else if (element.url.indexOf(PORNMZ_DOMAIN) !== -1) targetSite = 'pornmz'; else targetSite = 'porno365'; }
                    
                    smartRequest(element.url, function (htmlText) {
                        var doc = new DOMParser().parseFromString(htmlText, 'text/html'), menu = [{ title: isBookmarked ? '★ Видалити з обраного' : '☆ Додати до обраного', action: 'bookmark' }];
                        var adapter = Adapters[targetSite] || Adapters['porno365'];
                        if (adapter.getMenu && !element.is_grid) menu = menu.concat(adapter.getMenu(doc));
                        
                        Lampa.Select.show({ title: 'Дії', items: menu, onSelect: function (a) { 
                            if (a.action === 'bookmark') toggleBookmark(); 
                            else if (a.action === 'play_direct') { Lampa.Player.play({ title: element.name, url: a.url, headers: a.headers }); Lampa.Player.playlist([{ title: element.name, url: a.url, headers: a.headers }]); } 
                            else if (a.action === 'sim' || a.action === 'direct') { Lampa.Activity.push({ url: a.url || element.url, title: a.title || 'Схожі', component: 'pluginx_comp', site: targetSite, page: 1, is_related: (a.action === 'sim') }); } 
                            else if (a.action === 'cats_custom') { var subEls = doc.querySelectorAll(a.sel), sub = []; for (var i = 0; i < subEls.length; i++) { var st = (subEls[i].textContent || '').trim(); if (st) sub.push({ title: st, url: subEls[i].getAttribute('href') }); } if (sub.length > 0) Lampa.Select.show({ title: a.title, items: sub, onSelect: function (it) { Lampa.Activity.push({ url: it.url, title: it.title, component: 'pluginx_comp', site: targetSite, page: 1 }); }, onBack: function () { events.onMenu(); } }); } 
                        }, onBack: function () { Lampa.Controller.toggle('content'); } });
                    });
                };
            };
            comp.onRight = comp.filter.bind(comp); return comp;
        }

        Lampa.Component.add('pluginx_comp', CustomCatalog);
        (function() { var currentActivity, hideTimeout, isClicking = false, filterBtn = $('<div class="head__action head__settings selector pluginx-filter-btn"><svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="35" height="33" rx="1.5" stroke="currentColor" stroke-width="3"></rect><rect x="7" y="8" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="16" width="24" height="3" rx="1.5" fill="currentColor"></rect><rect x="7" y="25" width="24" height="3" rx="1.5" fill="currentColor"></rect><circle cx="13.5" cy="17.5" r="3.5" fill="currentColor"></circle><circle cx="23.5" cy="26.5" r="3.5" fill="currentColor"></circle><circle cx="21.5" cy="9.5" r="3.5" fill="currentColor"></circle></svg></div>'); filterBtn.hide().on('hover:enter click', function() { if (isClicking) return; isClicking = true; setTimeout(function() { isClicking = false; }, 300); try { if (currentActivity && currentActivity.activity) { var c = (window.Lampa.Manifest && window.Lampa.Manifest.app_digital >= 300) ? currentActivity.activity.component : currentActivity.activity.component(); if (c && typeof c.filter === 'function') c.filter(); } } catch (e) { } }); Lampa.Listener.follow('activity', function(e) { if (e.type == 'start') currentActivity = e.object; clearTimeout(hideTimeout); hideTimeout = setTimeout(function() { if (currentActivity && currentActivity.component !== 'pluginx_comp') filterBtn.hide(); }, 1000); if (e.type == 'start' && e.component == 'pluginx_comp') { if ($('.head .open--search').length) $('.head .open--search').before(filterBtn); else $('.head__actions').prepend(filterBtn); filterBtn.show(); currentActivity = e.object; } }); })();
    }

    function addMenu() {
        if (window.Lampa && window.Lampa.Storage) { var hiddenMenu = window.Lampa.Storage.get('menu_hide'); if (hiddenMenu && Array.isArray(hiddenMenu)) { var idx = hiddenMenu.indexOf('pluginx'); if (idx !== -1) { hiddenMenu.splice(idx, 1); window.Lampa.Storage.set('menu_hide', hiddenMenu); } } }
        var menuList = $('.menu .menu__list').eq(0);
        if (menuList.length && menuList.find('[data-action="pluginx"]').length === 0) {
            var item = $('<li class="menu__item selector" data-action="pluginx" id="menu_pluginx"><div class="menu__ico"><img src="https://bodya-elven.github.io/different/icons/pluginx.svg" width="24" height="24" style="filter: brightness(0) invert(1);" /></div><div class="menu__text">CatalogX</div></li>');
            item.on('hover:enter', function () { Lampa.Select.show({ title: 'CatalogX', items: [{ title: 'Porno365', site: 'porno365' }, { title: 'Lenkino', site: 'lenkino' }, { title: 'LongVideos', site: 'longvideos' }, { title: 'Pornhub', site: 'pornhub' }, { title: 'Porndish', site: 'porndish' }, { title: 'YouPerv', site: 'youperv' }, { title: 'Pornmz', site: 'pornmz' }], onSelect: function(a) { Lampa.Activity.push({ title: a.title, component: 'pluginx_comp', site: a.site, page: 1 }); }, onBack: function() { Lampa.Controller.toggle('menu'); } }); });
            var settings = menuList.find('[data-action="settings"]'); if (settings.length) item.insertBefore(settings); else menuList.append(item);
        }
    }
    function initPlugin() { startPlugin(); addMenu(); }
    if (window.appready) initPlugin(); else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') initPlugin(); });
})();
