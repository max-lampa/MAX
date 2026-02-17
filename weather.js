(function () {
    'use strict';

    var SETTINGS_COMPONENT = 'weather_widget';
    var SETTINGS_PARAM = 'WeatherWidgetEnabled';
	
var WEATHER_ICON =
  '<svg width="88" height="83" viewBox="0 0 88 83" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill="white" fill-rule="evenodd" clip-rule="evenodd" d="' +
      'M22 60C14 58 8 52 8 44C8 37 13 32 21 31C23 22 31 17 42 17C53 17 61 21 66 29C68 28.5 70 28 72 28C80 28 86 34 86 42C86 51 79 58 70 58H30C28 58 25 59 22 60Z ' +
      'M24 56C18 54 13 49 13 44C13 39 16.5 36 23 35.5C25.5 28.5 32 25 42 25C52 25 57.5 28.5 61.5 35C63 34.5 64.5 34 66.5 34C72 34 77 38.5 77 44C77 50 73 54 67.5 54H32C30.5 54 27.5 54 24 56Z" />' +
  '</svg>';

    // Проверяем, включен ли виджет в настройках
    function isWeatherEnabled() {
        try {
            if (typeof Lampa === 'undefined' || !Lampa.Storage || !Lampa.Storage.field) return true;
            var v = Lampa.Storage.field(SETTINGS_PARAM);
            if (typeof v === 'undefined' || v === null) return true; // по умолчанию включено
            return !!v;
        } catch (e) {
            return true;
        }
    }

    // Добавляем раздел "Погода" в настройки
    function setupSettings() {
        try {
            if (typeof Lampa === 'undefined' || !Lampa.SettingsApi) return;
        } catch (e) {
            return;
        }

        if (window.weather_settings_initialized) return;
        window.weather_settings_initialized = true;

        // Раздел "Погода"
        Lampa.SettingsApi.addComponent({
            component: SETTINGS_COMPONENT,
            name: 'Погода',
            icon: WEATHER_ICON
        });

        // Параметр "Показывать погоду"
        Lampa.SettingsApi.addParam({
            component: SETTINGS_COMPONENT,
            param: {
                name: SETTINGS_PARAM,
                type: 'trigger',
                "default": true
            },
            field: {
                name: 'Показывать погоду',
                description: 'Показывать виджет погоды рядом со временем'
            },
            onChange: function () {
                var enabled = isWeatherEnabled();

                if (enabled) {
                    // Включили — показываем погоду
                    $('.head__time').hide();
                    $('.weather-widget').show();
                    window.weather_timeVisible = false;
                } else {
                    // Выключили — только время
                    $('.head__time').show();
                    $('.weather-widget').hide();
                    window.weather_timeVisible = false;
                }
            }
        });
    }

    function WeatherInterface() {
        var html;
        var network = new Lampa.Reguest();

        this.create = function () {
            html = $(
                '<div class="weather-widget">' +
                    '<div class="weather-temp" id="weather-temp"></div>' +
                    '<div class="weather-condition" id="weather-condition"></div>' +
                '</div>'
            );
        };

        this.getWeatherData = function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var API_KEY = '7f5420954a5140ab879144236253011';

            // Только HTTPS (иначе Mixed Content)
            var url =
                'https://api.weatherapi.com/v1/current.json?key=' +
                API_KEY +
                '&q=' + lat + ',' + lon +
                '&lang=ru&aqi=no';

            network.clear();
            network.timeout(5000);
            network.silent(url, processWeatherData, processError);
        };

        function processWeatherData(result) {
            window._weather_widget_loaded = true;

            var data2 = result.current;
            var temp = Math.floor(data2.temp_c);
            var condition = data2.condition.text;

            $('#weather-temp').text(temp + '°');
            $('#weather-condition')
                .text(condition)
                .toggleClass('long-text', condition.length > 10);
        }

        function processError(err) {
            console.log('Error retrieving weather data', err);
        }

        // Запасной вариант — по IP через HTTPS
        this.getWeatherByIP = function () {
            $.get('https://free.freeipapi.com/api/json', function (locationData) {
                console.log('Погода', 'Город: ' + locationData.cityName);

                var position = {
                    coords: {
                        latitude: parseFloat(locationData.latitude),
                        longitude: parseFloat(locationData.longitude)
                    }
                };

                console.log(
                    'Погода',
                    'Широта: ' + position.coords.latitude +
                    ', Долгота: ' + position.coords.longitude
                );

                this.getWeatherData(position);
            }.bind(this)).fail(function (e) {
                console.log('Error retrieving IP location data', e);
            });
        };

        this.getWeather = function () {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    this.getWeatherData.bind(this),
                    this.getWeatherByIP.bind(this)
                );
            } else {
                this.getWeatherByIP();
            }
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            if (html) {
                html.remove();
                html = null;
            }
        };
    }

    var weatherInterface = null;
    var isTimeVisible = true;

    function initWidget() {
        weatherInterface = new WeatherInterface();
        weatherInterface.create();
        var weatherWidget = weatherInterface.render();

        var headTime = $('.head__time');
        if (!headTime.length) return;

        headTime.after(weatherWidget);

        // Переключение время / погода
        function toggleDisplay() {
            // Если в настройках выключено — всегда только время
            if (!isWeatherEnabled()) {
                $('.head__time').show();
                $('.weather-widget').hide();
                isTimeVisible = false;
                return;
            }

            if (isTimeVisible) {
                $('.head__time').hide();
                $('.weather-widget').show();
            } else {
                $('.head__time').show();
                $('.weather-widget').hide();
            }
            isTimeVisible = !isTimeVisible;
        }

        // Сохраним в window (если захочешь дергать вручную)
        window.weather_toggleDisplay = toggleDisplay;
        window.weather_timeVisible = isTimeVisible;

        // Каждые 10 сек меняем отображение
        setInterval(toggleDisplay, 10000);

        // Загружаем погоду
        weatherInterface.getWeather();

        // При старте показываем только время
        $('.weather-widget').hide();

        // Аккуратно берем ширину блока времени
        var widthElement = document.querySelector('.head__time');
        if (widthElement) {
            var w = widthElement.offsetWidth;
            $('.weather-widget').css('width', w + 'px');
            $('.head__time').css('width', w + 'px');
        } else {
            console.log('weather.js: .head__time не найден, ширину не задаю');
        }
    }

    $(document).ready(function () {
        // Чуть ждём, чтобы шапка успела появиться
        setTimeout(function () {
            try {
                initWidget();
            } catch (e) {
                console.log('weather.js init error', e);
            }
        }, 5000);

        // Регистрируем настройки
        try {
            setupSettings();
            if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
                Lampa.Listener.follow('app', function (e) {
                    if (e.type === 'ready') setupSettings();
                });
            }
        } catch (e) {
            console.log('weather.js settings error', e);
        }
    });

})();
