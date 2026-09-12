(function () {
    'use strict';

    if (window.lampa_weather_plugin) return;
    window.lampa_weather_plugin = true;

    var PLUGIN = 'lampa_weather';
    var STORAGE = 'lampa_weather_settings';

    var DEFAULTS = {
        city: 'Киев',
        lat: 50.4501,
        lon: 30.5234,
        units: 'celsius',
        refresh_min: 30,
        enabled: true
    };

    var WMO = {
        0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
        45: '🌫', 48: '🌫',
        51: '🌦', 53: '🌦', 55: '🌧',
        56: '🌧', 57: '🌧',
        61: '🌧', 63: '🌧', 65: '🌧',
        66: '🌧', 67: '🌧',
        71: '🌨', 73: '🌨', 75: '❄️',
        77: '🌨',
        80: '🌦', 81: '🌧', 82: '⛈',
        85: '🌨', 86: '❄️',
        95: '⛈', 96: '⛈', 99: '⛈'
    };

    var timer = null;
    var $widget = null;

    function getSettings() {
        var s = Lampa.Storage.get(STORAGE, {});
        return Object.assign({}, DEFAULTS, s);
    }

    function setSettings(obj) {
        var s = getSettings();
        Object.assign(s, obj);
        Lampa.Storage.set(STORAGE, s);
    }

    function injectCSS() {
        if (document.getElementById('lampa-weather-css')) return;
        var css = `
            .lampa-weather-widget {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.3em;
                padding: 0.28em 0.7em;
                margin-right: 0.5em;
                border-radius: 999px;
                background: rgba(255,255,255,0.12);
                font-size: 0.95em;
                line-height: 1;
                white-space: nowrap;
                width: auto;
                max-width: none;
                box-sizing: border-box;
                cursor: pointer;
            }
            .lampa-weather-widget:hover,
            .lampa-weather-widget.focus {
                background: rgba(255,255,255,0.2);
            }
            .lampa-weather-widget__icon {
                font-size: 1.1em;
                line-height: 1;
                flex-shrink: 0;
            }
            .lampa-weather-widget__temp {
                font-weight: 600;
                line-height: 1;
                flex-shrink: 0;
            }
            .lampa-weather-widget__city {
                display: none;
            }
            .lampa-weather-widget.loading {
                opacity: 0.55;
            }
        `;
        var style = document.createElement('style');
        style.id = 'lampa-weather-css';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function request(url, success, error) {
        var net = new Lampa.Reguest();
        net.timeout(10000);
        net.silent(url, success, error || function () {});
    }

    function formatTemp(t, units) {
        if (units === 'fahrenheit') {
            return Math.round(t * 9 / 5 + 32) + '°F';
        }
        return Math.round(t) + '°C';
    }

    function updateWidget(data) {
        if (!$widget || !data) return;
        var s = getSettings();
        var code = data.weather_code;
        var icon = WMO[code] || '🌡';
        var temp = formatTemp(data.temperature, s.units);
        var city = s.city || '';

        $widget.removeClass('loading');
        $widget.find('.lampa-weather-widget__icon').text(icon);
        $widget.find('.lampa-weather-widget__temp').text(temp);
        $widget.find('.lampa-weather-widget__city').text(city);
        $widget.attr('title', city + ': ' + temp + (data.wind != null ? ', ветер ' + Math.round(data.wind) + ' км/ч' : ''));
    }

    function fetchWeather() {
        var s = getSettings();
        if (!s.enabled || !s.lat || !s.lon) return;

        if ($widget) $widget.addClass('loading');

        var url = 'https://api.open-meteo.com/v1/forecast'
            + '?latitude=' + s.lat
            + '&longitude=' + s.lon
            + '&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m'
            + '&timezone=auto'
            + '&wind_speed_unit=kmh';

        request(url, function (json) {
            if (!json || !json.current) {
                if ($widget) $widget.removeClass('loading');
                return;
            }
            var cur = json.current;
            var payload = {
                temperature: cur.temperature_2m,
                weather_code: cur.weather_code,
                humidity: cur.relative_humidity_2m,
                wind: cur.wind_speed_10m
            };
            updateWidget(payload);
            setSettings({
                last: Object.assign({}, payload, { ts: Date.now() })
            });
        }, function () {
            if ($widget) $widget.removeClass('loading');
            var s2 = getSettings();
            if (s2.last) updateWidget(s2.last);
        });
    }

    function searchCity(query, callback) {
        if (!query || query.length < 2) {
            callback([]);
            return;
        }
        var url = 'https://geocoding-api.open-meteo.com/v1/search'
            + '?name=' + encodeURIComponent(query)
            + '&count=8'
            + '&language=ru'
            + '&format=json';

        request(url, function (json) {
            var list = (json && json.results) ? json.results : [];
            callback(list.map(function (r) {
                return {
                    title: r.name + (r.admin1 ? ', ' + r.admin1 : '') + (r.country ? ' (' + r.country + ')' : ''),
                    name: r.name,
                    lat: r.latitude,
                    lon: r.longitude,
                    country: r.country || ''
                };
            }));
        }, function () {
            callback([]);
        });
    }

    function openCitySelect() {
        Lampa.Input.edit({
            title: 'Город',
            value: getSettings().city || '',
            free: true,
            nosave: true
        }, function (value) {
            if (!value) {
                Lampa.Controller.toggle('settings');
                return;
            }

            Lampa.Noty.show('Ищу город...');
            searchCity(value, function (results) {
                if (!results.length) {
                    Lampa.Noty.show('Город не найден');
                    Lampa.Controller.toggle('settings');
                    return;
                }

                Lampa.Select.show({
                    title: 'Выберите город',
                    items: results.map(function (r) {
                        return {
                            title: r.title,
                            city: r
                        };
                    }),
                    onSelect: function (item) {
                        var c = item.city;
                        setSettings({
                            city: c.name,
                            lat: c.lat,
                            lon: c.lon
                        });
                        Lampa.Noty.show('Город: ' + c.name);
                        fetchWeather();
                        Lampa.Controller.toggle('settings');
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('settings');
                    }
                });
            });
        });
    }

    function showDetails() {
        var s = getSettings();
        var last = s.last;
        if (!last) {
            Lampa.Noty.show('Нет данных о погоде');
            return;
        }

        var lines = [
            (WMO[last.weather_code] || '🌡') + '  ' + formatTemp(last.temperature, s.units),
            'Город: ' + (s.city || '—')
        ];
        if (last.humidity != null) lines.push('Влажность: ' + last.humidity + '%');
        if (last.wind != null) lines.push('Ветер: ' + Math.round(last.wind) + ' км/ч');

        Lampa.Noty.show(lines.join(' · '));
    }

    function createWidget() {
        if ($widget && $widget.length) return;

        $widget = $(
            '<div class="lampa-weather-widget selector head__action">' +
                '<span class="lampa-weather-widget__icon">🌡</span>' +
                '<span class="lampa-weather-widget__temp">—</span>' +
                '<span class="lampa-weather-widget__city"></span>' +
            '</div>'
        );

        $widget.on('hover:enter', function () {
            showDetails();
        });

        try {
            if (Lampa.Head && Lampa.Head.addElement) {
                Lampa.Head.addElement($widget[0], function () {
                    showDetails();
                });
            } else {
                var $actions = $('.head__actions, .head .head__body').first();
                if ($actions.length) $actions.prepend($widget);
                else $('body').append($widget);
            }
        } catch (e) {
            var $head = $('.head__actions').first();
            if ($head.length) $head.prepend($widget);
        }

        var s = getSettings();
        if (s.last) updateWidget(s.last);
    }

    function startRefreshTimer() {
        if (timer) clearInterval(timer);
        var s = getSettings();
        var ms = Math.max(5, s.refresh_min || 30) * 60 * 1000;
        timer = setInterval(fetchWeather, ms);
    }

    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: PLUGIN,
            name: 'Погода',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: { name: 'weather_enabled', type: 'trigger', default: true },
            field: {
                name: 'Показывать виджет',
                description: 'Виджет погоды в шапке возле часов'
            },
            onChange: function (value) {
                setSettings({ enabled: value });
                if ($widget) $widget.toggle(!!value);
                if (value) fetchWeather();
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: { name: 'weather_city', type: 'button' },
            field: {
                name: 'Город',
                description: 'Текущий: ' + (getSettings().city || 'не выбран')
            },
            onChange: function () {
                openCitySelect();
            },
            onRender: function (item) {
                var city = getSettings().city || 'не выбран';
                setTimeout(function () {
                    $('.settings-param__descr', item).text('Текущий: ' + city);
                }, 50);
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: {
                name: 'weather_units',
                type: 'select',
                values: {
                    'celsius': '°C (Цельсий)',
                    'fahrenheit': '°F (Фаренгейт)'
                },
                default: 'celsius'
            },
            field: {
                name: 'Единицы температуры',
                description: 'В каких единицах показывать температуру'
            },
            onChange: function (value) {
                setSettings({ units: value });
                var s = getSettings();
                if (s.last) updateWidget(s.last);
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: {
                name: 'weather_refresh',
                type: 'select',
                values: {
                    '15': '15 минут',
                    '30': '30 минут',
                    '60': '1 час',
                    '120': '2 часа'
                },
                default: '30'
            },
            field: {
                name: 'Обновлять каждые',
                description: 'Как часто запрашивать погоду'
            },
            onChange: function (value) {
                setSettings({ refresh_min: parseInt(value, 10) });
                startRefreshTimer();
            }
        });

        Lampa.SettingsApi.addParam({
            component: PLUGIN,
            param: { name: 'weather_refresh_now', type: 'button' },
            field: {
                name: 'Обновить сейчас',
                description: 'Запросить актуальную погоду'
            },
            onChange: function () {
                fetchWeather();
                Lampa.Noty.show('Обновляю погоду...');
            }
        });
    }

    function start() {
        injectCSS();
        addSettings();

        var s = getSettings();
        Lampa.Storage.set('weather_enabled', s.enabled);
        Lampa.Storage.set('weather_units', s.units);
        Lampa.Storage.set('weather_refresh', String(s.refresh_min));

        createWidget();

        if (s.enabled) {
            fetchWeather();
            startRefreshTimer();
        } else if ($widget) {
            $widget.hide();
        }

        console.log('[lampa-weather] loaded');
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
