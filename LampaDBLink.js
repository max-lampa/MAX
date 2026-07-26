var plugin = (function () {
    'use strict';

    // ══════════════════════════════════════════════════════════════════
    //  LampaDBLink - конфігурація Supabase
    //  Якщо ви клонуєте цей скрипт у свій приватний проєкт, можете вписати
    //  сюди Project URL та PUBLISHABLE key - тоді плагін буде передзаповнений
    //  для всіх ваших пристроїв (значення з налаштувань мають пріоритет).
    //  Лишіть порожніми, щоб вводити дані в налаштуваннях плагіна.
    //
    //  КЛЮЧ: потрібен sb_publishable_... (Project Settings -> API Keys),
    //  або старий "anon public" key. НЕ використовуйте sb_secret / service_role
    //  у клієнтському плагіні!
    //
    //  DEFAULT_SYNC_ACCOUNT розділяє дані різних людей в одній базі
    //  (для приватного проєкту можна лишити 'default').
    // ══════════════════════════════════════════════════════════════════
    var DEFAULT_SUPABASE_URL = '';
    var DEFAULT_SUPABASE_ANON_KEY = '';
    var DEFAULT_SYNC_ACCOUNT = 'default';

    function lang () {
      Lampa.Lang.add({

        dblink_title: {
          en: 'LampaDBLink',
          uk: 'LampaDBLink',
          ru: 'LampaDBLink'
        },
        dblink_description: {
          en: 'Sync via Supabase database',
          uk: 'Синхронізація через базу Supabase',
          ru: 'Синхронизация через базу Supabase'
        },
        dblink_settings: {
          en: 'LampaDBLink Settings',
          uk: 'Налаштування LampaDBLink',
          ru: 'Настройки LampaDBLink'
        },

        dblink_menu_title: {
          en: 'LampaDBLink',
          uk: 'LampaDBLink',
          ru: 'LampaDBLink'
        },
        dblink_hub_title: {
          en: 'LampaDBLink | Sync Hub',
          uk: 'LampaDBLink | Хаб синхронізації',
          ru: 'LampaDBLink | Хаб синхронизации'
        },

        dblink_settings_supa_url: {
          en: 'Supabase URL',
          uk: 'Supabase URL',
          ru: 'Supabase URL'
        },
        dblink_settings_supa_url_desc: {
          en: 'Project URL, e.g. https://xxxx.supabase.co',
          uk: 'Project URL, напр. https://xxxx.supabase.co',
          ru: 'Project URL, напр. https://xxxx.supabase.co'
        },
        dblink_settings_supa_key: {
          en: 'Publishable key',
          uk: 'Publishable key',
          ru: 'Publishable key'
        },
        dblink_settings_supa_key_desc: {
          en: 'sb_publishable_... (or legacy anon key). NOT sb_secret!',
          uk: 'sb_publishable_... (або старий anon key). НЕ sb_secret!',
          ru: 'sb_publishable_... (или старый anon key). НЕ sb_secret!'
        },
        dblink_settings_test: {
          en: 'Test connection',
          uk: 'Перевірити підключення',
          ru: 'Проверить подключение'
        },
        dblink_settings_test_desc: {
          en: 'Check URL and key, connect to database',
          uk: 'Перевірити URL і ключ, підключитись до бази',
          ru: 'Проверить URL и ключ, подключиться к базе'
        },
        dblink_error_no_creds: {
          en: 'Enter Supabase URL and key first',
          uk: 'Спочатку введіть Supabase URL і ключ',
          ru: 'Сначала введите Supabase URL и ключ'
        },
        dblink_test_checking: {
          en: 'Connecting...',
          uk: 'Підключення...',
          ru: 'Подключение...'
        },
        dblink_test_ok: {
          en: 'Connected to database',
          uk: 'Підключено до бази',
          ru: 'Подключено к базе'
        },
        dblink_test_fail: {
          en: 'Connection failed',
          uk: 'Помилка підключення',
          ru: 'Ошибка подключения'
        },
        dblink_setup_title: {
          en: 'First-time database setup',
          uk: 'Перше налаштування бази',
          ru: 'Первая настройка базы'
        },
        dblink_setup_intro: {
          en: 'Press "Copy SQL", paste it in Supabase SQL Editor and run. After that the plugin creates all tables automatically.',
          uk: 'Натисніть "Копіювати SQL", вставте в Supabase SQL Editor і виконайте. Після цього плагін створить усі таблиці автоматично.',
          ru: 'Нажмите "Копировать SQL", вставьте в Supabase SQL Editor и выполните. После этого плагин создаст все таблицы автоматически.'
        },
        dblink_setup_copy: {
          en: 'Copy SQL',
          uk: 'Копіювати SQL',
          ru: 'Копировать SQL'
        },
        dblink_setup_copied: {
          en: 'SQL copied to clipboard',
          uk: 'SQL скопійовано',
          ru: 'SQL скопирован'
        },
        dblink_setup_copy_fail: {
          en: 'Copy failed - select the text manually',
          uk: 'Не вдалося скопіювати - виділіть текст вручну',
          ru: 'Не удалось скопировать - выделите текст вручную'
        },
        dblink_setup_link: {
          en: 'Open SQL Editor:',
          uk: 'Відкрийте SQL Editor:',
          ru: 'Откройте SQL Editor:'
        },
        dblink_setup_retry: {
          en: 'Done, retry',
          uk: 'Готово, повторити',
          ru: 'Готово, повторить'
        },
        dblink_setup_needed: {
          en: 'LampaDBLink: first-time DB setup needed (see settings)',
          uk: 'LampaDBLink: потрібне перше налаштування бази (див. налаштування)',
          ru: 'LampaDBLink: нужна первая настройка базы (см. настройки)'
        },
        dblink_setup_open: {
          en: 'Open SQL Editor',
          uk: 'Відкрити SQL Editor',
          ru: 'Открыть SQL Editor'
        },
        dblink_settings_disconnect: {
          en: 'Disconnect',
          uk: 'Відключитися',
          ru: 'Отключиться'
        },
        dblink_settings_disconnect_desc: {
          en: 'Clear URL and key on this device',
          uk: 'Очистити URL і ключ на цьому пристрої',
          ru: 'Очистить URL и ключ на этом устройстве'
        },
        dblink_settings_disconnect_confirm: {
          en: 'Clear connection settings on this device?',
          uk: 'Очистити налаштування підключення на цьому пристрої?',
          ru: 'Очистить настройки подключения на этом устройстве?'
        },

        dblink_settings_section_auth: {
          en: 'Authorization',
          uk: 'Авторизація',
          ru: 'Авторизация'
        },
        dblink_settings_section_connection: {
          en: 'Connection',
          uk: 'Підключення',
          ru: 'Подключение'
        },
        dblink_settings_section_sync: {
          en: 'Synchronization',
          uk: 'Синхронізація',
          ru: 'Синхронизация'
        },
        dblink_settings_section_tools: {
          en: 'Tools',
          uk: 'Інструменти',
          ru: 'Инструменты'
        },
        dblink_settings_section_about: {
          en: 'About',
          uk: 'Про плагін',
          ru: 'О плагине'
        },

        dblink_settings_api_id: {
          en: 'Telegram API ID',
          uk: 'Telegram API ID',
          ru: 'Telegram API ID'
        },
        dblink_settings_api_id_desc: {
          en: 'Get from my.telegram.org/apps',
          uk: 'Отримайте на my.telegram.org/apps',
          ru: 'Получите на my.telegram.org/apps'
        },
        dblink_settings_api_hash: {
          en: 'Telegram API Hash',
          uk: 'Telegram API Hash',
          ru: 'Telegram API Hash'
        },
        dblink_settings_api_hash_desc: {
          en: 'Secret key from my.telegram.org',
          uk: 'Секретний ключ з my.telegram.org',
          ru: 'Секретный ключ с my.telegram.org'
        },

        dblink_settings_login: {
          en: 'Login to Telegram',
          uk: 'Увійти в Telegram',
          ru: 'Войти в Telegram'
        },
        dblink_settings_login_desc: {
          en: 'Authorize via QR code',
          uk: 'Авторизація через QR код',
          ru: 'Авторизация через QR код'
        },
        dblink_settings_logout: {
          en: 'Logout',
          uk: 'Вийти',
          ru: 'Выйти'
        },
        dblink_settings_logout_desc: {
          en: 'Clear Telegram session',
          uk: 'Очистити сесію Telegram',
          ru: 'Очистить сессию Telegram'
        },
        dblink_settings_logout_confirm: {
          en: 'Are you sure you want to logout?',
          uk: 'Ви впевнені, що хочете вийти?',
          ru: 'Вы уверены, что хотите выйти?'
        },
        dblink_settings_status: {
          en: 'Connection status',
          uk: 'Статус підключення',
          ru: 'Статус подключения'
        },
        dblink_settings_status_desc: {
          en: 'Current Telegram connection status',
          uk: 'Поточний статус з\'єднання Telegram',
          ru: 'Текущий статус соединения Telegram'
        },

        dblink_settings_sync_enabled: {
          en: 'Enable sync',
          uk: 'Увімкнути синхронізацію',
          ru: 'Включить синхронизацию'
        },
        dblink_settings_sync_heartbeat: {
          en: 'Device heartbeat',
          uk: 'Heartbeat пристрою',
          ru: 'Heartbeat устройства'
        },
        dblink_settings_sync_broadcast: {
          en: 'Cross-device broadcast',
          uk: 'Кросс-девайс трансляція',
          ru: 'Кросс-девайс трансляция'
        },
        dblink_settings_connection: {
          en: 'Connection',
          uk: 'З\'єднання',
          ru: 'Соединение'
        },

        dblink_settings_server_type: {
          en: 'Server',
          uk: 'Сервер',
          ru: 'Сервер'
        },
        dblink_settings_server_desc: {
          en: 'Choose server type',
          uk: 'Виберіть тип сервера',
          ru: 'Выберите тип сервера'
        },
        dblink_settings_auth: {
          en: 'Authorization',
          uk: 'Авторизація',
          ru: 'Авторизация'
        },
        dblink_settings_auth_login: {
          en: 'Login to Telegram',
          uk: 'Увійти в Telegram',
          ru: 'Войти в Telegram'
        },
        dblink_settings_auth_logout: {
          en: 'Logout',
          uk: 'Вийти',
          ru: 'Выйти'
        },

        dblink_status_connecting: {
          en: 'Connecting to database...',
          uk: 'Підключення до бази...',
          ru: 'Подключение к базе...'
        },
        dblink_status_connected: {
          en: 'Connected to database',
          uk: 'Підключено до бази',
          ru: 'Подключено к базе'
        },
        dblink_status_disconnected: {
          en: 'Not connected',
          uk: 'Не підключено',
          ru: 'Не подключено'
        },
        dblink_status_error: {
          en: 'Connection error',
          uk: 'Помилка з\'єднання',
          ru: 'Ошибка подключения'
        },
        dblink_status_auth_needed: {
          en: 'Authorization required',
          uk: 'Потрібна авторизація',
          ru: 'Требуется авторизация'
        },

        dblink_status: {
          en: 'Status',
          uk: 'Статус',
          ru: 'Статус'
        },
        dblink_connecting: {
          en: 'Connect to database to see devices',
          uk: 'Підключіться до бази щоб побачити пристрої',
          ru: 'Подключитесь к базе чтобы увидеть устройства'
        },
        dblink_connected: {
          en: 'Connected',
          uk: 'Підключено',
          ru: 'Подключено'
        },
        dblink_auth_required: {
          en: 'Authorization required',
          uk: 'Потрібна авторизація',
          ru: 'Требуется авторизация'
        },

        dblink_devices_title: {
          en: 'Connected devices',
          uk: 'Підключені пристрої',
          ru: 'Подключенные устройства'
        },
        dblink_devices_empty: {
          en: 'No devices detected',
          uk: 'Пристроїв не виявлено',
          ru: 'Устройства не обнаружены'
        },
        dblink_devices_online: {
          en: 'online',
          uk: 'онлайн',
          ru: 'онлайн'
        },
        dblink_devices_offline: {
          en: 'offline',
          uk: 'офлайн',
          ru: 'офлайн'
        },
        dblink_devices_this_device: {
          en: 'This device',
          uk: 'Цей пристрій',
          ru: 'Это устройство'
        },

        dblink_devices: {
          en: 'Devices',
          uk: 'Пристрої',
          ru: 'Устройства'
        },
        dblink_no_devices: {
          en: 'No devices',
          uk: 'Пристроїв немає',
          ru: 'Устройств нет'
        },
        dblink_online: {
          en: 'Online',
          uk: 'Онлайн',
          ru: 'Онлайн'
        },

        dblink_sync_channel: {
          en: 'Sync channel',
          uk: 'Канал синхронізації',
          ru: 'Канал синхронизации'
        },
        dblink_sync_channel_creating: {
          en: 'Creating sync channel...',
          uk: 'Створення каналу синхронізації...',
          ru: 'Создание канала синхронизации...'
        },
        dblink_sync_channel_ready: {
          en: 'Sync channel ready',
          uk: 'Канал синхронізації готовий',
          ru: 'Канал синхронизации готов'
        },
        dblink_sync_channel_error: {
          en: 'Failed to create sync channel',
          uk: 'Не вдалося створити канал синхронізації',
          ru: 'Не удалось создать канал синхронизации'
        },
        dblink_last_sync: {
          en: 'Last sync',
          uk: 'Остання синхронізація',
          ru: 'Последняя синхронизация'
        },
        dblink_last_sync_never: {
          en: 'Never',
          uk: 'Ніколи',
          ru: 'Никогда'
        },

        dblink_auth_qr_title: {
          en: 'Telegram Authorization',
          uk: 'Авторизація Telegram',
          ru: 'Авторизация Telegram'
        },
        dblink_auth_qr_scan: {
          en: 'Scan the QR code with your Telegram app',
          uk: 'Скануйте QR код у додатку Telegram',
          ru: 'Сканируйте QR код в приложении Telegram'
        },
        dblink_auth_qr_waiting: {
          en: 'Waiting for scan...',
          uk: 'Очікування сканування...',
          ru: 'Ожидание сканирования...'
        },
        dblink_auth_qr_confirm: {
          en: 'Confirm login on your phone and enter 2FA password if needed',
          uk: 'Підтвердьте вхід на телефоні та введіть пароль 2FA якщо потрібно',
          ru: 'Подтвердите вход на телефоне и введите пароль 2FA если требуется'
        },
        dblink_auth_qr_success: {
          en: 'Authorization successful!',
          uk: 'Авторизація успішна!',
          ru: 'Авторизация успешна!'
        },
        dblink_auth_qr_error: {
          en: 'Authorization failed',
          uk: 'Авторизація не вдалася',
          ru: 'Авторизация не удалась'
        },
        dblink_auth_scan_done: {
          en: 'I scanned the QR code',
          uk: 'Я відсканував QR',
          ru: 'Я отсканировал QR'
        },
        dblink_auth_scan_not_found: {
          en: 'Scan not detected. Make sure you scanned from Telegram and try again.',
          uk: 'Сканування не виявлено. Переконайтесь що сканували з Telegram і спробуйте ще раз.',
          ru: 'Сканирование не найдено. Убедитесь что сканировали из Telegram и попробуйте снова.'
        },
        dblink_auth_restart: {
          en: 'Restart',
          uk: 'Спочатку',
          ru: 'Сначала'
        },
        dblink_auth_qr_expired: {
          en: 'QR code expired. Please try again.',
          uk: 'QR код застарів. Спробуйте ще раз.',
          ru: 'QR код устарел. Попробуйте снова.'
        },

        dblink_2fa_title: {
          en: 'Two-factor authentication',
          uk: 'Двофакторна аутентифікація',
          ru: 'Двухфакторная аутентификация'
        },
        dblink_2fa_desc: {
          en: 'Enter your 2FA password to complete login',
          uk: 'Введіть пароль 2FA для завершення входу',
          ru: 'Введите пароль 2FA для завершения входа'
        },
        dblink_2fa_hint: {
          en: 'Hint: {hint}',
          uk: 'Підказка: {hint}',
          ru: 'Подсказка: {hint}'
        },
        dblink_2fa_placeholder: {
          en: 'Password',
          uk: 'Пароль',
          ru: 'Пароль'
        },
        dblink_2fa_confirm: {
          en: 'Confirm',
          uk: 'Підтвердити',
          ru: 'Подтвердить'
        },
        dblink_2fa_cancel: {
          en: 'Cancel',
          uk: 'Скасувати',
          ru: 'Отмена'
        },
        dblink_2fa_wrong: {
          en: 'Wrong password. Try again.',
          uk: 'Невірний пароль. Спробуйте ще раз.',
          ru: 'Неверный пароль. Попробуйте еще раз.'
        },

        dblink_auth_phone_title: {
          en: 'Enter phone number in international format',
          uk: 'Введіть номер у міжнародному форматі',
          ru: 'Введите номер в международном формате'
        },
        dblink_auth_send_code: {
          en: 'Send code',
          uk: 'Надіслати код',
          ru: 'Отправить код'
        },
        dblink_auth_confirm: {
          en: 'Confirm',
          uk: 'Підтвердити',
          ru: 'Подтвердить'
        },
        dblink_auth_code_invalid: {
          en: 'Invalid code. Try again.',
          uk: 'Невірний код. Спробуйте ще раз.',
          ru: 'Неверный код. Попробуйте снова.'
        },
        dblink_auth_resend: {
          en: 'Resend code',
          uk: 'Надіслати ще раз',
          ru: 'Отправить еще раз'
        },

        dblink_backup_export: {
          en: 'Export',
          uk: 'Експорт',
          ru: 'Экспорт'
        },
        dblink_backup_import: {
          en: 'Import',
          uk: 'Імпорт',
          ru: 'Импорт'
        },
        dblink_backup_uploading: {
          en: 'Uploading backup...',
          uk: 'Завантаження бекапу...',
          ru: 'Загрузка бекапа...'
        },
        dblink_backup_exported: {
          en: 'Backup exported!',
          uk: 'Бекап експортовано!',
          ru: 'Бекап экспортирован!'
        },
        dblink_backup_failed: {
          en: 'Backup operation failed',
          uk: 'Операція бекапу не вдалася',
          ru: 'Операция бекапа не удалась'
        },
        dblink_backup_fetching: {
          en: 'Fetching latest backup...',
          uk: 'Отримання останнього бекапу...',
          ru: 'Получение последнего бекапа...'
        },
        dblink_backup_no_files: {
          en: 'No backup files found',
          uk: 'Файлів бекапу не знайдено',
          ru: 'Файлов бекапа не найдено'
        },
        dblink_backup_invalid: {
          en: 'Invalid backup file',
          uk: 'Неправильний файл бекапу',
          ru: 'Неправильный файл бекапа'
        },
        dblink_backup_restore_title: {
          en: 'Restore backup?',
          uk: 'Відновити бекап?',
          ru: 'Восстановить бекап?'
        },
        dblink_backup_restore_confirm: {
          en: 'This will overwrite {count} stored settings. Reload required after restore. Continue?',
          uk: 'Буде перезаписано {count} налаштувань. Для застосування потрібне перезавантаження. Продовжити?',
          ru: 'Будет перезаписано {count} настроек. Для применения требуется перезагрузка. Продолжить?'
        },
        dblink_backup_restore_btn: {
          en: 'Restore',
          uk: 'Відновити',
          ru: 'Восстановить'
        },
        dblink_backup_restored: {
          en: 'Backup restored! Reload Lampa to apply.',
          uk: 'Бекап відновлено! Перезавантажте Lampa для застосування.',
          ru: 'Бекап восстановлен! Перезагрузите Lampa для применения.'
        },
        dblink_backup_topic_not_ready: {
          en: 'Backup topic not ready',
          uk: 'Топік бекапу ще не готовий',
          ru: 'Топик бекапа еще не готов'
        },
        dblink_not_connected: {
          en: 'Not connected',
          uk: 'Не підключено',
          ru: 'Не подключено'
        },
        dblink_cancel: {
          en: 'Cancel',
          uk: 'Скасувати',
          ru: 'Отмена'
        },
        dblink_settings_server_type_official: {
          en: 'Official',
          uk: 'Офіційний',
          ru: 'Официальный'
        },
        dblink_settings_server_type_custom: {
          en: 'Custom',
          uk: 'Кастомний',
          ru: 'Кастомный'
        },
        dblink_settings_server_warning_title: {
          en: 'Warning',
          uk: 'Увага',
          ru: 'Внимание'
        },
        dblink_settings_server_warning_desc: {
          en: 'Changing the server type will end the current session. You will need to authorize again on the new server. Continue?',
          uk: 'При зміні типу сервера поточну сесію буде завершено. Вам знадобиться авторизуватися знову на новому сервері. Продовжити?',
          ru: 'При смене типа сервера текущая сессия будет завершена. Вам потребуется авторизоваться заново на новом сервере. Продолжить?'
        },
        dblink_settings_server_confirm: {
          en: 'Continue',
          uk: 'Продовжити',
          ru: 'Продолжить'
        },
        dblink_settings_server_cancel: {
          en: 'Cancel',
          uk: 'Скасувати',
          ru: 'Отменить'
        },
        dblink_settings_server_custom_host: {
          en: 'Custom server host',
          uk: 'Хост кастомного сервера',
          ru: 'Хост кастомного сервера'
        },
        dblink_settings_server_custom_port: {
          en: 'Custom server port',
          uk: 'Порт кастомного сервера',
          ru: 'Порт кастомного сервера'
        },
        dblink_settings_proxy_title: {
          en: 'MTProto proxy',
          uk: 'MTProto проксі',
          ru: 'MTProto прокси'
        },
        dblink_settings_proxy_desc: {
          en: 'Proxy for bypassing Telegram blocks (WSS)',
          uk: 'Проксі для обходу блокувань Telegram (WSS)',
          ru: 'Прокси для обхода блокировок Telegram (WSS)'
        },
        dblink_settings_proxy_host: {
          en: 'Proxy host',
          uk: 'Хост проксі',
          ru: 'Хост прокси'
        },
        dblink_settings_proxy_port: {
          en: 'Proxy port',
          uk: 'Порт проксі',
          ru: 'Порт прокси'
        },
        dblink_settings_proxy_secret: {
          en: 'Proxy secret (hex)',
          uk: 'Секрет проксі (hex)',
          ru: 'Секрет прокси (hex)'
        },
        dblink_error_proxy_failed: {
          en: 'Proxy connection failed. Check settings or disable it.',
          uk: 'Помилка підключення через проксі. Перевірте параметри або спробуйте вимкнути його.',
          ru: 'Ошибка подключения через прокси. Проверьте параметры или попробуйте выключить его.'
        },
        dblink_error_session_invalid: {
          en: 'Session invalid. Please log in again.',
          uk: 'Сесія невалідна. Увійдіть знову.',
          ru: 'Сессия невалидна. Войдите снова.'
        },
        dblink_backup_pick_title: {
          en: 'Select backup to restore',
          uk: 'Виберіть бекап для відновлення',
          ru: 'Выберите бекап для восстановления'
        },
        dblink_backup_downloading: {
          en: 'Downloading backup...',
          uk: 'Завантаження бекапу...',
          ru: 'Загрузка бекапа...'
        },

        dblink_profile_switch: {
          en: 'Switch profile?',
          uk: 'Перемкнути профіль?',
          ru: 'Переключить профиль?'
        },
        dblink_profile_switch_desc: {
          en: 'Current profile will be auto-saved before switching.',
          uk: 'Поточний профіль буде автоматично збережено.',
          ru: 'Текущий профиль будет автоматически сохранен.'
        },
        dblink_profile_created: {
          en: 'Profile created',
          uk: 'Профіль створено',
          ru: 'Профиль создан'
        },
        dblink_profile_activated: {
          en: 'Profile activated',
          uk: 'Профіль активовано',
          ru: 'Профиль активирован'
        },
        dblink_profile_synced: {
          en: 'Profile synced',
          uk: 'Профіль синхронізовано',
          ru: 'Профиль синхронизирован'
        },
        dblink_profile_deleted: {
          en: 'Profile deleted',
          uk: 'Профіль видалено',
          ru: 'Профиль удален'
        },
        dblink_profile_not_found: {
          en: 'Profile not found',
          uk: 'Профіль не знайдено',
          ru: 'Профиль не найден'
        },
        dblink_profile_active: {
          en: 'active',
          uk: 'активний',
          ru: 'активный'
        },
        dblink_switch: {
          en: 'Switch',
          uk: 'Перемкнути',
          ru: 'Переключить'
        },
        dblink_profile_rename: {
          en: 'Rename profile',
          uk: 'Перейменувати профіль',
          ru: 'Переименовать профиль'
        },
        dblink_profile_renamed: {
          en: 'Profile renamed',
          uk: 'Профіль перейменовано',
          ru: 'Профиль переименован'
        },
        dblink_delete_confirm: {
          en: 'Delete this profile?',
          uk: 'Видалити цей профіль?',
          ru: 'Удалить этот профиль?'
        },

        dblink_no_profiles: {
          en: 'No profiles',
          uk: 'Профілів немає',
          ru: 'Профилей нет'
        },
        dblink_create_first: {
          en: 'Create a profile to start syncing',
          uk: 'Створіть профіль для початку синхронізації',
          ru: 'Создайте профиль для начала синхронизации'
        },
        dblink_create_profile: {
          en: 'Create profile',
          uk: 'Створити профіль',
          ru: 'Создать профиль'
        },
        dblink_this_device: {
          en: 'This device',
          uk: 'Цей пристрій',
          ru: 'Это устройство'
        },
        dblink_plugins: {
          en: 'Plugins',
          uk: 'Плагіни',
          ru: 'Плагины'
        },
        dblink_sync: {
          en: 'Sync',
          uk: 'Синхронізувати',
          ru: 'Синхронизировать'
        },
        dblink_delete: {
          en: 'Delete',
          uk: 'Видалити',
          ru: 'Удалить'
        },
        dblink_profiles: {
          en: 'Profiles',
          uk: 'Профілі',
          ru: 'Профили'
        },
        dblink_active: {
          en: 'Active',
          uk: 'Активний',
          ru: 'Активный'
        },
        dblink_switch_profile: {
          en: 'Switch Profile?',
          uk: 'Перемкнути профіль?',
          ru: 'Переключить профиль?'
        },
        dblink_switch_confirm: {
          en: 'Current profile will be autosaved',
          uk: 'Поточний профіль буде автозбережено',
          ru: 'Текущий профиль будет автосохранен'
        },

        dblink_import_cub: {
          en: 'Import from Cub',
          uk: 'Імпорт з Cub',
          ru: 'Импорт из Cub'
        },
        dblink_import_cub_desc: {
          en: 'Migrate Cub profiles to DBLink',
          uk: 'Міграція профілів Cub у DBLink',
          ru: 'Миграция профилей Cub в DBLink'
        },
        dblink_migration_start: {
          en: 'Reading Cub profiles...',
          uk: 'Читання профілів Cub...',
          ru: 'Чтение профилей Cub...'
        },
        dblink_migration_complete: {
          en: '{count} profiles imported successfully.',
          uk: 'Імпортовано {count} профілів успішно.',
          ru: 'Импортировано {count} профилей успешно.'
        },

        dblink_import_title: {
          en: 'Cub Import Summary',
          uk: 'Підсумок імпорту з Cub',
          ru: 'Итоги импорта из Cub'
        },
        dblink_import_profiles: {
          en: 'Profiles found:',
          uk: 'Знайдено профілів:',
          ru: 'Найдено профилей:'
        },
        dblink_import_bookmarks: {
          en: 'Favorites & history items:',
          uk: 'Елементів обраного та історії:',
          ru: 'Элементов избранного и истории:'
        },
        dblink_import_plugins: {
          en: 'Plugins found:',
          uk: 'Знайдено плагінів:',
          ru: 'Найдено плагинов:'
        },
        dblink_import_proceed: {
          en: 'Proceed with migration to DBLink?',
          uk: 'Продовжити міграцію в DBLink?',
          ru: 'Продолжить миграцию в DBLink?'
        },
        dblink_import_start: {
          en: 'Yes, migrate',
          uk: 'Так, мігрувати',
          ru: 'Да, мигрировать'
        },
        dblink_migration_no_cub: {
          en: 'Cub account not found. Log in to Cub in Lampa settings first.',
          uk: 'Акаунт Cub не знайдено. Увійдіть в Cub в налаштуваннях Lampa.',
          ru: 'Аккаунт Cub не найден. Войдите в Cub в настройках Lampa.'
        },
        dblink_migration_no_profiles: {
          en: 'No Cub profiles found',
          uk: 'Профілів Cub не знайдено',
          ru: 'Профилей Cub не найдено'
        },
        dblink_reload_now: {
          en: 'Reload now',
          uk: 'Перезавантажити',
          ru: 'Перезагрузить'
        },

        dblink_plugins_title: {
          en: 'Plugins: "{name}"',
          uk: 'Плагіни: "{name}"',
          ru: 'Плагины: "{name}"'
        },
        dblink_plugins_add: {
          en: 'Add plugin',
          uk: 'Додати плагін',
          ru: 'Добавить плагин'
        },
        dblink_plugins_add_url: {
          en: 'Plugin URL',
          uk: 'URL плагіна',
          ru: 'URL плагина'
        },
        dblink_plugins_name: {
          en: 'Plugin name (optional)',
          uk: 'Назва плагіна (необов\'язково)',
          ru: 'Название плагина (необязательно)'
        },
        dblink_plugins_empty: {
          en: 'No plugins in this profile',
          uk: 'Немає плагінів у цьому профілі',
          ru: 'Нет плагинов в этом профиле'
        },
        dblink_plugins_already_installed: {
          en: 'Already installed',
          uk: 'Вже встановлено',
          ru: 'Уже установлен'
        },
        dblink_plugins_remove: {
          en: 'Remove',
          uk: 'Видалити',
          ru: 'Удалить'
        },
        dblink_plugins_remove_confirm: {
          en: 'will be removed from this profile.',
          uk: 'буде видалено з цього профілю.',
          ru: 'будет удалён из этого профиля.'
        },
        dblink_plugins_toggle_on: {
          en: 'Enable',
          uk: 'Увімкнути',
          ru: 'Включить'
        },
        dblink_plugins_toggle_off: {
          en: 'Disable',
          uk: 'Вимкнути',
          ru: 'Выключить'
        },
        dblink_plugins_save: {
          en: 'Save',
          uk: 'Зберегти',
          ru: 'Сохранить'
        },
        dblink_plugins_saving: {
          en: 'Saving profile...',
          uk: 'Збереження профілю...',
          ru: 'Сохранение профиля...'
        },
        dblink_plugins_saved: {
          en: 'Profile updated',
          uk: 'Профіль оновлено',
          ru: 'Профиль обновлён'
        },
        dblink_plugins_added: {
          en: 'Plugin added.',
          uk: 'Плагін додано.',
          ru: 'Плагин добавлен.'
        },
        dblink_plugins_removed: {
          en: 'Plugin removed.',
          uk: 'Плагін видалено.',
          ru: 'Плагин удалён.'
        },
        dblink_plugins_toggled: {
          en: 'Plugin toggled.',
          uk: 'Плагін перемкнено.',
          ru: 'Плагин переключён.'
        },
        dblink_plugins_reload_hint: {
          en: 'Reload required to apply.',
          uk: 'Для застосування потрібне перезавантаження.',
          ru: 'Для применения требуется перезагрузка.'
        },
        dblink_plugins_unsaved: {
          en: 'Unsaved changes',
          uk: 'Незбережені зміни',
          ru: 'Несохранённые изменения'
        },
        dblink_plugins_unsaved_desc: {
          en: 'You have unsaved changes. Save now?',
          uk: 'У вас є незбережені зміни. Зберегти?',
          ru: 'У вас есть несохранённые изменения. Сохранить?'
        },
        dblink_plugins_manage: {
          en: 'Manage plugins',
          uk: 'Керування плагінами',
          ru: 'Управление плагинами'
        },
        dblink_loading: {
          en: 'Loading…',
          uk: 'Завантаження…',
          ru: 'Загрузка…'
        },
        dblink_tab_devices: {
          en: 'Devices',
          uk: 'Пристрої',
          ru: 'Устройства'
        },
        dblink_tab_profiles: {
          en: 'Profiles',
          uk: 'Профілі',
          ru: 'Профили'
        },

        dblink_settings_app: {
          en: 'Telegram App',
          uk: 'Telegram App',
          ru: 'Telegram App'
        },
        dblink_settings_app_lampa: {
          en: 'Lampa',
          uk: 'Lampa',
          ru: 'Lampa'
        },
        dblink_settings_app_custom: {
          en: 'Custom',
          uk: 'Кастомний',
          ru: 'Кастомный'
        },
        dblink_settings_app_desc: {
          en: 'Which Telegram App credentials to use. "Lampa" uses the bundled app shared across all Lampa users. "Custom" uses your own credentials from my.telegram.org (more private).',
          uk: 'Які облікові дані Telegram App використовувати. "Lampa" використовує вбудований додаток, спільний для всіх користувачів Lampa. "Кастомний" використовує ваші власні облікові дані з my.telegram.org (приватніше).',
          ru: 'Какие учётные данные Telegram App использовать. "Lampa" использует встроенное приложение, общее для всех пользователей Lampa. "Кастомный" использует ваши собственные учётные данные с my.telegram.org (более приватно).'
        },

        dblink_settings_about: {
          en: 'About DBLink',
          uk: 'Про DBLink',
          ru: 'О DBLink'
        },
        dblink_settings_about_desc: {
          en: 'Plugin version and information',
          uk: 'Версія та інформація про плагін',
          ru: 'Версия и информация о плагине'
        },
        dblink_about_version: {
          en: 'Version',
          uk: 'Версія',
          ru: 'Версия'
        },
        dblink_about_author: {
          en: 'Telegram',
          uk: 'Telegram',
          ru: 'Telegram'
        },
        dblink_about_link_author: {
          en: ' @lme_chat',
          uk: ' @mmssixxx',
          ru: ' @lme_chat'
        },
        dblink_about_description: {
          en: 'DBLink synchronizes your Lampa bookmarks, timecodes, plugins, and profiles across devices via Telegram.',
          uk: 'DBLink синхронізує ваші закладки, таймкоди, плагіни та профілі між пристроями через Telegram.',
          ru: 'DBLink синхронизирует ваши закладки, таймкоды, плагины и профили между устройствами через Telegram.'
        },

        dblink_settings_timeout: {
          en: 'Sync timeout',
          uk: 'Таймаут синхронізації',
          ru: 'Таймаут синхронизации'
        },
        dblink_settings_timeout_desc: {
          en: 'Maximum wait time for sync operations (seconds)',
          uk: 'Максимальний час очікування синхронізації (секунди)',
          ru: 'Максимальное время ожидания синхронизации (секунды)'
        },

        dblink_settings_poll_interval: {
          en: 'Delta poll interval',
          uk: 'Інтервал перевірки дельт',
          ru: 'Интервал проверки дельт'
        },
        dblink_settings_poll_interval_desc: {
          en: 'How often to check for remote changes (seconds)',
          uk: 'Як часто перевіряти віддалені зміни (секунди)',
          ru: 'Как часто проверять удаленные изменения (секунды)'
        },

        dblink_profile_button: {
          en: 'Switch profile',
          uk: 'Перемкнути профіль',
          ru: 'Переключить профиль'
        },
        dblink_profile_active_label: {
          en: 'Active',
          uk: 'Активний',
          ru: 'Активный'
        },

        dblink_plugins_tab: {
          en: 'Plugins',
          uk: 'Плагіни',
          ru: 'Плагины'
        },
        dblink_no_plugins: {
          en: 'No plugins installed',
          uk: 'Немає встановлених плагінів',
          ru: 'Нет установленных плагинов'
        },
        dblink_plugins_edit_name: {
          en: 'Edit name',
          uk: 'Редагувати назву',
          ru: 'Редактировать название'
        },
        dblink_plugins_edit_url: {
          en: 'Edit URL',
          uk: 'Редагувати URL',
          ru: 'Редактировать URL'
        },
        dblink_plugins_manage_hint: {
          en: 'Add plugins via URL to extend Lampa functionality',
          uk: 'Додавайте плагіни через URL для розширення функціоналу Lampa',
          ru: 'Добавляйте плагины через URL для расширения функционала Lampa'
        },

        dblink_device_reset: {
          en: 'Reset device settings',
          uk: 'Скинути налаштування пристрою',
          ru: 'Сбросить настройки устройства'
        },
        dblink_device_rename: {
          en: 'Rename device',
          uk: 'Перейменувати пристрій',
          ru: 'Переименовать устройство'
        },
        dblink_device_open: {
          en: 'Open on this device',
          uk: 'Відкрити на цьому пристрої',
          ru: 'Открыть на этом устройстве'
        },
        dblink_device_name_title: {
          en: 'Device name',
          uk: 'Назва пристрою',
          ru: 'Имя устройства'
        },
        dblink_device_renamed: {
          en: 'Device renamed',
          uk: 'Пристрій перейменовано',
          ru: 'Устройство переименовано'
        },
        dblink_nothing_share: {
          en: 'Nothing to share',
          uk: 'Немає що надіслати',
          ru: 'Нечего отправить'
        },
        dblink_sent_to: {
          en: 'Sent to {device}',
          uk: 'Надіслано на {device}',
          ru: 'Отправлено на {device}'
        },
        dblink_play_on_device: {
          en: 'Play on device',
          uk: 'Відтворити на пристрої',
          ru: 'Воспроизвести на устройстве'
        },
        dblink_open_on_device: {
          en: 'Open on device',
          uk: 'Відкрити на пристрої',
          ru: 'Открыть на устройстве'
        },
        dblink_select_device: {
          en: 'Select device',
          uk: 'Виберіть пристрій',
          ru: 'Выберите устройство'
        },
        dblink_discover_fail: {
          en: 'Failed to discover devices',
          uk: 'Не вдалося знайти пристрої',
          ru: 'Не удалось найти устройства'
        },
        dblink_device_overlay_reset: {
          en: 'Device overlays reset. Sync profile to apply.',
          uk: 'Налаштування пристрою скинуто. Синхронізуйте профіль.',
          ru: 'Настройки устройства сброшены. Синхронизируйте профиль.'
        },

        dblink_compat_title: {
          en: 'Telegram Library Support',
          uk: 'Підтримка бібліотеки Telegram',
          ru: 'Поддержка библиотеки Telegram'
        },
        dblink_compat_ok: {
          en: 'Fully supported',
          uk: 'Повністю підтримується',
          ru: 'Полностью поддерживается'
        },
        dblink_compat_partial: {
          en: 'Partial - may run slower',
          uk: 'Частково - може працювати повільніше',
          ru: 'Частично - может работать медленнее'
        },
        dblink_compat_fail: {
          en: 'Not supported on this device',
          uk: 'Не підтримується на цьому пристрої',
          ru: 'Не поддерживается на этом устройстве'
        },
        dblink_compat_blocked_label: {
          en: 'Blocking issues',
          uk: 'Блокуючі проблеми',
          ru: 'Блокирующие проблемы'
        },
        dblink_compat_warning_label: {
          en: 'Warnings',
          uk: 'Попередження',
          ru: 'Предупреждения'
        },
        dblink_compat_no_blockers: {
          en: 'No blocking issues detected. Library can be loaded.',
          uk: 'Блокуючих проблем не виявлено. Бібліотеку можна завантажити.',
          ru: 'Блокирующих проблем не обнаружено. Библиотеку можно загрузить.'
        },
        dblink_compat_hint_disclaimer: {
          en: 'This check verifies only the runtime environment required by telegram.min.js. It does not test your network or Telegram API credentials.',
          uk: 'Ця перевірка лише тестує середовище виконання, потрібне для telegram.min.js. Вона не перевіряє мережу чи Telegram API-креденшали.',
          ru: 'Эта проверка только тестирует среду выполнения, необходимую для telegram.min.js. Она не проверяет сеть или Telegram API-креденшалы.'
        },
        dblink_settings_avatar_style: {
          en: 'Avatar style',
          uk: 'Стиль аватара',
          ru: 'Стиль аватара'
        },
        dblink_settings_avatar_style_desc: {
          en: 'Choose DiceBear avatar style for profiles',
          uk: 'Виберіть стиль аватара DiceBear для профілів',
          ru: 'Выберите стиль аватара DiceBear для профилей'
        },
        dblink_avatar_none: {
          en: 'Initials (default)',
          uk: 'Ініціали (за замовчуванням)',
          ru: 'Инициалы (по умолчанию)'
        }
      });
    }

    function _classCallCheck(a, n) {
      if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
    }
    function _defineProperties(e, r) {
      for (var t = 0; t < r.length; t++) {
        var o = r[t];
        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
      }
    }
    function _createClass(e, r, t) {
      return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
        writable: !1
      }), e;
    }
    function _defineProperty(e, r, t) {
      return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }) : e[r] = t, e;
    }
    function ownKeys(e, r) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function (r) {
          return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread2(e) {
      for (var r = 1; r < arguments.length; r++) {
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
          _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
      }
      return e;
    }
    function _toPrimitive(t, r) {
      if ("object" != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r ? String : Number)(t);
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == typeof i ? i : i + "";
    }
    function _typeof(o) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
        return typeof o;
      } : function (o) {
        return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
      }, _typeof(o);
    }

    var BUNDLE_REF = '653586b3ffec2f9003ec7e1806b5c2e41224eb64';
    var BUNDLE_URLS = ['https://cdn.jsdelivr.net/gh/lampame/TGSBundle@' + BUNDLE_REF + '/telegram.min.js', 'https://rawcdn.githack.com/lampame/TGSBundle/' + BUNDLE_REF + '/telegram.min.js', 'https://raw.githack.com/lampame/TGSBundle/main/telegram.min.js'];
    var _loadPromise = null;

    var STORAGE_KEYS = {

      SUPA_URL: 'dblink_supabase_url',
      SUPA_KEY: 'dblink_supabase_key',
      ACCOUNT: 'dblink_account',

      DEVICE_ID: 'dblink_device_id',
      USER_NAME: 'dblink_user_name',

      CHANNEL_ID: 'dblink_channel_id',
      SYNC_LOG_TOPIC: 'dblink_sync_log_topic',
      PROFILES_TOPIC: 'dblink_profiles_topic',
      PROFILES_SYNC: 'dblink_profiles_sync_topic',
      BACKUP_TOPIC: 'dblink_backup_topic',
      REMOTE_CMD_TOPIC: 'dblink_remote_cmd_topic',

      ACTIVE_PROFILE: 'dblink_active_profile',
      ACTIVE_PROFILE_TS: 'dblink_active_profile_ts',
      ACTIVE_PROFILE_NAME: 'dblink_active_profile_name',
      PROFILES_CACHE: 'dblink_profiles_cache',
      PLUGIN_REGISTRY: 'dblink_plugin_registry',
      LAST_DELTA_SEEN: 'dblink_last_delta_seen',
      PROFILE_PLUGIN_URLS: 'dblink_profile_plugin_urls',

      AVATAR_STYLE: 'dblink_avatar_style',
      HEARTBEAT: 'dblink_heartbeat',
      BROADCAST: 'dblink_broadcast',
      SYNC_ENABLED: 'dblink_sync_enabled',
      POLL_INTERVAL: 'dblink_poll_interval'
    };

    function getChannelId() {
      var v = Lampa.Storage.get(STORAGE_KEYS.CHANNEL_ID, '');
      var n = parseInt(v, 10);

      return Number.isFinite(n) && n !== 0 ? n : null;
    }

    function getInt(key, def) {
      if (def === undefined) def = 0;
      var v = parseInt(Lampa.Storage.get(key, String(def)), 10);
      return Number.isFinite(v) ? v : def;
    }

    var _tg = null;
    var _tgPromise = null;

    var CHUNK = 512 * 1024;

    function stripCodeFence$1(text) {
      if (!text) return text;
      return text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    }

    var STORAGE_DEVICE_ID = STORAGE_KEYS.DEVICE_ID;
    function getDeviceId() {
      var id = Lampa.Storage.get(STORAGE_DEVICE_ID, '');
      if (!id) {
        id = 'tv_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        Lampa.Storage.set(STORAGE_DEVICE_ID, id);
      }
      return id;
    }
    var DEVICE_TYPES = {
      'Amazon Fire TV': {
        check: function check(ua) {
          return ua.match(/Fire TV|Amazon/i);
        },
        name: 'Amazon Fire TV'
      },
      'NVIDIA Shield TV': {
        check: function check(ua) {
          return ua.match(/SHIELD|NVIDIA/i);
        },
        name: 'NVIDIA Shield TV'
      },
      'Roku': {
        check: function check(ua) {
          return ua.match(/Roku/i) && !ua.match(/TCL/i);
        },
        name: 'Roku'
      },
      'Xiaomi Mi Box': {
        check: function check(ua) {
          return ua.match(/MiBox|Xiaomi/i);
        },
        name: 'Xiaomi Mi Box'
      },
      'Apple TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/Apple/) && ua.match(/iPad/) && !Lampa.Platform.screen('mobile');
        },
        name: 'Apple TV'
      },
      'LG WebOS TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/WebOS|LG/i);
        },
        name: 'LG WebOS TV'
      },
      'Samsung Tizen TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/Samsung|Tizen/i);
        },
        name: 'Samsung Tizen TV'
      },
      'Sony Bravia TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/Sony|Bravia/i);
        },
        name: 'Sony Bravia TV'
      },
      'TCL Roku TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/Roku|TCL/i);
        },
        name: 'TCL Roku TV'
      },
      'Hisense VIDAA TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/VIDAA|Hisense/i);
        },
        name: 'Hisense VIDAA TV'
      },
      'Haier Smart TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/Haier/i);
        },
        name: 'Haier Smart TV'
      },
      'Yandex Smart TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/YNDX|Yandex|YandexTV/i);
        },
        name: 'Yandex Smart TV'
      },
      'Android Device': {
        check: function check(ua) {
          return ua.match(/Android/) && !Lampa.Platform.screen('tv');
        },
        name: 'Android Device'
      },
      'Smart TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/Smart-TV|Smart TV|TV/i);
        },
        name: 'Smart TV'
      },
      'Android TV': {
        check: function check(ua) {
          return Lampa.Platform.screen('tv') && ua.match(/Android/) && !ua.match(/MiBox|SHIELD|Yandex/i);
        },
        name: 'Android TV'
      },
      'iPhone': {
        check: function check(ua) {
          return ua.match(/iPhone/);
        },
        name: 'iPhone'
      },
      'iPad': {
        check: function check(ua) {
          return ua.match(/iPad|Macintosh/) && Lampa.Platform.screen('mobile');
        },
        name: 'iPad'
      },
      'Mac Device': {
        check: function check(ua) {
          return ua.match(/Macintosh|iPad/) && !Lampa.Platform.screen('mobile');
        },
        name: 'Mac Device'
      },
      'Windows PC': {
        check: function check(ua) {
          return ua.match(/Windows/);
        },
        name: 'Windows PC'
      }
    };
    function getDeviceName() {
      var ua = navigator.userAgent || '';
      var name = 'Unknown Device';
      for (var k in DEVICE_TYPES) {
        if (DEVICE_TYPES[k].check(ua)) {
          name = DEVICE_TYPES[k].name;
          break;
        }
      }
      var m = ua.match(/\((.*?)\)/);
      var details = m ? m[1] : '';
      return details ? name + ' - (' + details + ')' : name;
    }

    function getSystemVersion() {
      var ua = navigator.userAgent || '';
      var m = ua.match(/Android\s+([\d.]+)/);
      if (m) return 'Android ' + m[1];
      m = ua.match(/(?:iPhone|iPad)\s+OS\s+([\d_]+)/);
      if (m) return 'iOS ' + m[1].replace(/_/g, '.');
      m = ua.match(/Mac\s+OS\s+X\s+([\d_]+)/);
      if (m) return 'macOS ' + m[1].replace(/_/g, '.');
      m = ua.match(/Windows\s+NT\s+([\d.]+)/);
      if (m) {
        var v = m[1];
        if (v === '10.0') {
          if (ua.match(/Windows\s+11|Win64|arm64/i) && !ua.match(/Windows\s+10\.0;\s*$|Touch/i)) return 'Windows 11';
          return 'Windows 10';
        }
        if (v === '6.3') return 'Windows 8.1';
        if (v === '6.2') return 'Windows 8';
        if (v === '6.1') return 'Windows 7';
        return 'Windows ' + v;
      }
      m = ua.match(/\(([^)]+)\)/);
      if (m) {
        var parts = m[1].split(';');
        return parts[0].trim() || 'Linux';
      }
      return '1.0';
    }

    var VERSION = '0.1.1';

    var BOOTSTRAP_SQL = [
      'create or replace function exec_sql(sql text) returns void',
      'language plpgsql security definer as $$',
      'begin execute sql; end;',
      '$$;'
    ].join('\n');

    var SCHEMA_SQL = [
      "create table if not exists profiles (",
      "  id bigint generated always as identity primary key,",
      "  account text not null default 'default',",
      "  name text, avatar text,",
      "  data jsonb not null default '{}'::jsonb,",
      "  source text, source_id text,",
      "  updated_at timestamptz not null default now());",
      "create index if not exists profiles_account_idx on profiles(account, updated_at desc);",
      "create table if not exists deltas (",
      "  id bigint generated always as identity primary key,",
      "  account text not null default 'default',",
      "  profile_id bigint not null,",
      "  subtype text not null,",
      "  device_id text, target_device_id text default 'all',",
      "  payload jsonb not null default '{}'::jsonb,",
      "  created_at timestamptz not null default now());",
      "create index if not exists deltas_since_idx on deltas(account, created_at);",
      "create table if not exists devices (",
      "  device_id text primary key,",
      "  account text not null default 'default',",
      "  name text, system text,",
      "  last_seen timestamptz not null default now());",
      "create index if not exists devices_account_idx on devices(account, last_seen desc);",
      "create table if not exists broadcasts (",
      "  id bigint generated always as identity primary key,",
      "  account text not null default 'default',",
      "  target_device_id text, type text,",
      "  payload jsonb not null default '{}'::jsonb,",
      "  created_at timestamptz not null default now());",
      "create index if not exists broadcasts_since_idx on broadcasts(account, created_at);",
      "create table if not exists backups (",
      "  id bigint generated always as identity primary key,",
      "  account text not null default 'default',",
      "  device_id text, device_name text,",
      "  data jsonb not null,",
      "  created_at timestamptz not null default now());",
      "create index if not exists backups_account_idx on backups(account, created_at desc);",
      "alter table profiles disable row level security;",
      "alter table deltas disable row level security;",
      "alter table devices disable row level security;",
      "alter table broadcasts disable row level security;",
      "alter table backups disable row level security;",
      "grant usage on schema public to anon, authenticated;",
      "grant all privileges on all tables in schema public to anon, authenticated;",
      "grant all privileges on all sequences in schema public to anon, authenticated;",
      "do $pub$ begin",
      "  begin alter publication supabase_realtime add table deltas; exception when others then null; end;",
      "  begin alter publication supabase_realtime add table devices; exception when others then null; end;",
      "  begin alter publication supabase_realtime add table broadcasts; exception when others then null; end;",
      "end $pub$;"
    ].join('\n');

    var instance = null;

    function DBLinkClient() {
      this._connected = false;
      this._connecting = false;
      this._listeners = {};
      this._heartbeatTimer = null;
      this._bcastTimer = null;
      this._bcastCursor = null;
      this._ws = null;
      this._wsHb = null;
    }

    DBLinkClient.getInstance = function () {
      if (!instance) instance = new DBLinkClient();
      return instance;
    };

    DBLinkClient.prototype._url = function () {
      var v = Lampa.Storage.get(STORAGE_KEYS.SUPA_URL, '') || DEFAULT_SUPABASE_URL || '';
      return String(v).replace(/\/+$/, '');
    };
    DBLinkClient.prototype._key = function () {
      return Lampa.Storage.get(STORAGE_KEYS.SUPA_KEY, '') || DEFAULT_SUPABASE_ANON_KEY || '';
    };
    DBLinkClient.prototype._account = function () {
      return Lampa.Storage.get(STORAGE_KEYS.ACCOUNT, '') || DEFAULT_SYNC_ACCOUNT || 'default';
    };
    DBLinkClient.prototype.hasCredentials = function () {
      return !!(this._url() && this._key());
    };
    DBLinkClient.prototype.setCredentials = function (url, key, account) {
      Lampa.Storage.set(STORAGE_KEYS.SUPA_URL, String(url || '').replace(/\/+$/, ''));
      Lampa.Storage.set(STORAGE_KEYS.SUPA_KEY, String(key || ''));
      if (account !== undefined) Lampa.Storage.set(STORAGE_KEYS.ACCOUNT, String(account || ''));
    };

    DBLinkClient.prototype.saveCredentials = function () {};
    DBLinkClient.prototype.clearCredentials = function () {
      Lampa.Storage.set(STORAGE_KEYS.SUPA_URL, '');
      Lampa.Storage.set(STORAGE_KEYS.SUPA_KEY, '');
    };
    DBLinkClient.prototype.setLogLevel = function () {};
    DBLinkClient.prototype.invoke = function () { return Promise.resolve(null); };
    DBLinkClient.prototype.isEnabled = function (key) {
      return !!Lampa.Storage.get(key, false);
    };

    DBLinkClient.prototype._rest = function (method, table, opts) {
      opts = opts || {};
      var base = this._url();
      var key = this._key();
      if (!base || !key) return Promise.resolve({ ok: false, status: 0, data: null });
      var url = base + '/rest/v1/' + table + (opts.query ? '?' + opts.query : '');
      var headers = {
        'apikey': key,
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      };
      if (opts.prefer) headers['Prefer'] = opts.prefer;
      var init = { method: method, headers: headers };
      if (opts.body !== undefined) init.body = JSON.stringify(opts.body);

      var ctrl = null, timer = null;
      try {
        if (typeof AbortController === 'function') {
          ctrl = new AbortController();
          init.signal = ctrl.signal;
          var ms = (getInt('dblink_sync_timeout', 10) || 10) * 1000;
          timer = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, ms);
        }
      } catch (e) {}

      return fetch(url, init).then(function (resp) {
        if (timer) clearTimeout(timer);
        var status = resp.status;
        return resp.text().then(function (txt) {
          var data = null;
          if (txt) { try { data = JSON.parse(txt); } catch (e) { data = txt; } }
          return { ok: resp.ok, status: status, data: data };
        });
      })["catch"](function (err) {
        if (timer) clearTimeout(timer);
        return { ok: false, status: 0, data: null, error: err };
      });
    };

    DBLinkClient.prototype._iso = function (sec) {
      var n = parseInt(sec, 10);
      if (!Number.isFinite(n) || n <= 0) n = 0;
      return new Date(n * 1000).toISOString();
    };
    DBLinkClient.prototype._sec = function (iso) {
      var t = Date.parse(iso);
      return Number.isFinite(t) ? Math.floor(t / 1000) : 0;
    };
    DBLinkClient.prototype._enc = function (v) {
      return encodeURIComponent(v);
    };

    DBLinkClient.prototype.provisionSchema = function () {
      return this._rest('POST', 'rpc/exec_sql', {
        prefer: 'return=minimal',
        body: { sql: SCHEMA_SQL }
      }).then(function (res) {
        return !!res.ok;
      });
    };
    DBLinkClient.prototype._tablesMissing = function (res) {
      return res.status === 404 || (res.status === 400 && res.data && res.data.code === '42P01');
    };

    DBLinkClient.prototype.connect = function () {
      var self = this;
      if (!self.hasCredentials()) return Promise.reject(new Error('Supabase credentials required'));
      if (self._connected) return Promise.resolve();
      if (self._connecting) {
        return new Promise(function (resolve, reject) {
          var check = setInterval(function () {
            if (self._connected) { clearInterval(check); resolve(); }
            else if (!self._connecting) { clearInterval(check); reject(new Error('Connection failed')); }
          }, 200);
        });
      }
      self._connecting = true;
      self._emit('connection', { state: 'connecting' });

      function markConnected() {
        self._connected = true;
        self._connecting = false;
        self._emit('connection', { state: 'connected' });
        self._startBroadcastPoll();
        self._openRealtime();
      }

      return self._rest('GET', 'profiles', { query: 'select=id&limit=1' }).then(function (res) {
        if (res.status === 401 || res.status === 403) {
          self._connecting = false;
          self._emit('connection', { state: 'error' });
          throw new Error('Невірний ключ Supabase (' + res.status + ')');
        }
        if (res.status === 0) {
          self._connecting = false;
          self._emit('connection', { state: 'error' });
          throw new Error('Немає з\'єднання з Supabase');
        }
        if (self._tablesMissing(res)) {

          return self.provisionSchema().then(function (ok) {
            if (!ok) {
              self._connecting = false;
              self._emit('connection', { state: 'error' });
              var e = new Error('Потрібне перше налаштування бази');
              e.needSetup = true;
              throw e;
            }

            return self._rest('GET', 'profiles', { query: 'select=id&limit=1' }).then(function (res2) {
              if (self._tablesMissing(res2)) {
                self._connecting = false;
                self._emit('connection', { state: 'error' });
                var e2 = new Error('Не вдалось створити таблиці');
                e2.needSetup = true;
                throw e2;
              }
              markConnected();
            });
          });
        }
        markConnected();
      })["catch"](function (err) {
        self._connecting = false;
        self._connected = false;
        throw err;
      });
    };
    DBLinkClient.prototype.disconnect = function () {
      this._connected = false;
      this._connecting = false;
      this.stopHeartbeat();
      if (this._bcastTimer) { clearInterval(this._bcastTimer); this._bcastTimer = null; }
      this._closeRealtime();
      this._emit('connection', { state: 'disconnected' });
      return Promise.resolve();
    };
    DBLinkClient.prototype.reconnect = function () {
      var self = this;
      return this.disconnect().then(function () { return self.connect(); });
    };
    DBLinkClient.prototype.logout = function () {
      this.clearCredentials();
      return this.disconnect();
    };
    DBLinkClient.prototype.isConnected = function () { return this._connected; };
    DBLinkClient.prototype.isConnecting = function () { return this._connecting; };

    DBLinkClient.prototype.findChannel = function () { return Promise.resolve(null); };
    DBLinkClient.prototype.createChannel = function () { return Promise.resolve(1); };
    DBLinkClient.prototype.findTopic = function (channelId, name) { return Promise.resolve(name); };
    DBLinkClient.prototype.createTopic = function (channelId, name) { return Promise.resolve(name); };

    DBLinkClient.prototype.sendFile = function (chatId, threadId, dataStr, fileName, caption) {
      if (!this.isConnected()) return Promise.resolve(null);
      var self = this;
      var file = null;
      try { file = JSON.parse(dataStr); } catch (e) { file = dataStr; }

      if (threadId === 'backup') {
        return self._rest('POST', 'backups', {
          prefer: 'return=representation',
          body: {
            account: self._account(),
            device_id: getDeviceId(),
            device_name: getDeviceName(),
            data: { caption: caption, file: file, fileName: fileName }
          }
        }).then(function (res) {
          var row = res.data && res.data[0];
          return row ? row.id : null;
        });
      }

      var prof = null, src = null, srcId = null;
      try {
        var c = JSON.parse(caption);
        prof = c && c.payload && c.payload.profile;
        if (c && c.meta) { src = c.meta.source || null; srcId = c.meta.source_id || null; }
      } catch (e) {}
      return self._rest('POST', 'profiles', {
        prefer: 'return=representation',
        body: {
          account: self._account(),
          name: prof && prof.name || null,
          avatar: prof && prof.avatar || null,
          source: src,
          source_id: srcId,
          data: { caption: caption, file: file }
        }
      }).then(function (res) {
        var row = res.data && res.data[0];
        return row ? row.id : null;
      });
    };

    DBLinkClient.prototype._rowToProfileMsg = function (row) {
      var caption = row.data && row.data.caption;
      var file = row.data && row.data.file;
      return {
        id: row.id,
        date: this._sec(row.updated_at),
        text: caption,
        message: caption,
        _file: (file === undefined || file === null) ? null : JSON.stringify(file)
      };
    };
    DBLinkClient.prototype._rowToBackupMsg = function (row) {
      var caption = (row.data && row.data.caption) || '';
      var file = row.data && row.data.file;
      return {
        id: row.id,
        date: this._sec(row.created_at),
        text: caption,
        message: caption,
        fileName: (row.data && row.data.fileName) || '',
        _file: (file === undefined || file === null) ? null : JSON.stringify(file)
      };
    };

    DBLinkClient.prototype.getMessages = function (chatId, threadId, limit) {
      if (!this.isConnected()) return Promise.resolve([]);
      var self = this;
      var acc = self._enc(self._account());
      limit = limit || 50;
      if (threadId === 'backup') {
        return self._rest('GET', 'backups', {
          query: 'account=eq.' + acc + '&order=created_at.desc&limit=' + limit
        }).then(function (res) {
          if (!res.ok || !Array.isArray(res.data)) return [];
          return res.data.map(function (r) { return self._rowToBackupMsg(r); });
        });
      }

      return self._rest('GET', 'profiles', {
        query: 'account=eq.' + acc + '&order=updated_at.desc&limit=' + limit
      }).then(function (res) {
        if (!res.ok || !Array.isArray(res.data)) return [];
        return res.data.map(function (r) { return self._rowToProfileMsg(r); });
      });
    };
    DBLinkClient.prototype.getBackupFiles = function (chatId, threadId, limit) {
      return this.getMessages(chatId, 'backup', limit);
    };

    DBLinkClient.prototype.downloadMessageFile = function (message) {
      return Promise.resolve(message && message._file != null ? message._file : null);
    };
    DBLinkClient.prototype.downloadFile = function (message) {
      return this.downloadMessageFile(message);
    };

    DBLinkClient.prototype.deleteMessage = function (chatId, messageId) {
      if (!this.isConnected()) return Promise.resolve(false);
      var acc = this._enc(this._account());
      return this._rest('DELETE', 'profiles', {
        query: 'id=eq.' + this._enc(messageId) + '&account=eq.' + acc
      }).then(function (res) { return res.ok; });
    };

    DBLinkClient.prototype.editMessage = function () { return Promise.resolve(true); };

    DBLinkClient.prototype._insertDelta = function (text) {
      var obj = null;
      try { obj = JSON.parse(text); } catch (e) { return Promise.resolve(false); }
      if (!obj || !obj.meta) return Promise.resolve(false);
      var pid = parseInt(obj.meta.profile_msg_id, 10);
      return this._rest('POST', 'deltas', {
        prefer: 'return=minimal',
        body: {
          account: this._account(),
          profile_id: Number.isFinite(pid) ? pid : 0,
          subtype: obj.meta.subtype || '',
          device_id: obj.meta.device_id || null,
          target_device_id: obj.meta.target_device_id || 'all',
          payload: obj
        }
      }).then(function (res) { return res.ok; });
    };
    DBLinkClient.prototype.publishRaw = function (threadId, text, silent) {
      if (!this.isConnected()) return Promise.resolve(false);
      return this._insertDelta(text);
    };
    DBLinkClient.prototype.publishDelta = function (profilesSyncTopicId, subtype, profileMsgId, payload) {
      var msg = JSON.stringify({
        meta: {
          type: 'profile_delta',
          subtype: subtype,
          profile_msg_id: profileMsgId,
          device_id: getDeviceId(),
          timestamp: Math.floor(Date.now() / 1000)
        },
        payload: payload || {}
      });
      return this.publishRaw(profilesSyncTopicId, msg, true);
    };
    DBLinkClient.prototype.getMessagesSince = function (threadId, sinceTimestamp, limit) {
      if (!this.isConnected()) return Promise.resolve([]);
      var self = this;
      var acc = self._enc(self._account());
      var iso = self._enc(self._iso(sinceTimestamp));
      limit = limit || 30;
      return self._rest('GET', 'deltas', {
        query: 'account=eq.' + acc + '&created_at=gt.' + iso + '&order=created_at.asc&limit=' + limit
      }).then(function (res) {
        if (!res.ok || !Array.isArray(res.data)) return [];
        return res.data.map(function (r) {
          var body = JSON.stringify(r.payload);
          return { id: r.id, date: self._sec(r.created_at), text: body, message: body };
        });
      });
    };

    DBLinkClient.prototype.publish = function (chatId, threadId, type, payload, targetDeviceId) {
      if (!this.isConnected()) return Promise.resolve(false);
      var envelope = {
        meta: {
          type: type,
          device_id: getDeviceId(),
          device_name: getDeviceName(),
          timestamp: Math.floor(Date.now() / 1000)
        },
        payload: payload || {}
      };
      return this._rest('POST', 'broadcasts', {
        prefer: 'return=minimal',
        body: {
          account: this._account(),
          target_device_id: targetDeviceId || 'all',
          type: type,
          payload: envelope
        }
      }).then(function (res) { return res.ok; });
    };
    DBLinkClient.prototype._startBroadcastPoll = function () {
      var self = this;
      if (self._bcastTimer) { clearInterval(self._bcastTimer); self._bcastTimer = null; }

      self._bcastCursor = new Date().toISOString();
      var tick = function () {
        if (!self._connected) return;
        if (!self.isEnabled('dblink_broadcast')) return;
        if (typeof document !== 'undefined' && document.hidden) return;
        var acc = self._enc(self._account());
        var iso = self._enc(self._bcastCursor);
        self._rest('GET', 'broadcasts', {
          query: 'account=eq.' + acc + '&created_at=gt.' + iso + '&order=created_at.asc&limit=20'
        }).then(function (res) {
          if (!res.ok || !Array.isArray(res.data) || !res.data.length) return;
          var myId = getDeviceId();
          res.data.forEach(function (row) {
            if (row.created_at > self._bcastCursor) self._bcastCursor = row.created_at;
            var env = row.payload || {};
            var meta = env.meta || {};
            if (meta.device_id === myId) return;
            var target = row.target_device_id || 'all';
            if (target !== 'all' && target !== myId) return;
            self._emit(row.type, env);
          });
        });
      };
      self._bcastTimer = setInterval(tick, 4000);
    };

    DBLinkClient.prototype.startHeartbeat = function () {
      var self = this;
      self.stopHeartbeat();
      if (!self._connected || !self.isEnabled('dblink_heartbeat')) return;
      var beat = function () {
        if (!self._connected) return;
        if (!self.isEnabled('dblink_heartbeat')) { self.stopHeartbeat(); return; }
        self._rest('POST', 'devices', {
          query: 'on_conflict=device_id',
          prefer: 'resolution=merge-duplicates,return=minimal',
          body: {
            device_id: getDeviceId(),
            account: self._account(),
            name: getDeviceName(),
            system: getSystemVersion(),
            last_seen: new Date().toISOString()
          }
        });
      };
      beat();
      self._heartbeatTimer = setInterval(beat, 60000);
    };
    DBLinkClient.prototype.stopHeartbeat = function () {
      if (this._heartbeatTimer) { clearInterval(this._heartbeatTimer); this._heartbeatTimer = null; }
    };
    DBLinkClient.prototype.getOnlineDevices = function () {
      if (!this.isConnected()) return Promise.resolve([]);
      var self = this;
      var acc = self._enc(self._account());
      var cutoff = self._enc(new Date(Date.now() - 90000).toISOString());
      return self._rest('GET', 'devices', {
        query: 'account=eq.' + acc + '&last_seen=gt.' + cutoff + '&order=last_seen.desc&limit=50'
      }).then(function (res) {
        if (!res.ok || !Array.isArray(res.data)) return [];
        return res.data.map(function (r) {
          return {
            type: 'heartbeat',
            device_id: r.device_id,
            device_name: r.name,
            system: r.system,
            timestamp: self._sec(r.last_seen)
          };
        });
      });
    };

    DBLinkClient.prototype._openRealtime = function () {
      var self = this;
      this._closeRealtime();
      if (typeof WebSocket === 'undefined') return;
      var base = this._url();
      var key = this._key();
      if (!base || !key) return;
      try {
        var wsBase = base.replace(/^http/, 'ws');
        var ws = new WebSocket(wsBase + '/realtime/v1/websocket?apikey=' + encodeURIComponent(key) + '&vsn=1.0.0');
        self._ws = ws;
        var ref = 0;
        ws.onopen = function () {
          try {
            ws.send(JSON.stringify({
              topic: 'realtime:dblink',
              event: 'phx_join',
              payload: {
                config: {
                  postgres_changes: [
                    { event: 'INSERT', schema: 'public', table: 'deltas' },
                    { event: 'INSERT', schema: 'public', table: 'broadcasts' }
                  ]
                },
                access_token: key
              },
              ref: String(++ref)
            }));
          } catch (e) {}
          self._wsHb = setInterval(function () {
            try { ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(++ref) })); } catch (e) {}
          }, 30000);
        };
        ws.onmessage = function (evt) {
          var msg = null;
          try { msg = JSON.parse(evt.data); } catch (e) { return; }
          if (!msg || msg.event !== 'postgres_changes') return;
          var tbl = msg.payload && msg.payload.data && msg.payload.data.table;
          if (tbl === 'deltas') {
            if (typeof window !== 'undefined' && typeof window.__dblink_poke_deltas === 'function') window.__dblink_poke_deltas();
          } else if (tbl === 'broadcasts') {

          }
        };
        ws.onerror = function () {};
        ws.onclose = function () {
          if (self._wsHb) { clearInterval(self._wsHb); self._wsHb = null; }
        };
      } catch (e) {}
    };
    DBLinkClient.prototype._closeRealtime = function () {
      if (this._wsHb) { clearInterval(this._wsHb); this._wsHb = null; }
      if (this._ws) { try { this._ws.close(); } catch (e) {} this._ws = null; }
    };

    DBLinkClient.prototype.on = function (event, cb) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(cb);
    };
    DBLinkClient.prototype.off = function (event, cb) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(function (f) { return f !== cb; });
    };
    DBLinkClient.prototype._emit = function (event, data) {
      var handlers = this._listeners[event] || [];
      handlers.forEach(function (cb) {
        try { cb(data); } catch (e) { console.error('DBLink', 'Listener error:', e); }
      });
    };

    function stripCodeFence(text) {
      if (!text) return text;
      return text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    }

    var _dblinkCompatReport = null;

    var CHANNEL_TITLE = "\uD83D\uDD04 Lampa Sync [DO NOT DELETE]";
    var TOPIC_NAMES = ['sync-log', 'remote-cmd', 'backup', 'profiles', 'profiles-sync'];

    var TOPIC_STORAGE_KEYS = {
      'sync-log': 'dblink_sync_log_topic',
      'remote-cmd': 'dblink_remote_cmd_topic',
      'backup': 'dblink_backup_topic',
      'profiles': 'dblink_profiles_topic',
      'profiles-sync': 'dblink_profiles_sync_topic'
    };

    var PROFILE_META_VERSION = 3;

    function readJSON(key, def) {
      try {
        return Lampa.Storage.get(key, def);
      } catch (e) {
        return def;
      }
    }
    function collectFavorite() {
      return readJSON('favorite', {});
    }
    function collectTimeline() {
      return readJSON('file_view', {});
    }
    function collectPlugins() {
      return readJSON('plugins', []);
    }
    function collectSettings() {
      return {
        sync_enabled: Lampa.Storage.get('dblink_sync_enabled', false),
        heartbeat: Lampa.Storage.get('dblink_heartbeat', false),
        broadcast: Lampa.Storage.get('dblink_broadcast', false)
      };
    }

    function buildCaption(profile, extras) {
      if (!extras) extras = {};
      var result = JSON.stringify({
        meta: _objectSpread2({
          type: 'profile',
          timestamp: Math.floor(Date.now() / 1000),
          version: PROFILE_META_VERSION
        }, extras),
        payload: {
          profile: {
            name: profile.name,
            avatar: profile.avatar,
            updated: profile.updated || Math.floor(Date.now() / 1000)
          }
        }
      });
      console.log('DBLink', 'buildCaption - name="' + profile.name + '" extras:', JSON.stringify(extras), 'result:', result);
      return result;
    }

    function buildFileData(opts) {
      var now = Math.floor(Date.now() / 1000);
      return {
        profile_meta: {
          name: opts.name,
          avatar: opts.avatar,
          updated: now
        },
        bookmarks: opts.bookmarks || {
          favorite: {}
        },
        timeline: opts.timeline || {},
        plugins: opts.plugins || [],
        settings: opts.settings || collectSettings(),
        device_overrides: opts.device_overrides || {}
      };
    }

    function parseCaption(text) {
      try {
        var d = JSON.parse(stripCodeFence$1(text || ''));
        return d && d.payload && d.payload.profile;
      } catch (e) {
        return null;
      }
    }

    function parseProfileMessage(text) {
      try {
        var d = JSON.parse(stripCodeFence$1(text || ''));
        return d && d.meta && d.meta.type === 'profile' ? d : null;
      } catch (e) {
        return null;
      }
    }

    function findMessageById(messages, msgId) {
      var target = null;
      messages.forEach(function (m) {
        if (String(m.id) === String(msgId)) target = m;
      });
      return target;
    }

    function deepClone(obj) {
      if (typeof structuredClone === 'function') {
        return structuredClone(obj);
      }
      return JSON.parse(JSON.stringify(obj));
    }

    function buildProfileFileName(name, now) {
      return 'profile_' + name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + now + '.json';
    }

    var STORAGE_LAST_DELTA_SEEN = 'dblink_last_delta_seen';
    function getLastDeltaSeen() {
      return parseInt(Lampa.Storage.get(STORAGE_LAST_DELTA_SEEN, '0'), 10);
    }
    function setLastDeltaSeen(timestamp) {
      Lampa.Storage.set(STORAGE_LAST_DELTA_SEEN, String(timestamp));
    }

    var DICE_BEAR_BASE = 'https://api.dicebear.com/10.x/';
    var DICE_BEAR_STYLES = ['adventurer', 'adventurer-neutral', 'avataaars', 'avataaars-neutral', 'big-ears', 'big-ears-neutral', 'big-smile', 'bottts', 'bottts-neutral', 'croodles', 'croodles-neutral', 'disco', 'dylan', 'fun-emoji', 'glass', 'glyphs', 'icons', 'identicon', 'initial-face', 'initials', 'lorelei', 'lorelei-neutral', 'micah', 'miniavs', 'notionists', 'notionists-neutral', 'open-peeps', 'personas', 'pixel-art', 'pixel-art-neutral', 'rings', 'shape-grid', 'shapes', 'stripes', 'thumbs', 'toon-head', 'triangles'];
    var COLORS = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#009688', '#4caf50', '#ff9800', '#ff5722', '#795548'];

    function getAvatar(name) {
      var style = Lampa.Storage.get(STORAGE_KEYS.AVATAR_STYLE, 'fun-emoji');
      if (!style) return getInitials(name);
      return DICE_BEAR_BASE + style + '/svg?seed=' + encodeURIComponent(name) + '&borderRadius=50';
    }

    function getInitials(name) {
      if (!name) return '??';
      var parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] || '') + (parts[1][0] || '');
      }
      return name.slice(0, 2);
    }

    function avatarColor(name) {
      if (!name) return '#0088cc';
      var hash = 0;
      for (var i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return COLORS[Math.abs(hash) % COLORS.length];
    }

    function isAvatarUrl(avatar) {
      return avatar && avatar.indexOf(DICE_BEAR_BASE) === 0;
    }

    function renderAvatar(name, options) {
      if (!options) options = {};
      var url = getAvatar(name);
      var color = avatarColor(name);
      var isUrl = isAvatarUrl(url);
      var clsName = options.className || 'dblink-avatar';
      var extraStyle = options.style || '';
      if (isUrl) {
        return '<img src="' + url + '" alt="" class="' + clsName + '"' + (extraStyle ? ' style="' + extraStyle + '"' : '') + '>';
      }
      return '<div class="' + clsName + '" style="background:' + color + ';border-radius:50%;' + 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;' + 'color:#fff;font-weight:700;' + extraStyle + '">' + url + '</div>';
    }

    function extractNameFromUrl(url) {
      try {
        var parts = url.split('/');
        var fname = parts[parts.length - 1] || parts[parts.length - 2] || 'Plugin';
        return fname.replace(/\.js(\?.*)?$/i, '').replace(/[-_]/g, ' ');
      } catch (e) {
        return 'Plugin';
      }
    }

    var TOPICS = [{
      name: 'sync-log',
      key: TOPIC_STORAGE_KEYS['sync-log']
    }, {
      name: 'remote-cmd',
      key: TOPIC_STORAGE_KEYS['remote-cmd']
    }, {
      name: 'profiles',
      key: TOPIC_STORAGE_KEYS['profiles']
    }, {
      name: 'profiles-sync',
      key: TOPIC_STORAGE_KEYS['profiles-sync']
    }, {
      name: 'backup',
      key: TOPIC_STORAGE_KEYS['backup']
    }];

    function autoEnsureSyncChannel() {
      var client = DBLinkClient.getInstance();
      if (Lampa.Storage.get(STORAGE_KEYS.CHANNEL_ID, '')) return;
      Lampa.Bell.push({
        text: 'DBLink: Setting up sync channel...'
      });
      client.findChannel(CHANNEL_TITLE).then(function (id) {
        if (id) {
          Lampa.Storage.set(STORAGE_KEYS.CHANNEL_ID, id);
          return ensureAllTopics();
        }
        return client.createChannel(CHANNEL_TITLE).then(function (peerId) {
          if (!peerId) return;
          Lampa.Storage.set(STORAGE_KEYS.CHANNEL_ID, peerId);
          return createAllTopics(peerId);
        });
      }).then(function () {
        Lampa.Bell.push({
          text: 'DBLink: Sync channel ready!'
        });
        autoCreateDefaultProfile();
      })["catch"](function (err) {
        console.warn('DBLink', 'Background channel init failed:', err && err.message);
      });
    }
    function ensureAllTopics() {
      var client = DBLinkClient.getInstance();
      var channelId = getChannelId();
      var seq = Promise.resolve();
      TOPICS.forEach(function (t) {
        if (Lampa.Storage.get(t.key, '')) return;
        seq = seq.then(function () {

          return client.findTopic(channelId, t.name).then(function (id) {
            if (id) {
              Lampa.Storage.set(t.key, id);
              return;
            }
            return client.createTopic(channelId, t.name).then(function (topicId) {
              if (topicId) Lampa.Storage.set(t.key, topicId);
            });
          });
        });
      });
      return seq;
    }
    function createAllTopics(peerId) {
      var client = DBLinkClient.getInstance();
      var seq = Promise.resolve();
      TOPICS.forEach(function (t) {
        seq = seq.then(function () {
          return client.createTopic(peerId, t.name).then(function (topicId) {
            if (topicId) Lampa.Storage.set(t.key, topicId);
          });
        });
      });
      return seq;
    }

    function autoCreateDefaultProfile() {
      var profilesTopicId = Lampa.Storage.get(STORAGE_KEYS.PROFILES_TOPIC, '');
      if (!profilesTopicId) return;
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;
      var channelId = getChannelId();
      if (!channelId) return;
      client.getMessages(channelId, profilesTopicId, 10).then(function (msgs) {
        var firstProfileMsg = null;
        msgs.forEach(function (m) {
          if (!m.text) return;
          if (parseProfileMessage(m.text)) {
            if (!firstProfileMsg) firstProfileMsg = m;
          }
        });
        if (!firstProfileMsg) {

          createGeneralProfile(channelId, profilesTopicId, client);
        } else {

          autoLoadProfile(firstProfileMsg, client);
        }
      })["catch"](function () {});
    }

    function autoLoadProfile(profileMsg, client) {
      var msgId = profileMsg.id;
      client.downloadMessageFile(profileMsg).then(function (fileData) {
        if (!fileData) return;
        var captionProfile = parseCaption(profileMsg.text);
        var profileName = captionProfile && captionProfile.name;
        if (profileName) Lampa.Storage.set('dblink_active_profile_name', profileName);
        var data;
        try {
          data = JSON.parse(fileData);
        } catch (e) {
          return;
        }

        if (data.bookmarks && data.bookmarks.favorite) {
          Lampa.Storage.set('favorite', data.bookmarks.favorite);
          if (Lampa.Favorite && Lampa.Favorite.read) {
            Lampa.Favorite.read();
          }
        }

        if (data.timeline) {
          Lampa.Storage.set('file_view', data.timeline);
        }

        if (data.plugins) {
          Lampa.Storage.set('plugins', data.plugins);
        }

        if (data.settings) {
          if (data.settings.sync_enabled !== undefined) Lampa.Storage.set('dblink_sync_enabled', data.settings.sync_enabled);
          if (data.settings.heartbeat !== undefined) Lampa.Storage.set('dblink_heartbeat', data.settings.heartbeat);
          if (data.settings.broadcast !== undefined) Lampa.Storage.set('dblink_broadcast', data.settings.broadcast);
        }

        Lampa.Storage.set(STORAGE_KEYS.ACTIVE_PROFILE, String(msgId));
        Lampa.Storage.set(STORAGE_KEYS.ACTIVE_PROFILE_TS, String(Math.floor(Date.now() / 1000)));
        Lampa.Noty.show('DBLink: Profile activated');

        setTimeout(function () {
          window.location.reload();
        }, 1500);
      })["catch"](function (err) {
        console.warn('DBLink', 'Auto-load first profile failed:', err);
      });
    }
    function createGeneralProfile(channelId, profilesTopicId, client) {
      var name = 'General';
      var avatar = getInitials(name);
      var now = Math.floor(Date.now() / 1000);
      var caption = buildCaption({
        name: name,
        avatar: avatar,
        updated: now
      });
      var fileData = buildFileData({
        name: name,
        avatar: avatar,
        bookmarks: {
          favorite: readJSON('favorite', {})
        },
        timeline: readJSON('file_view', {}),
        plugins: readJSON('plugins', []),
        settings: readJSON('dblink_sync_settings', {})
      });
      client.sendFile(channelId, profilesTopicId, JSON.stringify(fileData, null, 2), 'profile_General_' + now + '.json', caption).then(function (msgId) {
        if (!msgId) return;
        Lampa.Storage.set(STORAGE_KEYS.ACTIVE_PROFILE, String(msgId));
        Lampa.Storage.set(STORAGE_KEYS.ACTIVE_PROFILE_TS, String(now));
        Lampa.Storage.set(STORAGE_KEYS.ACTIVE_PROFILE_NAME, name);

        setTimeout(function () {
          window.location.reload();
        }, 1500);
      })["catch"](function (err) {
        console.warn('DBLink', 'Auto-create profile failed:', err);
      });
    }

    function startMigration(profilesTopicId) {
      if (!window.lampa_settings || !window.lampa_settings.account_use) {
        Lampa.Noty.show('Cub account not found. Log in to Cub in Lampa settings first.');
        return;
      }
      if (!Lampa.Account || !Lampa.Account.Permit || !Lampa.Account.Permit.token) {
        Lampa.Noty.show('Cub account not found. Log in to Cub in Lampa settings first.');
        return;
      }

      Lampa.Noty.show('Analyzing Cub data...');
      console.log('DBLink', 'startMigration - fetching profiles/all and plugins/all');
      Promise.all([Lampa.Account.Api.load('profiles/all')["catch"](function () {
        return {
          profiles: []
        };
      }), Lampa.Account.Api.load('plugins/all')["catch"](function () {
        return {
          plugins: []
        };
      })]).then(function (results) {
        var profilesResult = results[0];
        var pluginsResult = results[1];
        var profiles = profilesResult && profilesResult.profiles || [];
        var allPlugins = pluginsResult && pluginsResult.secuses ? pluginsResult.plugins || [] : [];
        var profileCount = profiles.length;
        var pluginCount = allPlugins.length;
        console.log('DBLink', 'Cub profiles:', profileCount, JSON.stringify(profiles.map(function (p) {
          return {
            id: p.id,
            name: p.name
          };
        })));
        console.log('DBLink', 'Cub plugins total:', pluginCount, 'has_secuses:', pluginsResult && pluginsResult.secuses);
        if (profileCount === 0) {
          Lampa.Noty.show('No Cub profiles found');
          return;
        }

        var bookmarkPromises = profiles.map(function (p) {
          return Lampa.Account.Api.load('bookmarks/dump', {
            headers: {
              profile: p.id
            },
            dataType: 'text'
          }).then(function (raw) {
            try {
              var parsed = JSON.parse(raw);
              return parsed && parsed.bookmarks ? parsed.bookmarks.length : 0;
            } catch (e) {
              return 0;
            }
          })["catch"](function () {
            return 0;
          });
        });
        Promise.all(bookmarkPromises).then(function (bookmarkCounts) {
          var totalBookmarks = bookmarkCounts.reduce(function (a, b) {
            return a + b;
          }, 0);
          var $html = $('<div style="padding:1em">' + '<div class="dblink-import-stats">' + '<div class="dblink-import-stat" style="display:flex;justify-content:space-between;padding:0.8em 0;border-bottom:1px solid rgba(255,255,255,0.08)">' + '<span style="opacity:0.6">' + (Lampa.Lang.translate('dblink_import_profiles') || 'Profiles found:') + '</span>' + '<span style="font-weight:600;font-size:1.1em">' + profileCount + '</span>' + '</div>' + '<div class="dblink-import-stat" style="display:flex;justify-content:space-between;padding:0.8em 0;border-bottom:1px solid rgba(255,255,255,0.08)">' + '<span style="opacity:0.6">' + (Lampa.Lang.translate('dblink_import_bookmarks') || 'Favorites & history items:') + '</span>' + '<span style="font-weight:600;font-size:1.1em">' + totalBookmarks + '</span>' + '</div>' + '<div class="dblink-import-stat" style="display:flex;justify-content:space-between;padding:0.8em 0">' + '<span style="opacity:0.6">' + (Lampa.Lang.translate('dblink_import_plugins') || 'Plugins found:') + '</span>' + '<span style="font-weight:600;font-size:1.1em">' + pluginCount + '</span>' + '</div>' + '</div>' + '<p style="margin-top:1em;opacity:0.5;font-size:0.9em">' + (Lampa.Lang.translate('dblink_import_proceed') || 'Proceed with migration to DBLink?') + '</p>' + '</div>');
          var enabledCtrl = Lampa.Controller.enabled().name;
          Lampa.Modal.open({
            title: Lampa.Lang.translate('dblink_import_title') || 'Cub Import Summary',
            html: $html,
            buttons: [{
              name: Lampa.Lang.translate('dblink_import_start') || 'Yes, migrate',
              onSelect: function onSelect() {
                Lampa.Modal.close();
                Lampa.Controller.toggle(enabledCtrl);
                doMigration(profilesTopicId);
              }
            }, {
              name: Lampa.Lang.translate('dblink_cancel') || 'Cancel',
              onSelect: function onSelect() {
                Lampa.Modal.close();
                Lampa.Controller.toggle(enabledCtrl);
              }
            }]
          });
        });
      })["catch"](function (e) {
        console.error('DBLink', 'Import analysis error:', e);
        Lampa.Noty.show('Failed to analyze Cub data: ' + (e.message || 'API error'));
      });
    }

    var FAV_CATEGORIES = ['like', 'wath', 'book', 'history', 'look', 'viewed', 'scheduled', 'continued', 'thrown'];

    function _emptyFav() {
      var fav = {
        card: []
      };
      FAV_CATEGORIES.forEach(function (c) {
        fav[c] = [];
      });
      return fav;
    }
    function cubDumpToFavorite(rawText) {
      var parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        return _emptyFav();
      }
      var rows = parsed && parsed.bookmarks;
      if (!rows || !rows.length) return _emptyFav();
      var fav = {
        card: []
      };
      FAV_CATEGORIES.forEach(function (c) {
        fav[c] = [];
      });
      var seenCards = {};
      rows.forEach(function (b) {
        if (!b.type || b.card_id == null) return;
        if (!fav[b.type]) fav[b.type] = [];

        var card = null;
        if (b.data) {
          try {
            card = typeof b.data === 'string' ? JSON.parse(b.data) : b.data;
          } catch (e) {}
        }

        var canonicalId = card && card.id != null ? card.id : b.card_id;

        if (fav[b.type].indexOf(canonicalId) < 0) {
          fav[b.type].unshift(canonicalId);
        }

        if (card && !seenCards[canonicalId]) {
          seenCards[canonicalId] = true;
          fav.card.push(card);
        }
      });
      return fav;
    }

    function cubDumpToTimeline(rawText) {
      var parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        return {};
      }
      var timelines = parsed && parsed.timelines;
      if (!timelines) return {};
      var result = {};
      for (var hash in timelines) {
        if (!Object.prototype.hasOwnProperty.call(timelines, hash)) continue;
        var t = timelines[hash];
        if (!t) continue;
        result[hash] = {
          time: t.time || 0,
          duration: t.duration || 0,
          percent: t.percent || 0
        };
      }
      return result;
    }

    function filterPluginsForProfile(allPlugins, profileId) {
      var result = [];
      allPlugins.forEach(function (p) {
        if (!p.url) return;
        var profileIds = [];
        try {
          profileIds = JSON.parse(p.profiles);
        } catch (e) {
          return;
        }

        if (profileIds.length > 0 && !profileIds.some(function (id) {
          return id == profileId;
        })) return;
        result.push({
          url: p.url,
          name: p.name || p.url.split('/').pop().replace(/\.js(\?.*)?$/i, '').replace(/[-_]/g, ' '),
          status: p.status !== undefined ? p.status : 1
        });
      });
      console.log('DBLink', 'filterPluginsForProfile profileId=' + profileId + ' plugins=' + result.length + ' (of ' + allPlugins.length + ' total)');
      return result;
    }

    function mergeWithLocalPlugins(cubPlugins) {
      var localPlugins = [];
      try {
        localPlugins = Lampa.Storage.get('plugins', []);
      } catch (e) {}
      var seen = {};
      var result = [];

      localPlugins.forEach(function (p) {
        var url = p.url || '';
        if (!seen[url]) {
          result.push(p);
          seen[url] = true;
        }
      });

      cubPlugins.forEach(function (p) {
        if (!seen[p.url]) {
          result.push(p);
          seen[p.url] = true;
        }
      });
      return result;
    }

    function doMigration(profilesTopicId) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) {
        Lampa.Noty.show('Not connected to Telegram');
        return;
      }
      Lampa.Noty.show('Reading Cub profiles...');
      console.log('DBLink', 'doMigration - starting, profilesTopicId:', profilesTopicId);
      Lampa.Account.Api.load('profiles/all').then(function (result) {
        if (!result || !result.profiles || !result.profiles.length) {
          Lampa.Noty.show('No Cub profiles found');
          console.warn('DBLink', 'doMigration - no profiles from API');
          return;
        }
        var profiles = result.profiles;
        var activeProfileId = Lampa.Account.Permit.account.profile.id;
        var imported = 0;
        var activatedId = null;
        var activatedName = null;
        console.log('DBLink', 'doMigration - profiles loaded:', profiles.length, 'activeProfileId:', activeProfileId);
        profiles.forEach(function (p, i) {
          console.log('DBLink', '  profile[' + i + ']: id=' + p.id + ' name="' + (p.name || '') + '" main=' + (p.main ? 'yes' : 'no'));
        });

        Lampa.Account.Api.load('plugins/all').then(function (pluginResult) {
          var allPlugins = pluginResult && pluginResult.secuses ? pluginResult.plugins || [] : [];
          console.log('DBLink', 'doMigration - plugins loaded:', allPlugins.length, 'secuses:', pluginResult && pluginResult.secuses);

          function processNext(index) {
            if (index >= profiles.length) {
              console.log('DBLink', 'doMigration - all profiles processed, imported:', imported);
              finishMigration(imported, activatedId, activatedName);
              return;
            }
            var cubProfile = profiles[index];
            var name = cubProfile.name || 'Profile ' + (index + 1);
            var avatar = getAvatar(name);
            var now = Math.floor(Date.now() / 1000);

            var captionExtras = {
              source: 'cub',
              source_id: cubProfile.id
            };
            var caption = buildCaption({
              name: name,
              avatar: avatar,
              updated: now
            }, captionExtras);
            console.log('DBLink', 'processNext[' + index + ']: name="' + name + '" cubProfile.id=' + cubProfile.id + ' activeProfileId=' + activeProfileId);
            console.log('DBLink', '  caption:', caption);
            Lampa.Noty.show('Importing "' + name + '" (' + (index + 1) + '/' + profiles.length + ')…');

            var bookmarkPromise = Lampa.Account.Api.load('bookmarks/dump', {
              headers: {
                profile: cubProfile.id
              },
              dataType: 'text'
            }).then(function (raw) {
              var fav = cubDumpToFavorite(raw);
              console.log('DBLink', '  bookmarks for "' + name + '": ' + (fav && fav.card ? fav.card.length : 0) + ' cards');
              return fav;
            })["catch"](function (err) {
              console.warn('DBLink', '  bookmarks failed for "' + name + '":', err && err.message);
              var f = {
                card: []
              };
              FAV_CATEGORIES.forEach(function (c) {
                f[c] = [];
              });
              return f;
            });

            var timelinePromise = Lampa.Account.Api.load('timeline/dump', {
              headers: {
                profile: cubProfile.id
              },
              dataType: 'text'
            }).then(function (raw) {
              var tl = cubDumpToTimeline(raw);
              console.log('DBLink', '  timeline for "' + name + '": ' + Object.keys(tl).length + ' entries');
              return tl;
            })["catch"](function (err) {
              console.warn('DBLink', '  timeline failed for "' + name + '":', err && err.message);
              return {};
            });

            Promise.all([bookmarkPromise, timelinePromise]).then(function (results) {
              var bookmarks = results[0];
              var timeline = results[1];
              var profilePlugins = mergeWithLocalPlugins(filterPluginsForProfile(allPlugins, cubProfile.id));
              console.log('DBLink', '  building fileData for "' + name + '" - plugins:', profilePlugins.length);
              var fileData = buildFileData({
                name: name,
                avatar: avatar,
                bookmarks: {
                  favorite: bookmarks
                },
                timeline: timeline,
                plugins: profilePlugins,
                settings: collectSettings()
              });
              var fileJson = JSON.stringify(fileData, null, 2);
              var fileName = 'profile_' + name.replace(/[<>:"\/\\|?*\x00-\x1f]/g, '_').slice(0, 64) + '_' + now + '.json';
              var channelId = getChannelId();
              client.sendFile(channelId, profilesTopicId, fileJson, fileName, caption).then(function (msgId) {
                console.log('DBLink', '  sendFile result for "' + name + '": msgId=' + msgId);
                if (msgId) {
                  imported++;
                  if (String(cubProfile.id) === String(activeProfileId)) {
                    activatedId = msgId;
                    activatedName = name;
                    console.log('DBLink', '  -> this profile will be activated after migration');
                  }
                } else {
                  console.warn('DBLink', '  sendFile returned no msgId for "' + name + '"');
                }
                processNext(index + 1);
              })["catch"](function (err) {
                console.error('DBLink', '  sendFile failed for "' + name + '":', err && err.message);
                processNext(index + 1);
              });
            })["catch"](function () {
              console.warn('DBLink', '  bookmark+timeline both failed for "' + name + '", creating empty profile');

              var profilePlugins = mergeWithLocalPlugins(filterPluginsForProfile(allPlugins, cubProfile.id));
              var fileData = buildFileData({
                name: name,
                avatar: avatar,
                plugins: profilePlugins,
                settings: collectSettings()
              });
              var fileJson = JSON.stringify(fileData, null, 2);
              var fileName = 'profile_' + name.replace(/[<>:"\/\\|?*\x00-\x1f]/g, '_').slice(0, 64) + '_' + now + '.json';
              var channelId = getChannelId();
              client.sendFile(channelId, profilesTopicId, fileJson, fileName, caption).then(function (msgId) {
                console.log('DBLink', '  sendFile (empty fallback) for "' + name + '": msgId=' + msgId);
                if (msgId) {
                  imported++;
                  if (String(cubProfile.id) === String(activeProfileId)) {
                    activatedId = msgId;
                    activatedName = name;
                  }
                }
                processNext(index + 1);
              })["catch"](function (err) {
                console.error('DBLink', '  sendFile (empty fallback) failed for "' + name + '":', err && err.message);
                processNext(index + 1);
              });
            });
          }
          processNext(0);
        })["catch"](function (e) {
          console.error('DBLink', 'Migration fetch plugins error:', e);
          Lampa.Noty.show('Failed to read Cub plugins');

          fallbackMigration(profiles, activeProfileId, profilesTopicId);
        });
      })["catch"](function (e) {
        console.error('DBLink', 'Migration fetch error:', e);
        Lampa.Noty.show('Failed to read Cub profiles: ' + (e.message || 'API error'));
      });
    }

    function fallbackMigration(profiles, activeProfileId, profilesTopicId) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;
      console.log('DBLink', 'fallbackMigration - profiles:', profiles.length, 'activeProfileId:', activeProfileId);
      var imported = 0;
      var activatedId = null;
      var activatedName = null;
      var now = Math.floor(Date.now() / 1000);
      function processNext(index) {
        if (index >= profiles.length) {
          console.log('DBLink', 'fallbackMigration - done, imported:', imported);
          finishMigration(imported, activatedId, activatedName);
          return;
        }
        var cubProfile = profiles[index];
        var name = cubProfile.name || 'Profile ' + (index + 1);
        var avatar = getAvatar(name);
        var ts = now + index;

        var captionExtras = {
          source: 'cub',
          source_id: cubProfile.id
        };
        var caption = buildCaption({
          name: name,
          avatar: avatar,
          updated: ts
        }, captionExtras);
        console.log('DBLink', 'fallback processNext[' + index + ']: name="' + name + '" id=' + cubProfile.id + ' caption:', caption);
        var fileData = buildFileData({
          name: name,
          avatar: avatar,
          plugins: mergeWithLocalPlugins([]),
          settings: collectSettings()
        });
        var fileJson = JSON.stringify(fileData, null, 2);
        var fileName = 'profile_' + name.replace(/[<>:"\/\\|?*\x00-\x1f]/g, '_').slice(0, 64) + '_' + ts + '.json';
        var channelId = getChannelId();
        client.sendFile(channelId, profilesTopicId, fileJson, fileName, caption).then(function (msgId) {
          if (msgId) {
            imported++;
            if (String(cubProfile.id) === String(activeProfileId)) {
              activatedId = msgId;
              activatedName = name;
            }
          }
          processNext(index + 1);
        })["catch"](function () {
          processNext(index + 1);
        });
      }
      processNext(0);
    }

    function finishMigration(count, activatedId, activatedName) {
      console.log('DBLink', 'finishMigration - imported:', count, 'activatedId:', activatedId, 'activatedName:', activatedName);
      if (activatedId) {
        Lampa.Storage.set('dblink_active_profile', String(activatedId));
        Lampa.Storage.set('dblink_active_profile_ts', String(Math.floor(Date.now() / 1000)));
        if (activatedName) Lampa.Storage.set('dblink_active_profile_name', activatedName);
        console.log('DBLink', '  activated profile saved:', activatedName, 'msgId:', activatedId);
      } else {
        console.warn('DBLink', '  no profile activated - activeProfileId did not match any cubProfile.id');
      }

      var enabledCtrl = Lampa.Controller.enabled().name;
      Lampa.Settings.create('dblink_tools', {
        onBack: function onBack() {
          Lampa.Settings.create('dblink');
        }
      });
      Lampa.Modal.open({
        title: 'Migration complete!',
        html: $('<div style="padding:1em">' + count + ' profiles imported successfully.</div>'),
        buttons: [{
          name: 'Reload now',
          onSelect: function onSelect() {
            Lampa.Modal.close();
            window.location.reload();
          }
        }, {
          name: 'Later',
          onSelect: function onSelect() {
            Lampa.Modal.close();
            Lampa.Controller.toggle(enabledCtrl);
          }
        }]
      });
    }

    var HTML_ESC_MAP = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    var HTML_ESC_RE = /[&<>"']/g;
    function escHtml(str) {
      if (!str) return '';
      return String(str).replace(HTML_ESC_RE, function (m) {
        return HTML_ESC_MAP[m];
      });
    }

    function softRefresh() {
      var activity = Lampa.Activity.active();
      if (!activity) return;
      if (activity.page) activity.page = 1;
      Lampa.Activity.replace(activity);
      activity.outdated = false;
    }

    function select(opts) {
      var prevController = Lampa.Controller.enabled().name;
      var items = (opts.items || []).map(function (item) {

        if (item.cancel === undefined && item.title === 'Cancel') item.cancel = true;
        return item;
      });
      Lampa.Select.show({
        title: opts.title,
        items: items,
        onSelect: function onSelect(item) {
          Lampa.Controller.toggle(prevController);
          if (item && item.cancel) {
            if (opts.onCancel) opts.onCancel();
            return;
          }
          if (opts.onSelect) opts.onSelect(item);
        },
        onBack: function onBack() {
          Lampa.Controller.toggle(prevController);
          if (opts.onBack) opts.onBack();
        },
        onFullDraw: opts.onFullDraw
      });
      return prevController;
    }

    function input(opts) {
      var prevController = Lampa.Controller.enabled().name;
      Lampa.Input.edit({
        title: opts.title,
        value: opts.value || '',
        align: opts.align || 'center',
        free: true,
        nosave: true
      }, function (val) {

        if (val === null || val === undefined) {
          Lampa.Controller.toggle(prevController);
          if (opts.onCancel) opts.onCancel();
          return;
        }
        Lampa.Controller.toggle(prevController);
        if (opts.onSubmit) opts.onSubmit(val);
      });
      return prevController;
    }

    var callbacks = {
      onOpenPluginManager: null
    };

    var _publishSuppressed = 0;
    var STORAGE_ACTIVE_PROFILE = STORAGE_KEYS.ACTIVE_PROFILE;
    var STORAGE_ACTIVE_PROFILE_TS = STORAGE_KEYS.ACTIVE_PROFILE_TS;
    var STORAGE_PROFILES_TOPIC$1 = STORAGE_KEYS.PROFILES_TOPIC;
    var STORAGE_PROFILES_SYNC_TOPIC$1 = STORAGE_KEYS.PROFILES_SYNC;
    var STORAGE_PROFILES_CACHE = STORAGE_KEYS.PROFILES_CACHE;
    var STORAGE_PLUGIN_REGISTRY = STORAGE_KEYS.PLUGIN_REGISTRY;
    var STORAGE_PROFILE_PLUGIN_URLS = STORAGE_KEYS.PROFILE_PLUGIN_URLS;

    var SYNC_KEY_MANIFEST = {
      storage: [{
        key: 'favorite',
        label: 'favorite'
      }, {
        key: 'file_view',
        label: 'file_view'
      }, {
        key: 'plugins',
        label: 'plugins'
      }, {
        key: 'dblink_sync_enabled',
        label: 'dblink_sync_enabled'
      }, {
        key: 'dblink_heartbeat',
        label: 'dblink_heartbeat'
      }, {
        key: 'dblink_broadcast',
        label: 'dblink_broadcast'
      }, {
        key: 'dblink_device_label',
        label: 'device_label'
      }],
      timestampPrefix: 'dblink_ts_'
    };

    var DEVICE_KEY_PREFIXES$1 = ['player', 'player_', 'subtitles_', 'video_quality_', 'navigation_', 'interface_', 'background_', 'glass_', 'card_', 'poster_', 'animation_', 'scroll_', 'request_caching', 'cache_images', 'mask', 'light_version', 'menu_always', 'black_style', 'dblink_heartbeat', 'dblink_broadcast'];
    function isDeviceKey(key) {
      return DEVICE_KEY_PREFIXES$1.some(function (p) {
        return key === p || key.indexOf(p) === 0;
      });
    }
    function updateSyncTimestamp(label) {
      Lampa.Storage.set(SYNC_KEY_MANIFEST.timestampPrefix + label, String(Math.floor(Date.now() / 1000)));
    }
    function getSyncTimestamp(label) {
      return parseInt(Lampa.Storage.get(SYNC_KEY_MANIFEST.timestampPrefix + label, '0'), 10);
    }
    function clearSyncTimestamps() {
      SYNC_KEY_MANIFEST.storage.forEach(function (s) {
        Lampa.Storage.set(SYNC_KEY_MANIFEST.timestampPrefix + s.label, '0');
      });
    }

    function resetDeviceOverlay() {
      var deviceId = getDeviceId();

      var keysToRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && isDeviceKey(key)) keysToRemove.push(key);
      }
      keysToRemove.forEach(function (k) {
        localStorage.removeItem(k);
      });

      var profilesSyncTopicId = Lampa.Storage.get('dblink_profiles_sync_topic', '');
      if (profilesSyncTopicId) {
        publishDeviceDelta(profilesSyncTopicId, 'device_setting', {
          device_id: deviceId,
          key: '__reset_overlay__',
          value: null
        }, 'all');
      }
    }
    var BACKUP_PREFIX = 'dblink_pbak_';

    function saveProfilesCache(profileMessages) {
      var activeId = Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, '');
      var cacheData = profileMessages.map(function (m) {
        try {
          var d = parseProfileMessage(m.message || m.text);
          if (!d) return null;
          var p = d.payload && d.payload.profile;
          if (!p) return null;
          return {
            msgId: m.id,
            name: p.name || 'Unnamed',
            avatar: p.avatar || getAvatar(p.name),
            updated: p.updated || 0,
            isActive: String(m.id) === String(activeId)
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      Lampa.Storage.set(STORAGE_PROFILES_CACHE, cacheData);
    }
    function getCachedProfiles() {
      try {
        var data = Lampa.Storage.get(STORAGE_PROFILES_CACHE, []);
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    }

    function getPluginRegistry() {
      try {
        var data = Lampa.Storage.get(STORAGE_PLUGIN_REGISTRY, []);
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    }
    function addToPluginRegistry(url, name) {
      if (!url) return;
      var registry = getPluginRegistry();
      if (!registry.some(function (p) {
        return p.url === url;
      })) {
        registry.push({
          url: url,
          name: name || extractNameFromUrl(url)
        });
        Lampa.Storage.set(STORAGE_PLUGIN_REGISTRY, registry);
      }
    }
    function removeFromPluginRegistry(url) {
      if (!url) return;
      var registry = getPluginRegistry().filter(function (p) {
        return p.url !== url;
      });
      Lampa.Storage.set(STORAGE_PLUGIN_REGISTRY, registry);
    }

    function refreshCacheFromTelegram() {
      var profilesTopicId = Lampa.Storage.get(STORAGE_PROFILES_TOPIC$1, '');
      if (!profilesTopicId) return;
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;
      client.getMessages(getChannelId(), profilesTopicId, 50).then(function (msgs) {
        var profileMessages = msgs.filter(function (m) {
          if (!(m.message || m.text)) return false;
          return !!parseProfileMessage(m.message || m.text);
        });
        if (profileMessages.length > 0) {
          saveProfilesCache(profileMessages);
        }
      })["catch"](function () {});
    }

    function refreshProfiles(profilesTopicId, profilesSyncTopicId, container, onDone) {
      if (!profilesTopicId) return;
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;
      client.getMessages(getChannelId(), profilesTopicId, 50).then(function (msgs) {
        container.empty();
        var profileMessages = msgs.filter(function (m) {
          if (!(m.message || m.text)) return false;
          return !!parseProfileMessage(m.message || m.text);
        });
        if (profileMessages.length === 0) {
          container.html('<div class="dblink-devices__empty">No profiles</div>');
          if (onDone) onDone();
          return;
        }
        var activeId = Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, '');

        var $grid = $('<div class="profile-grid"></div>');

        var $addCard = $('<div class="profile-card profile-card--add selector" data-action="add">' + '<div class="profile-card__add-icon">+</div>' + '<div>' + (Lampa.Lang.translate('dblink_create_profile') || 'Create profile') + '</div>' + '</div>');
        $grid.append($addCard);

        profileMessages.forEach(function (m) {
          var d = parseProfileMessage(m.message || m.text);
          if (!d) return;
          var p = d.payload && d.payload.profile;
          if (!p) return;
          var isActive = String(activeId) === String(m.id);
          var avatar = getAvatar(p.name);
          var avatarColorVal = avatarColor(p.name);
          var isUrl = isAvatarUrl(avatar);
          var avatarHtml = isUrl ? '<img src="' + avatar + '" alt="">' : '<div class="dblink-avatar" style="background:' + avatarColorVal + ';border-radius:50%;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">' + avatar + '</div>';
          var nameSafe = (p.name || 'Unnamed').replace(/"/g, '&quot;');
          var $card = $('<div class="profile-card selector' + (isActive ? ' profile-card--active' : '') + '" ' + 'data-id="' + m.id + '" ' + 'data-name="' + nameSafe + '" ' + 'data-active="' + isActive + '">' + '<div class="profile-card__avatar-wrap">' + avatarHtml + '</div>' + '<div class="profile-card__name">' + escHtml(p.name || 'Unnamed') + (isActive ? '<div class="profile-card__active-badge">● ' + (Lampa.Lang.translate('dblink_profile_active') || 'Active') + '</div>' : '') + '</div>' + '</div>');
          $grid.append($card);
        });
        container.empty().append($grid);

        $grid.find('.profile-card[data-id]').on('hover:enter', function () {
          var id = $(this).data('id');
          var isActive = $(this).data('active') === true;
          if (isActive) return;
          doSwitch(id, profilesTopicId, profilesSyncTopicId);
        });

        $addCard.on('hover:enter', function () {
          createProfile(profilesTopicId, profilesSyncTopicId, container);
        });

        saveProfilesCache(profileMessages);
        if (onDone) onDone();
      })["catch"](function () {
        if (onDone) onDone();
      });
    }
    function doSwitch(msgId, profilesTopicId, profilesSyncTopicId, container) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) {
        Lampa.Noty.show('Not connected');
        return;
      }
      var currentId = Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, '');
      if (currentId) {
        autoSaveProfile(currentId, profilesTopicId);
      }
      client.getMessages(getChannelId(), profilesTopicId, 50).then(function (msgs) {
        var target = findMessageById(msgs, msgId);
        if (!target) {
          Lampa.Noty.show('Profile not found');
          return;
        }
        return client.downloadMessageFile(target).then(function (fileData) {
          if (!fileData) {
            Lampa.Noty.show('Profile file not found');
            return;
          }

          var captionProfile = parseCaption(target.message || target.text);
          var profileName = captionProfile && captionProfile.name;
          if (profileName) Lampa.Storage.set('dblink_active_profile_name', profileName);
          var profileData;
          try {
            profileData = JSON.parse(fileData);
          } catch (e) {
            Lampa.Noty.show('Invalid profile data');
            return;
          }
          var fileTimestamp = target.date || 0;
          return replayDeltas(profilesSyncTopicId, msgId, fileTimestamp, profileData).then(function (mergedData) {
            applyProfileData(mergedData, msgId);
            softRefresh();
          });
        });
      })["catch"](function (e) {
        console.error('DBLink', 'Switch profile error:', e);
        Lampa.Noty.show('Switch failed');
      });
    }

    function replayDeltas(profilesSyncTopicId, profileMsgId, sinceTimestamp, snapshotData) {
      if (!profilesSyncTopicId) return Promise.resolve(snapshotData);
      var client = DBLinkClient.getInstance();
      return client.getMessagesSince(profilesSyncTopicId, sinceTimestamp, 50).then(function (deltas) {
        var data = deepClone(snapshotData);
        deltas.forEach(function (msg) {
          var d;
          try {
            d = JSON.parse(stripCodeFence(msg.message || msg.text));
          } catch (e) {
            return;
          }
          if (!d || !d.meta || d.meta.type !== 'profile_delta') return;
          if (String(d.meta.profile_msg_id) !== String(profileMsgId)) return;
          var sub = d.meta.subtype;
          var payload = d.payload;
          if (sub === 'bookmark_add') {
            if (!data.bookmarks) data.bookmarks = {};
            if (!data.bookmarks.favorite) data.bookmarks.favorite = {
              card: []
            };
            var fav = data.bookmarks.favorite;
            if (!fav.card) fav.card = [];
            var existing = fav.card.filter(function (c) {
              return c && c.id == payload.card_id;
            });
            if (existing.length === 0) {
              fav.card.push(payload.card);
            }
            var catType = payload.type || 'like';
            if (!fav[catType]) fav[catType] = [];
            if (fav[catType].indexOf(payload.card_id) === -1) {
              fav[catType].push(payload.card_id);
            }
          } else if (sub === 'bookmark_remove') {
            if (data.bookmarks && data.bookmarks.favorite) {
              var fav = data.bookmarks.favorite;
              var catType = payload.type || 'like';
              if (fav[catType]) {
                fav[catType] = fav[catType].filter(function (id) {
                  return String(id) !== String(payload.card_id);
                });
              }
              var stillReferenced = false;
              for (var _ck in fav) {
                if (_ck === 'card') continue;
                if (Array.isArray(fav[_ck]) && fav[_ck].some(function (id) {
                  return String(id) === String(payload.card_id);
                })) {
                  stillReferenced = true;
                  break;
                }
              }
              if (!stillReferenced && fav.card) {
                fav.card = fav.card.filter(function (c) {
                  return c && String(c.id) !== String(payload.card_id);
                });
              }
            }
          } else if (sub === 'timecode_update') {
            if (!data.timeline) data.timeline = {};
            data.timeline[payload.hash] = {
              time: payload.time,
              duration: payload.duration,
              percent: payload.percent
            };
          } else if (sub === 'plugin_change') {
            if (!data.plugins) data.plugins = [];
            if (payload.action === 'add') {
              data.plugins.push(payload.plugin);
            } else if (payload.action === 'remove') {
              data.plugins = data.plugins.filter(function (p) {
                return p.url !== payload.plugin.url;
              });
            } else if (payload.action === 'toggle') {
              data.plugins.forEach(function (p) {
                if (p.url === payload.plugin.url) p.status = payload.plugin.status;
              });
            }
          } else if (sub === 'device_plugin_status') {
            if (!data.device_overrides) data.device_overrides = {};
            if (!data.device_overrides[payload.device_id]) data.device_overrides[payload.device_id] = {};
            if (!data.device_overrides[payload.device_id].plugins_status) data.device_overrides[payload.device_id].plugins_status = {};
            data.device_overrides[payload.device_id].plugins_status[payload.url] = payload.status;
          } else if (sub === 'device_plugin_custom') {
            if (!data.device_overrides) data.device_overrides = {};
            if (!data.device_overrides[payload.device_id]) data.device_overrides[payload.device_id] = {};
            if (!data.device_overrides[payload.device_id].plugins_custom) data.device_overrides[payload.device_id].plugins_custom = {};
            data.device_overrides[payload.device_id].plugins_custom[payload.url] = payload.custom;
          } else if (sub === 'device_setting') {
            if (!data.device_overrides) data.device_overrides = {};
            if (!data.device_overrides[payload.device_id]) data.device_overrides[payload.device_id] = {};
            if (!data.device_overrides[payload.device_id].settings) data.device_overrides[payload.device_id].settings = {};
            data.device_overrides[payload.device_id].settings[payload.key] = payload.value;
          }
        });
        return data;
      })["catch"](function () {
        return snapshotData;
      });
    }

    function getFavoriteCategoryKeys() {
      try {
        var full = Lampa.Favorite.full();
        return Object.keys(full).filter(function (k) {
          return k !== 'card' && Array.isArray(full[k]);
        });
      } catch (e) {

        return ['like', 'wath', 'book', 'history', 'look', 'viewed', 'scheduled', 'continued', 'thrown'];
      }
    }
    function normalizeFavoriteIds(favorite) {
      if (!favorite || !favorite.card) return favorite;

      var cardMap = {};
      for (var i = 0; i < favorite.card.length; i++) {
        var c = favorite.card[i];
        if (c && c.id != null) cardMap[c.id] = c;
      }

      var categories = getFavoriteCategoryKeys();
      for (var k = 0; k < categories.length; k++) {
        var cat = categories[k];
        if (!favorite[cat]) continue;
        for (var j = 0; j < favorite[cat].length; j++) {
          var id = favorite[cat][j];

          for (var cid in cardMap) {
            if (cid == id && id !== cardMap[cid].id) {

              favorite[cat][j] = cardMap[cid].id;
              break;
            }
          }
        }
      }
      return favorite;
    }

    function applyProfileData(data, msgId) {
      var deviceId = getDeviceId();
      var override = data.device_overrides && data.device_overrides[deviceId];

      if (data.bookmarks && data.bookmarks.favorite) {
        suppressPublish();
        normalizeFavoriteIds(data.bookmarks.favorite);
        Lampa.Storage.set('favorite', data.bookmarks.favorite);
        if (Lampa.Favorite && Lampa.Favorite.read) {
          Lampa.Favorite.read();
        }
        unsuppressPublish();
      }

      if (data.timeline) {
        Lampa.Storage.set('file_view', data.timeline);
      }

      if (data.plugins) {

        var profileUrls = [];
        for (var pi = 0; pi < data.plugins.length; pi++) {
          var pu = data.plugins[pi].url;
          if (pu) profileUrls.push(pu);
        }

        var knownProfileUrls;
        try {
          knownProfileUrls = JSON.parse(Lampa.Storage.get(STORAGE_PROFILE_PLUGIN_URLS, '[]')) || [];
        } catch (e) {
          knownProfileUrls = [];
        }
        var knownMap = {};
        for (var ki = 0; ki < knownProfileUrls.length; ki++) {
          knownMap[knownProfileUrls[ki]] = true;
        }

        Lampa.Storage.set(STORAGE_PROFILE_PLUGIN_URLS, JSON.stringify(profileUrls));

        var localPlugins = collectPlugins();
        var localByUrl = {};
        for (var li = 0; li < localPlugins.length; li++) {
          localByUrl[localPlugins[li].url] = localPlugins[li];
        }

        var profileByUrl = {};
        for (var pi2 = 0; pi2 < data.plugins.length; pi2++) {
          profileByUrl[data.plugins[pi2].url] = data.plugins[pi2];
        }

        var mergedPlugins = [];
        var mergedUrls = {};

        for (var li2 = 0; li2 < localPlugins.length; li2++) {
          var lp = localPlugins[li2];
          var profileMatch = profileByUrl[lp.url];
          if (profileMatch) {
            var ds = override && override.plugins_status && override.plugins_status[lp.url];
            var dc = override && override.plugins_custom && override.plugins_custom[lp.url];
            mergedPlugins.push({
              url: lp.url,
              name: profileMatch.name || lp.name,
              status: ds !== undefined ? ds : profileMatch.status,
              custom: dc !== undefined ? dc : profileMatch.custom || lp.custom
            });
          } else {
            mergedPlugins.push({
              url: lp.url,
              name: lp.name,
              status: lp.status !== undefined ? lp.status : 1,
              custom: lp.custom
            });
          }
          mergedUrls[lp.url] = true;
        }

        for (var pi3 = 0; pi3 < data.plugins.length; pi3++) {
          var pp = data.plugins[pi3];
          if (!pp.url) continue;

          if (mergedUrls[pp.url]) continue;

          if (knownMap[pp.url] && !localByUrl[pp.url]) continue;

          var ds2 = override && override.plugins_status && override.plugins_status[pp.url];
          var dc2 = override && override.plugins_custom && override.plugins_custom[pp.url];
          mergedPlugins.push({
            url: pp.url,
            name: pp.name,
            status: ds2 !== undefined ? ds2 : pp.status,
            custom: dc2 !== undefined ? dc2 : pp.custom
          });
          mergedUrls[pp.url] = true;
        }

        var glTargetUrl = window.__dblink_self_url || './plugins/DBLink.js';
        var glPresent = false;
        for (var _glu in mergedUrls) {
          if (_glu.indexOf('DBLink.js') >= 0 || _glu.indexOf('dblink') >= 0) {
            glPresent = true;
            break;
          }
        }
        if (!glPresent) {
          mergedPlugins.push({
            url: glTargetUrl,
            name: 'DBLink',
            status: 1,
            custom: {}
          });
        }
        Lampa.Storage.set('plugins', mergedPlugins);
      }

      var userSettings = data.settings || {};
      if (userSettings.sync_enabled !== undefined) Lampa.Storage.set('dblink_sync_enabled', userSettings.sync_enabled);
      if (userSettings.heartbeat !== undefined) Lampa.Storage.set('dblink_heartbeat', userSettings.heartbeat);
      if (userSettings.broadcast !== undefined) Lampa.Storage.set('dblink_broadcast', userSettings.broadcast);

      if (override && override.settings) {
        Object.keys(override.settings).forEach(function (key) {
          Lampa.Storage.set(key, override.settings[key]);
        });
      }

      Lampa.Storage.set(STORAGE_ACTIVE_PROFILE, String(msgId));
      Lampa.Storage.set(STORAGE_ACTIVE_PROFILE_TS, String(Math.floor(Date.now() / 1000)));
      Lampa.Noty.show('Profile activated');
    }

    function createProfile(profilesTopicId, profilesSyncTopicId, container) {
      Lampa.Input.edit({
        title: 'Profile name',
        value: '',
        free: true,
        nosave: true,
        align: 'center'
      }, function (name) {
        if (!name) return;
        var client = DBLinkClient.getInstance();
        if (!client.isConnected()) {
          Lampa.Noty.show('Not connected');
          return;
        }
        var profileName = name.trim();
        var avatar = getAvatar(profileName);
        var now = Math.floor(Date.now() / 1000);
        var caption = buildCaption({
          name: profileName,
          avatar: avatar,
          updated: now
        });

        client.getMessages(getChannelId(), profilesTopicId, 50).then(function (msgs) {
          var hasProfiles = msgs.some(function (m) {
            if (!(m.message || m.text)) return false;
            return !!parseProfileMessage(m.message || m.text);
          });
          var fileData = buildFileData({
            name: profileName,
            avatar: avatar,
            bookmarks: hasProfiles ? {
              favorite: {}
            } : {
              favorite: collectFavorite()
            },
            timeline: hasProfiles ? {} : collectTimeline(),
            plugins: collectPlugins(),
            settings: collectSettings()
          });
          var fileJson = JSON.stringify(fileData, null, 2);
          var fileName = buildProfileFileName(profileName, now);
          client.sendFile(getChannelId(), profilesTopicId, fileJson, fileName, caption).then(function (msgId) {
            if (msgId) {
              Lampa.Storage.set(STORAGE_ACTIVE_PROFILE, String(msgId));
              Lampa.Storage.set(STORAGE_ACTIVE_PROFILE_TS, String(now));
              Lampa.Storage.set('dblink_active_profile_name', profileName);
              refreshProfiles(profilesTopicId, profilesSyncTopicId, container);
              Lampa.Noty.show('Profile created');
            } else {
              Lampa.Noty.show('Failed to create profile');
            }
          })["catch"](function (e) {
            console.error('DBLink', 'Profile create error:', e);
            Lampa.Noty.show('Failed to create profile');
          });
        })["catch"](function () {
          Lampa.Noty.show('Failed to check existing profiles');
        });
      });
    }

    function syncProfile(msgId, profilesTopicId) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) {
        Lampa.Noty.show('Not connected');
        return;
      }
      var now = Math.floor(Date.now() / 1000);
      client.getMessages(getChannelId(), profilesTopicId, 50).then(function (msgs) {
        var target = findMessageById(msgs, msgId);
        if (!target) {
          Lampa.Noty.show('Profile not found');
          return;
        }
        var p = parseCaption(target.message || target.text) || {};
        var profileName = p.name || 'Unnamed';
        var avatar = p.avatar || getAvatar(profileName);

        var fullMsg = parseProfileMessage(target.message || target.text);
        var srcMeta = {};
        if (fullMsg && fullMsg.meta && fullMsg.meta.source) {
          srcMeta.source = fullMsg.meta.source;
          srcMeta.source_id = fullMsg.meta.source_id;
        }
        var caption = buildCaption({
          name: profileName,
          avatar: avatar,
          updated: now
        }, srcMeta);
        var fileData = buildFileData({
          name: profileName,
          avatar: avatar,
          bookmarks: {
            favorite: collectFavorite()
          },
          timeline: collectTimeline(),
          plugins: collectPlugins(),
          settings: collectSettings()
        });
        var fileJson = JSON.stringify(fileData, null, 2);
        var fileName = buildProfileFileName(profileName, now);
        client.sendFile(getChannelId(), profilesTopicId, fileJson, fileName, caption).then(function (newMsgId) {
          if (newMsgId) {

            client.deleteMessage(getChannelId(), parseInt(msgId, 10))["catch"](function () {});
            if (String(msgId) === String(Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, ''))) {
              Lampa.Storage.set(STORAGE_ACTIVE_PROFILE, String(newMsgId));
              Lampa.Storage.set(STORAGE_ACTIVE_PROFILE_TS, String(now));
            }
            Lampa.Noty.show('Profile synced');
          }
        })["catch"](function (e) {
          console.error('DBLink', 'Profile sync error:', e);
          Lampa.Noty.show('Sync failed');
        });
      });
    }
    function autoSaveProfile(msgId, profilesTopicId) {
      syncProfile(msgId, profilesTopicId);
    }

    function renameProfile(msgId, profilesTopicId, newName, onDone) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) {
        Lampa.Noty.show('Not connected');
        if (onDone) onDone();
        return;
      }
      client.getMessages(getChannelId(), profilesTopicId, 50).then(function (msgs) {
        var target = findMessageById(msgs, msgId);
        if (!target) {
          Lampa.Noty.show('Profile not found');
          if (onDone) onDone();
          return;
        }
        return client.downloadMessageFile(target).then(function (fileData) {
          if (!fileData) {
            Lampa.Noty.show('Profile file not found');
            if (onDone) onDone();
            return;
          }
          var data;
          try {
            data = JSON.parse(fileData);
          } catch (e) {
            Lampa.Noty.show('Invalid profile data');
            if (onDone) onDone();
            return;
          }
          data.profile_meta.name = newName;

          var oldCaption = parseCaption(target.message || target.text);
          var avatar = data.profile_meta && data.profile_meta.avatar || oldCaption && oldCaption.avatar || getAvatar(newName);
          var now = Math.floor(Date.now() / 1000);
          var caption = buildCaption({
            name: newName,
            avatar: avatar,
            updated: now
          });
          var fileJson = JSON.stringify(data, null, 2);
          var fileName = buildProfileFileName(newName, now);
          client.sendFile(getChannelId(), profilesTopicId, fileJson, fileName, caption).then(function (newMsgId) {
            if (newMsgId) {
              client.deleteMessage(getChannelId(), parseInt(msgId, 10))["catch"](function () {});
              if (String(msgId) === String(Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, ''))) {
                Lampa.Storage.set(STORAGE_ACTIVE_PROFILE, String(newMsgId));
                Lampa.Storage.set('dblink_active_profile_name', newName);
              }
              Lampa.Noty.show(Lampa.Lang.translate('dblink_profile_renamed') || 'Profile renamed');
            } else {
              Lampa.Noty.show('Rename failed');
            }
            if (onDone) onDone(newMsgId || null);
          })["catch"](function () {
            Lampa.Noty.show('Rename failed');
            if (onDone) onDone();
          });
        });
      })["catch"](function () {
        Lampa.Noty.show('Failed to load profile');
        if (onDone) onDone();
      });
    }

    function collectDeviceScopedSettings() {
      var result = {};
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key) continue;
        if (key.indexOf('dblink_') === 0 && !isDeviceKey(key)) continue;
        if (isDeviceKey(key)) {
          try {
            result[key] = JSON.parse(localStorage.getItem(key));
          } catch (e) {
            result[key] = localStorage.getItem(key);
          }
        }
      }
      return result;
    }

    var compactTimer = null;
    var compactLastRun = 0;
    var COMPACT_DEBOUNCE_MS = 30000;
    var COMPACT_MIN_INTERVAL = 60000;

    function publishLocalDelta(profilesSyncTopicId, subtype, payload) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected() || !profilesSyncTopicId) return;
      var activeProfileId = Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, '');
      if (!activeProfileId) return;
      client.publishDelta(profilesSyncTopicId, subtype, activeProfileId, payload);
      scheduleCompact();
    }

    function publishDeviceDelta(profilesSyncTopicId, subtype, payload, targetDeviceId) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected() || !profilesSyncTopicId) return;
      var activeProfileId = Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, '');
      if (!activeProfileId) return;
      var msg = JSON.stringify({
        meta: {
          type: 'profile_delta',
          subtype: subtype,
          profile_msg_id: activeProfileId,
          device_id: getDeviceId(),
          target_device_id: targetDeviceId || 'all',
          timestamp: Math.floor(Date.now() / 1000)
        },
        payload: payload || {}
      });
      client.publishRaw(profilesSyncTopicId, msg, true);
      scheduleCompact();
    }

    function scheduleCompact() {
      if (compactTimer) clearTimeout(compactTimer);
      compactTimer = setTimeout(function () {
        compactTimer = null;
        compactProfile();
      }, COMPACT_DEBOUNCE_MS);
    }
    function compactProfile() {
      var now = Date.now();

      if (now - compactLastRun < COMPACT_MIN_INTERVAL) {
        var remaining = COMPACT_MIN_INTERVAL - (now - compactLastRun);
        if (compactTimer) clearTimeout(compactTimer);
        compactTimer = setTimeout(function () {
          compactTimer = null;
          compactProfile();
        }, remaining);
        return;
      }
      var profilesTopicId = Lampa.Storage.get(STORAGE_PROFILES_TOPIC$1, '');
      var activeId = Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, '');
      var channelId = getChannelId();
      if (!profilesTopicId || !activeId || !channelId) return;
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;

      client.getMessages(channelId, profilesTopicId, 50).then(function (msgs) {
        var target = findMessageById(msgs, activeId);
        if (!target) return;
        var captionProfile = parseCaption(target.message || target.text);
        var profileName = captionProfile && captionProfile.name || Lampa.Storage.get(STORAGE_KEYS.ACTIVE_PROFILE_NAME, '') || 'Unnamed';
        var profileAvatar = captionProfile && captionProfile.avatar || getAvatar(profileName);
        var ts = Math.floor(now / 1000);

        var fullMsg = parseProfileMessage(target.message || target.text);
        var srcMeta = {};
        if (fullMsg && fullMsg.meta && fullMsg.meta.source) {
          srcMeta.source = fullMsg.meta.source;
          srcMeta.source_id = fullMsg.meta.source_id;
        }
        var caption = buildCaption({
          name: profileName,
          avatar: profileAvatar,
          updated: ts
        }, srcMeta);
        var fileData = buildFileData({
          name: profileName,
          avatar: profileAvatar,
          bookmarks: {
            favorite: collectFavorite()
          },
          timeline: collectTimeline(),
          plugins: collectPlugins(),
          settings: collectSettings()
        });
        var fileJson = JSON.stringify(fileData, null, 2);
        var fileName = buildProfileFileName(profileName, ts);
        client.sendFile(channelId, profilesTopicId, fileJson, fileName, caption).then(function (newMsgId) {
          if (!newMsgId) return;

          client.deleteMessage(channelId, parseInt(activeId, 10))["catch"](function () {});

          Lampa.Storage.set(STORAGE_ACTIVE_PROFILE, String(newMsgId));
          Lampa.Storage.set(STORAGE_ACTIVE_PROFILE_TS, String(ts));
          compactLastRun = now;

          var currentSeen = getLastDeltaSeen();
          if (ts > currentSeen) setLastDeltaSeen(ts);
        })["catch"](function (err) {
          console.warn('DBLink', 'Compact profile failed:', err && err.message);
        });
      })["catch"](function () {});
    }

    function startAutoActivation(profilesTopicId, profilesSyncTopicId) {
      var activeId = Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, '');
      if (!activeId) return;
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;
      client.getMessages(getChannelId(), profilesTopicId, 50).then(function (msgs) {
        var target = findMessageById(msgs, activeId);
        if (!target) {
          Lampa.Storage.set(STORAGE_ACTIVE_PROFILE, '');
          return;
        }
        return client.downloadMessageFile(target).then(function (fileData) {
          if (!fileData) return;
          var data;
          try {
            data = JSON.parse(fileData);
          } catch (e) {
            return;
          }

          var fileTimestamp = target.date || 0;
          return replayDeltas(profilesSyncTopicId, activeId, fileTimestamp, data).then(function (mergedData) {

            if (mergedData.plugins) {
              var deviceId = getDeviceId();
              var override = mergedData.device_overrides && mergedData.device_overrides[deviceId];

              var profileUrls = [];
              for (var pi = 0; pi < mergedData.plugins.length; pi++) {
                var pu = mergedData.plugins[pi].url;
                if (pu) profileUrls.push(pu);
              }

              var knownProfileUrls;
              try {
                knownProfileUrls = JSON.parse(Lampa.Storage.get(STORAGE_PROFILE_PLUGIN_URLS, '[]')) || [];
              } catch (e) {
                knownProfileUrls = [];
              }
              var knownMap = {};
              for (var ki = 0; ki < knownProfileUrls.length; ki++) {
                knownMap[knownProfileUrls[ki]] = true;
              }

              Lampa.Storage.set(STORAGE_PROFILE_PLUGIN_URLS, JSON.stringify(profileUrls));

              var localPlugins = collectPlugins();
              var localByUrl = {};
              for (var li = 0; li < localPlugins.length; li++) {
                localByUrl[localPlugins[li].url] = localPlugins[li];
              }

              var profileByUrl = {};
              for (var pi2 = 0; pi2 < mergedData.plugins.length; pi2++) {
                profileByUrl[mergedData.plugins[pi2].url] = mergedData.plugins[pi2];
              }
              var merged = [];
              var mergedUrls = {};

              for (var li2 = 0; li2 < localPlugins.length; li2++) {
                var lp = localPlugins[li2];
                var profileMatch = profileByUrl[lp.url];
                if (profileMatch) {
                  var ds = override && override.plugins_status && override.plugins_status[lp.url];
                  var dc = override && override.plugins_custom && override.plugins_custom[lp.url];
                  merged.push({
                    url: lp.url,
                    name: profileMatch.name || lp.name,
                    status: ds !== undefined ? ds : lp.status !== undefined ? lp.status : profileMatch.status,
                    custom: dc !== undefined ? dc : profileMatch.custom || lp.custom
                  });
                } else {
                  merged.push({
                    url: lp.url,
                    name: lp.name,
                    status: lp.status !== undefined ? lp.status : 1,
                    custom: lp.custom
                  });
                }
                mergedUrls[lp.url] = true;
              }

              for (var pi3 = 0; pi3 < mergedData.plugins.length; pi3++) {
                var pp = mergedData.plugins[pi3];
                if (!pp.url) continue;
                if (mergedUrls[pp.url]) continue;

                if (knownMap[pp.url] && !localByUrl[pp.url]) continue;
                var ds2 = override && override.plugins_status && override.plugins_status[pp.url];
                var dc2 = override && override.plugins_custom && override.plugins_custom[pp.url];
                merged.push({
                  url: pp.url,
                  name: pp.name,
                  status: ds2 !== undefined ? ds2 : pp.status !== undefined ? pp.status : 1,
                  custom: dc2 !== undefined ? dc2 : pp.custom
                });
                mergedUrls[pp.url] = true;
              }

              var glTargetUrl = window.__dblink_self_url || './plugins/DBLink.js';
              var glPresent = false;
              for (var _glu in mergedUrls) {
                if (_glu.indexOf('DBLink.js') >= 0 || _glu.indexOf('dblink') >= 0) {
                  glPresent = true;
                  break;
                }
              }
              if (!glPresent) {
                merged.push({
                  url: glTargetUrl,
                  name: 'DBLink',
                  status: 1,
                  custom: {}
                });
              }
              Lampa.Storage.set('plugins', merged);
            }
            if (mergedData.settings) {
              var deviceId2 = getDeviceId();
              var override2 = mergedData.device_overrides && mergedData.device_overrides[deviceId2];
              var devSettings = override2 && override2.settings || {};
              if (mergedData.settings.sync_enabled !== undefined) Lampa.Storage.set('dblink_sync_enabled', devSettings.dblink_sync_enabled !== undefined ? devSettings.dblink_sync_enabled : mergedData.settings.sync_enabled);
              if (mergedData.settings.heartbeat !== undefined) Lampa.Storage.set('dblink_heartbeat', devSettings.dblink_heartbeat !== undefined ? devSettings.dblink_heartbeat : mergedData.settings.heartbeat);
              if (mergedData.settings.broadcast !== undefined) Lampa.Storage.set('dblink_broadcast', devSettings.broadcast !== undefined ? devSettings.broadcast : mergedData.settings.broadcast);

              Object.keys(devSettings).forEach(function (key) {
                if (key === 'dblink_sync_enabled' || key === 'dblink_heartbeat' || key === 'dblink_broadcast') return;
                Lampa.Storage.set(key, devSettings[key]);
              });
            }

            if (mergedData.bookmarks && mergedData.bookmarks.favorite) {
              suppressPublish();
              normalizeFavoriteIds(mergedData.bookmarks.favorite);
              Lampa.Storage.set('favorite', mergedData.bookmarks.favorite);
              if (Lampa.Favorite && Lampa.Favorite.read) {
                Lampa.Favorite.read();
              }
              unsuppressPublish();
            }
            if (mergedData.timeline) {
              Lampa.Storage.set('file_view', mergedData.timeline);
            }

            var captionProfile = parseCaption(target.message || target.text);
            var captionName = captionProfile && captionProfile.name;
            if (captionName) Lampa.Storage.set('dblink_active_profile_name', captionName);
          });
        });
      })["catch"](function () {});
    }

    function applyDelta(data) {
      var activeId = Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, '');
      if (!data || !data.meta || String(data.meta.profile_msg_id) !== String(activeId)) return;

      if (data.meta.device_id === getDeviceId()) return;

      if (data.meta.subtype && data.meta.subtype.indexOf('device_') === 0) {
        var target = data.meta.target_device_id || 'all';
        if (target !== 'all' && target !== getDeviceId()) return;
      }
      var payload = data.payload;
      var sub = data.meta.subtype;
      if (sub === 'bookmark_add' && payload.card_id && payload.card) {
        suppressPublish();
        try {
          if (Lampa.Favorite && Lampa.Favorite.add) {
            Lampa.Favorite.add(payload.type, payload.card);
          }
        } catch (e) {
          var _fav = Lampa.Storage.get('favorite', {
            card: []
          });
          if (!_fav.card) _fav.card = [];
          var _existing = _fav.card.filter(function (c) {
            return c && c.id == payload.card_id;
          });
          if (_existing.length === 0) {
            _fav.card.push(payload.card);
          }
          var _catType = payload.type || 'like';
          if (!_fav[_catType]) _fav[_catType] = [];
          if (_fav[_catType].indexOf(payload.card_id) === -1) {
            _fav[_catType].push(payload.card_id);
          }
          Lampa.Storage.set('favorite', _fav);
          if (Lampa.Favorite && Lampa.Favorite.read) Lampa.Favorite.read();
        }
        unsuppressPublish();
      } else if (sub === 'bookmark_remove' && payload.card_id) {
        suppressPublish();
        try {
          if (Lampa.Favorite && Lampa.Favorite.remove) {
            Lampa.Favorite.remove(payload.type, {
              id: payload.card_id
            });
          }
        } catch (e) {
          var _fav = Lampa.Storage.get('favorite', {});
          var _catType = payload.type || 'like';
          if (_fav[_catType]) {
            _fav[_catType] = _fav[_catType].filter(function (id) {
              return String(id) !== String(payload.card_id);
            });
          }
          if (_fav.card) {
            var _stillRef = false;
            for (var _ck in _fav) {
              if (_ck === 'card') continue;
              if (Array.isArray(_fav[_ck]) && _fav[_ck].some(function (id) {
                return String(id) === String(payload.card_id);
              })) {
                _stillRef = true;
                break;
              }
            }
            if (!_stillRef) {
              _fav.card = _fav.card.filter(function (c) {
                return c && String(c.id) !== String(payload.card_id);
              });
            }
          }
          Lampa.Storage.set('favorite', _fav);
          if (Lampa.Favorite && Lampa.Favorite.read) Lampa.Favorite.read();
        }
        unsuppressPublish();
      } else if (sub === 'timecode_update' && payload.hash) {
        var tl = Lampa.Storage.get('file_view', {});
        tl[payload.hash] = {
          time: payload.time,
          duration: payload.duration,
          percent: payload.percent
        };
        Lampa.Storage.set('file_view', tl);
      } else if (sub === 'plugin_change') {
        var plugins = Lampa.Storage.get('plugins', []);
        if (payload.action === 'add') plugins.push(payload.plugin);else if (payload.action === 'remove') {
          plugins = plugins.filter(function (p) {
            return p.url !== payload.plugin.url;
          });
        } else if (payload.action === 'toggle') {
          plugins.forEach(function (p) {
            if (p.url === payload.plugin.url) p.status = payload.plugin.status;
          });
        }
        Lampa.Storage.set('plugins', plugins);
      } else if (sub === 'device_plugin_status') {
        var plugins2 = Lampa.Storage.get('plugins', []);
        plugins2.forEach(function (p) {
          if (p.url === payload.url) p.status = payload.status;
        });
        Lampa.Storage.set('plugins', plugins2);
      } else if (sub === 'device_setting') {
        if (payload.key) Lampa.Storage.set(payload.key, payload.value);
      }
    }
    function refreshDeltas() {
      var profilesSyncTopicId = Lampa.Storage.get(STORAGE_PROFILES_SYNC_TOPIC$1, '');
      if (!profilesSyncTopicId) return;
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;
      var lastSeen = getLastDeltaSeen();
      client.getMessagesSince(profilesSyncTopicId, lastSeen, 30).then(function (msgs) {
        var newest = lastSeen;
        msgs.forEach(function (m) {
          if (m.date > newest) newest = m.date;
          try {
            var d = JSON.parse(stripCodeFence(m.message || m.text));
            if (d && d.meta && d.meta.type === 'profile_delta') {
              applyDelta(d);
            }
          } catch (e) {}
        });
        if (newest > lastSeen) {
          setLastDeltaSeen(newest);
        }
      })["catch"](function () {});
    }
    function isSkipPublish() {
      return _publishSuppressed > 0;
    }
    function suppressPublish() {
      _publishSuppressed++;
    }
    function unsuppressPublish() {
      if (_publishSuppressed > 0) _publishSuppressed--;
    }

    function backupProfileOffline(profileMsgId) {
      SYNC_KEY_MANIFEST.storage.forEach(function (s) {
        var val = Lampa.Storage.get(s.key, '');
        if (val !== '' && val !== null && val !== undefined) {
          Lampa.Storage.set(BACKUP_PREFIX + profileMsgId + '_' + s.key, val);
        }
      });
    }
    function restoreProfileOffline(profileMsgId) {
      SYNC_KEY_MANIFEST.storage.forEach(function (s) {
        var backupKey = BACKUP_PREFIX + profileMsgId + '_' + s.key;
        var val = Lampa.Storage.get(backupKey, '');
        if (val !== '' && val !== null && val !== undefined) {
          Lampa.Storage.set(s.key, val);
        } else {

          try {
            var parsed = JSON.parse(val);
            Lampa.Storage.set(s.key, parsed);
          } catch (e) {}
        }
      });

      suppressPublish();
      if (Lampa.Favorite && Lampa.Favorite.read) Lampa.Favorite.read();
      unsuppressPublish();
    }

    function quickSwitchProfile(msgId) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) {
        Lampa.Noty.show('Not connected');
        return;
      }
      var profilesTopicId = Lampa.Storage.get(STORAGE_PROFILES_TOPIC$1, '');
      var profilesSyncTopicId = Lampa.Storage.get(STORAGE_PROFILES_SYNC_TOPIC$1, '');
      if (!profilesTopicId) {
        Lampa.Noty.show('Sync not ready');
        return;
      }
      if (String(msgId) === String(Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, ''))) {
        Lampa.Noty.show('Already active');
        return;
      }
      Lampa.Loading.start();
      var currentId = Lampa.Storage.get(STORAGE_ACTIVE_PROFILE, '');
      if (currentId) {
        autoSaveProfile(currentId, profilesTopicId);
      }
      client.getMessages(getChannelId(), profilesTopicId, 50).then(function (msgs) {
        var target = findMessageById(msgs, msgId);
        if (!target) {
          Lampa.Loading.stop();
          Lampa.Noty.show('Profile not found');
          return;
        }
        return client.downloadMessageFile(target).then(function (fileData) {
          if (!fileData) {
            Lampa.Loading.stop();
            Lampa.Noty.show('Profile not found');
            return;
          }
          var profileData,
            fileTimestamp = target.date || 0;
          try {
            profileData = JSON.parse(fileData);
          } catch (e) {
            Lampa.Loading.stop();
            Lampa.Noty.show('Invalid data');
            return;
          }
          var captionProfile = parseCaption(target.message || target.text);
          var profileName = captionProfile && captionProfile.name;
          if (profileName) Lampa.Storage.set('dblink_active_profile_name', profileName);
          return replayDeltas(profilesSyncTopicId, msgId, fileTimestamp, profileData).then(function (mergedData) {
            applyProfileData(mergedData, msgId);
            updateSyncTimestamp('favorite');
            updateSyncTimestamp('file_view');
            updateSyncTimestamp('plugins');
            Lampa.Loading.stop();
            softRefresh();
          });
        });
      })["catch"](function (e) {
        Lampa.Loading.stop();
        console.error('DBLink', 'Quick switch error:', e);
        Lampa.Noty.show('Switch failed');
      });
    }
    var Profiles = {
      refreshProfiles: refreshProfiles,
      createProfile: createProfile,
      applyProfileData: applyProfileData,
      getAvatar: getAvatar,
      avatarColor: avatarColor,
      saveProfilesCache: saveProfilesCache,
      startAutoActivation: startAutoActivation,
      publishLocalDelta: publishLocalDelta,
      publishDeviceDelta: publishDeviceDelta,
      isDeviceKey: isDeviceKey,
      collectDeviceScopedSettings: collectDeviceScopedSettings,
      applyDelta: applyDelta,
      refreshDeltas: refreshDeltas,
      softRefresh: softRefresh,
      backupProfileOffline: backupProfileOffline,
      restoreProfileOffline: restoreProfileOffline,
      updateSyncTimestamp: updateSyncTimestamp,
      getSyncTimestamp: getSyncTimestamp,
      clearSyncTimestamps: clearSyncTimestamps,
      resetDeviceOverlay: resetDeviceOverlay,
      getCachedProfiles: getCachedProfiles,
      quickSwitchProfile: quickSwitchProfile,
      syncProfile: syncProfile,
      renameProfile: renameProfile,
      refreshCacheFromTelegram: refreshCacheFromTelegram,
      getPluginRegistry: getPluginRegistry,
      addToPluginRegistry: addToPluginRegistry,
      removeFromPluginRegistry: removeFromPluginRegistry,
      callbacks: callbacks
    };

    function showReloadPrompt(onCancel) {
      Lampa.Modal.open({
        title: '',
        align: 'center',
        zIndex: 300,
        html: $('<div class="about">' + (Lampa.Lang.translate('plugins_need_reload') || 'Reboot required for changes to take effect') + '</div>'),
        buttons: [{
          name: Lampa.Lang.translate('settings_param_no') || 'No',
          onSelect: function onSelect() {
            Lampa.Modal.close();
            if (onCancel) onCancel();
          }
        }, {
          name: Lampa.Lang.translate('settings_param_yes') || 'Yes',
          onSelect: function onSelect() {
            window.location.reload();
          }
        }]
      });
    }

    function PluginManagerComponent(object) {
      var self = this;
      var scroll = null;
      var last = null;
      var plugins = object._plugins || [];
      var isActive = object._isActive || false;
      var profileMsgId = object._profileMsgId;
      var profileName = object._profileName || 'Unnamed';
      var originalData = object._originalData || null;

      self.create = function () {
        scroll = new Lampa.Scroll({
          mask: true,
          over: true
        });
        self.html = $('<div class="dblink-activity"></div>');
        scroll.render().addClass('dblink-scroll');
        self.html.append(scroll.render());
        scroll.onWheel = function (step) {
          if (!last) return;
          Navigator.move(step > 0 ? 'down' : 'up');
        };
        scroll.render().on('hover:focus', function (e) {
          last = e.target;
          scroll.update($(e.target), true);
        });
        scroll.render().on('hover:hover hover:touch', function (e) {
          last = e.target;
        });
        renderPluginList();
        return self.render();
      };
      self.render = function () {
        return self.html;
      };
      self.start = function () {
        Lampa.Controller.add('dblink_plugins', {

          toggle: function toggle() {
            Lampa.Controller.collectionSet(scroll.render());
            var focus = last && $(last).closest('body').length ? last : false;
            Lampa.Controller.collectionFocus(focus, scroll.render());
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            Navigator.move('down');
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          right: function right() {
            Navigator.move('right');
          },
          back: function back() {
            Lampa.Activity.backward();
          }
        });
        Lampa.Controller.toggle('dblink_plugins');
      };
      self.pause = function () {};
      self.stop = function () {};
      self.destroy = function () {
        if (self.__destroyed) return;
        self.__destroyed = true;
        try {
          $(scroll.body()).find('.gs-plugin-item, .gs-plugin-add').off();
        } catch (e) {}
        try {
          if (scroll) scroll.destroy();
        } catch (e) {}
        try {
          self.html.remove();
        } catch (e) {}
        last = null;
      };
      self.back = function () {
        Lampa.Activity.backward();
      };

      function renderPluginList() {
        scroll.clear();
        if (plugins.length === 0) {
          scroll.body().append('<div class="settings-param-title"><span>' + (Lampa.Lang.translate('dblink_plugins_empty') || 'No plugins') + '</span></div>');
        } else {
          plugins.forEach(function (plugin, idx) {
            scroll.body().append(renderPluginItem(plugin, idx));
          });
        }
        scroll.body().append(renderAddButton());
        bindItemEvents();
      }
      function renderPluginItem(plugin, idx) {
        var isOn = plugin.status === 1;
        return $('<div class="settings-folder selector gs-plugin-item" data-idx="' + idx + '">' + '<div class="settings-folder__icon">' + '<div class="gs-plugin-toggle ' + (isOn ? 'on' : 'off') + '">' + (isOn ? '●' : '○') + '</div>' + '</div>' + '<div class="settings-folder__name">' + '<div>' + escHtml(plugin.name || 'Plugin') + '</div>' + '<div class="settings-folder__sub">' + escHtml(truncateUrl(plugin.url)) + '</div>' + '</div>' + '</div>');
      }
      function renderAddButton() {
        return $('<div class="settings-folder selector gs-plugin-add">' + '<div class="settings-folder__icon">' + '<svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>' + '</div>' + '<div class="settings-folder__name">' + '<div>' + (Lampa.Lang.translate('dblink_plugins_add') || 'Add plugin') + '</div>' + '</div>' + '</div>');
      }

      function bindItemEvents() {
        scroll.render().find('.gs-plugin-item').on('hover:enter', function () {
          var idx = parseInt($(this).data('idx'), 10);
          if (plugins[idx]) showPluginMenu(plugins[idx], idx);
        });
        scroll.render().find('.gs-plugin-item').on('hover:long', function () {
          var idx = parseInt($(this).data('idx'), 10);
          if (plugins[idx]) doToggle(plugins[idx], idx);
        });
        scroll.render().find('.gs-plugin-add').on('hover:enter', function () {
          doAddPlugin();
        });
      }

      function showPluginMenu(plugin, idx) {
        if (!plugin) return;
        var isOn = plugin.status === 1;
        var prevController = Lampa.Controller.enabled().name;
        Lampa.Select.show({
          title: plugin.name || plugin.url,
          items: [{
            title: Lampa.Lang.translate(isOn ? 'dblink_plugins_toggle_off' : 'dblink_plugins_toggle_on') || (isOn ? 'Disable' : 'Enable'),
            _do: 'toggle'
          }, {
            title: Lampa.Lang.translate('dblink_plugins_edit_name') || 'Edit name',
            _do: 'edit_name'
          }, {
            title: Lampa.Lang.translate('dblink_plugins_edit_url') || 'Edit URL',
            _do: 'edit_url'
          }, {
            title: Lampa.Lang.translate('dblink_plugins_remove') || 'Remove',
            _do: 'remove'
          }, {
            title: Lampa.Lang.translate('dblink_cancel') || 'Cancel',
            _do: 'cancel'
          }],
          onBack: function onBack() {
            Lampa.Controller.toggle(prevController);
          },
          onSelect: function onSelect(item) {
            if (item._do === 'toggle') {
              doToggle(plugin, idx);
            } else if (item._do === 'edit_name') {
              doEditPluginName(plugin, idx);
            } else if (item._do === 'edit_url') {
              doEditPluginUrl(plugin, idx);
            } else if (item._do === 'remove') {
              doRemoveConfirm(plugin, idx);
            } else {
              Lampa.Controller.toggle(prevController);
            }
          }
        });
      }
      function doEditPluginName(plugin, idx) {
        input({
          title: Lampa.Lang.translate('dblink_plugins_edit_name') || 'Plugin name',
          value: plugin.name || '',
          onSubmit: function onSubmit(newName) {
            if (!newName || !newName.trim()) return;
            plugin.name = newName.trim();
            plugins[idx] = plugin;
            if (isActive) {
              var live = collectPlugins();
              live.forEach(function (p) {
                if (p.url === plugin.url) p.name = plugin.name;
              });
              Lampa.Storage.set('plugins', live);
              Lampa.Noty.show(Lampa.Lang.translate('dblink_plugins_edited') || 'Plugin updated');
            }
            if (!isActive) {
              saveSnapshot(function () {
                reRender();
              });
              return;
            }
            reRender();
            showReloadPrompt();
          }
        });
      }
      function doEditPluginUrl(plugin, idx) {
        input({
          title: Lampa.Lang.translate('dblink_plugins_edit_url') || 'Plugin URL',
          value: plugin.url || '',
          onSubmit: function onSubmit(newUrl) {
            if (!newUrl || !newUrl.trim()) return;
            newUrl = newUrl.trim();
            if (!newUrl.match(/^https?:\/\/.+/i)) {
              Lampa.Noty.show('Invalid URL');
              return;
            }
            var oldUrl = plugin.url;
            plugin.url = newUrl;
            plugins[idx] = plugin;
            if (isActive) {
              var live = collectPlugins();

              live.forEach(function (p) {
                if (p.url === oldUrl) {
                  p.url = newUrl;
                  p.name = plugin.name;
                }
              });
              Lampa.Storage.set('plugins', live);
              publishDelta('toggle', {
                url: newUrl,
                name: plugin.name,
                status: plugin.status
              });
              Lampa.Noty.show(Lampa.Lang.translate('dblink_plugins_edited') || 'Plugin updated');
            }
            if (!isActive) {
              saveSnapshot(function () {
                reRender();
              });
              return;
            }
            reRender();
            showReloadPrompt();
          }
        });
      }

      function doToggle(plugin, idx) {
        plugin.status = plugin.status === 1 ? 0 : 1;
        plugins[idx] = plugin;
        if (isActive) {
          var live = collectPlugins();
          live.forEach(function (p) {
            if (p.url === plugin.url) p.status = plugin.status;
          });
          Lampa.Storage.set('plugins', live);
          publishDelta('toggle', {
            url: plugin.url,
            name: plugin.name,
            status: plugin.status
          });
          Lampa.Noty.show((plugin.name || 'Plugin') + ': ' + (plugin.status === 1 ? 'enabled' : 'disabled'));
        }
        if (!isActive) {
          saveSnapshot(function () {
            reRender();
          });
          return;
        }
        reRender();

        showReloadPrompt();
      }
      function doAddPlugin() {
        input({
          title: Lampa.Lang.translate('dblink_plugins_add_url') || 'Plugin URL (.js)',
          align: 'center',
          onCancel: function onCancel() {
            reRender();
          },
          onSubmit: function onSubmit(url) {
            if (!url) {
              reRender();
              return;
            }
            url = url.trim();
            if (!url.match(/^https?:\/\/.+/i)) {
              Lampa.Noty.show('Invalid URL');
              reRender();
              return;
            }
            if (plugins.some(function (p) {
              return p.url === url;
            })) {
              Lampa.Noty.show(Lampa.Lang.translate('dblink_plugins_already_installed') || 'Already installed');
              reRender();
              return;
            }
            var guessedName = extractNameFromUrl(url);
            input({
              title: Lampa.Lang.translate('dblink_plugins_name') || 'Plugin name',
              align: 'center',
              value: guessedName,
              onSubmit: function onSubmit(name) {
                var newPlugin = {
                  url: url,
                  name: name && name.trim() || guessedName,
                  status: 1,
                  custom: {}
                };
                plugins.push(newPlugin);
                if (isActive) {
                  var live = collectPlugins();
                  live.push(newPlugin);
                  Lampa.Storage.set('plugins', live);
                  publishDelta('add', newPlugin);
                  Lampa.Noty.show(Lampa.Lang.translate('dblink_plugins_added') || 'Plugin added');
                  reRender();

                  showReloadPrompt();
                } else {
                  saveSnapshot(function () {
                    reRender();
                  });
                }
              }
            });
          }
        });
      }
      function doRemoveConfirm(plugin, idx) {
        var prevController = Lampa.Controller.enabled().name;
        Lampa.Select.show({
          title: Lampa.Lang.translate('dblink_plugins_remove') || 'Remove plugin',
          items: [{
            title: '"' + (plugin.name || plugin.url) + '" - ' + (Lampa.Lang.translate('dblink_plugins_remove_confirm') || 'remove?'),
            noenter: true
          }, {
            title: Lampa.Lang.translate('dblink_plugins_remove') || 'Remove',
            _do: 'remove'
          }, {
            title: Lampa.Lang.translate('dblink_cancel') || 'Cancel',
            _do: 'cancel'
          }],
          onBack: function onBack() {
            Lampa.Controller.toggle(prevController);
          },
          onSelect: function onSelect(item) {
            if (item._do === 'remove') {
              plugins.splice(idx, 1);
              if (isActive) {
                var live = collectPlugins().filter(function (p) {
                  return p.url !== plugin.url;
                });
                Lampa.Storage.set('plugins', live);

                if (window.Lampa && Lampa.Plugins) {
                  try {
                    Lampa.Plugins.init();
                  } catch (e) {}
                }
                publishDelta('remove', {
                  url: plugin.url,
                  name: plugin.name,
                  status: plugin.status
                });
                Lampa.Noty.show(Lampa.Lang.translate('dblink_plugins_removed') || 'Plugin removed');
                reRender();

                showReloadPrompt();
              } else {
                saveSnapshot(function () {
                  reRender();
                });
              }
            } else {
              Lampa.Controller.toggle(prevController);
            }
          }
        });
      }

      function saveSnapshot(onDone) {
        var client = DBLinkClient.getInstance();
        var channelId = getChannelId();
        var topicId = Lampa.Storage.get('dblink_profiles_topic', '');
        if (!client.isConnected() || !channelId || !topicId) {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_not_connected') || 'Not connected');
          if (onDone) onDone();
          return;
        }
        var now = Math.floor(Date.now() / 1000);
        var fileData = buildFileData({
          name: profileName,
          plugins: deepClone(plugins),
          bookmarks: originalData && originalData.bookmarks || undefined,
          timeline: originalData && originalData.timeline || undefined,
          settings: originalData && originalData.settings || undefined,
          device_overrides: originalData && originalData.device_overrides || undefined
        });
        var caption = buildCaption({
          name: profileName,
          updated: now
        });
        var fileName = buildProfileFileName(profileName, now);
        Lampa.Noty.show(Lampa.Lang.translate('dblink_plugins_saving') || 'Saving…');
        client.sendFile(channelId, topicId, JSON.stringify(fileData, null, 2), fileName, caption).then(function (newMsgId) {
          if (newMsgId) {
            client.deleteMessage(channelId, profileMsgId)["catch"](function () {});
            var activeId = Lampa.Storage.get('dblink_active_profile', '');
            if (String(activeId) === String(profileMsgId)) {
              Lampa.Storage.set('dblink_active_profile', String(newMsgId));
            }
            profileMsgId = newMsgId;
            Lampa.Noty.show(Lampa.Lang.translate('dblink_plugins_saved') || 'Saved');
          } else {
            Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_failed') || 'Save failed');
          }
          if (onDone) onDone();
        })["catch"](function () {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_failed') || 'Save failed');
          if (onDone) onDone();
        });
      }

      function publishDelta(action, plugin) {
        var syncTopicId = Lampa.Storage.get('dblink_profiles_sync_topic', '');
        if (!syncTopicId) return;
        Profiles.publishLocalDelta(syncTopicId, 'plugin_change', {
          action: action,
          plugin: plugin
        });
      }

      function reRender() {
        renderPluginList();
      }
    }

    function loadSnapshotThenPush(profileMsgId, profileName) {
      var client = DBLinkClient.getInstance();
      var channelId = parseInt(Lampa.Storage.get('dblink_channel_id', ''), 10);
      var topicId = Lampa.Storage.get('dblink_profiles_topic', '');
      if (!channelId || !topicId) {
        Lampa.Noty.show('Sync channel not ready');
        return;
      }
      Lampa.Noty.show(Lampa.Lang.translate('dblink_loading') || 'Loading…');
      client.getMessages(channelId, topicId, 50).then(function (msgs) {
        var target = null;
        msgs.forEach(function (m) {
          if (String(m.id) === String(profileMsgId)) target = m;
        });
        if (!target) {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_profile_not_found') || 'Profile not found');
          return;
        }
        return client.downloadMessageFile(target).then(function (fileData) {
          if (!fileData) {
            Lampa.Noty.show('Could not load profile data');
            return;
          }
          try {
            var data = JSON.parse(fileData);
            setTimeout(function () {
              Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('dblink_plugins_title').replace('{name}', profileName),
                component: 'dblink_plugin_manager',
                page: 1,
                _plugins: deepClone(data.plugins || []),
                _isActive: false,
                _profileMsgId: profileMsgId,
                _profileName: profileName,
                _originalData: data
              });
            }, 200);
          } catch (e) {
            Lampa.Noty.show('Invalid profile data');
          }
        });
      })["catch"](function () {
        Lampa.Noty.show('Could not load profile data');
      });
    }

    var PluginManager = {
      open: function open(profileMsgId, profileName, isActive) {
        if (isActive) {
          var plugins = deepClone(collectPlugins());
          setTimeout(function () {
            Lampa.Activity.push({
              url: '',
              title: Lampa.Lang.translate('dblink_plugins_title').replace('{name}', profileName || 'Unnamed'),
              component: 'dblink_plugin_manager',
              page: 1,
              _plugins: plugins,
              _isActive: true,
              _profileMsgId: profileMsgId,
              _profileName: profileName || 'Unnamed'
            });
          }, 200);
        } else {
          if (!DBLinkClient.getInstance().isConnected()) {
            Lampa.Noty.show(Lampa.Lang.translate('dblink_not_connected'));
            return;
          }
          loadSnapshotThenPush(profileMsgId, profileName || 'Unnamed');
        }
      }
    };

    function truncateUrl(url) {
      if (!url) return '';
      try {
        var u = new URL(url);
        var host = u.hostname;
        var path = u.pathname.split('/').pop() || '';
        return host + '/…/' + path;
      } catch (e) {
        return url.length > 50 ? url.slice(0, 47) + '…' : url;
      }
    }

    function initSettings() {
      var SettingsApi = Lampa.SettingsApi || Lampa.Settings;
      if (!SettingsApi || !SettingsApi.addComponent) return;

      Lampa.Template.add('settings_dblink_connection', '<div></div>');
      Lampa.Template.add('settings_dblink_sync_page', '<div></div>');
      Lampa.Template.add('settings_dblink_tools', '<div></div>');

      SettingsApi.addComponent({
        component: 'dblink',
        name: Lampa.Lang.translate('dblink_title'),
        before: 'interface',
        icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' + '<ellipse cx="12" cy="5" rx="8" ry="3" fill="currentColor"/>' + '<path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5" stroke="currentColor" stroke-width="1.7"/>' + '<path d="M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" stroke="currentColor" stroke-width="1.7"/>' + '</svg>'
      });

      SettingsApi.addParam({
        component: 'dblink',
        param: {
          name: 'dblink_open_sync',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_section_sync')
        },
        onChange: function onChange() {
          Lampa.Settings.create('dblink_sync_page', {
            onBack: function onBack() {
              Lampa.Settings.create('dblink');
            }
          });
        }
      });

      SettingsApi.addParam({
        component: 'dblink',
        param: {
          name: 'dblink_open_tools',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_section_tools')
        },
        onChange: function onChange() {
          Lampa.Settings.create('dblink_tools', {
            onBack: function onBack() {
              Lampa.Settings.create('dblink');
            }
          });
        }
      });

      SettingsApi.addParam({
        component: 'dblink',
        param: {
          name: 'dblink_open_about',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_section_about')
        },
        onChange: function onChange() {
          var html = '<div style="padding:1em">' + '<p>' + Lampa.Lang.translate('dblink_about_description') + '</p>' + '<p><span style="opacity:0.5">' + Lampa.Lang.translate('dblink_about_version') + ':</span> ' + VERSION + '</p>' + '<p><span style="opacity:0.5">' + Lampa.Lang.translate('dblink_about_author') + ':</span>' + Lampa.Lang.translate('dblink_about_link_author') + '</p>' + '</div>';
          var enabledCtrl = Lampa.Controller.enabled().name;
          Lampa.Select.show({
            title: Lampa.Lang.translate('dblink_settings_about'),
            items: [{
              title: html,
              disabled: true
            }],
            onSelect: function onSelect() {
              Lampa.Controller.toggle(enabledCtrl);
            },
            onBack: function onBack() {
              Lampa.Controller.toggle(enabledCtrl);
            }
          });
        }
      });

      SettingsApi.addParam({
        component: 'dblink',
        param: {
          name: 'dblink_open_connection',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_section_connection')
        },
        onChange: function onChange() {
          Lampa.Settings.create('dblink_connection', {
            onBack: function onBack() {
              Lampa.Settings.create('dblink');
            }
          });
        }
      });

      SettingsApi.addParam({
        component: 'dblink_connection',
        param: {
          name: 'dblink_supabase_url',
          type: 'input',
          "default": '',
          values: '',
          placeholder: 'https://xxxx.supabase.co'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_supa_url'),
          description: Lampa.Lang.translate('dblink_settings_supa_url_desc')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set('dblink_supabase_url', String(value || '').trim().replace(/\/+$/, ''));
        }
      });
      SettingsApi.addParam({
        component: 'dblink_connection',
        param: {
          name: 'dblink_supabase_key',
          type: 'input',
          "default": '',
          values: '',
          placeholder: 'sb_publishable_...'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_supa_key'),
          description: Lampa.Lang.translate('dblink_settings_supa_key_desc')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set('dblink_supabase_key', String(value || '').trim());
        }
      });
      SettingsApi.addParam({
        component: 'dblink_connection',
        param: {
          name: 'dblink_test_conn',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_test'),
          description: Lampa.Lang.translate('dblink_settings_test_desc')
        },
        onChange: function onChange() {
          var client = DBLinkClient.getInstance();
          if (!client.hasCredentials()) {
            Lampa.Noty.show(Lampa.Lang.translate('dblink_error_no_creds'));
            return;
          }
          Lampa.Noty.show(Lampa.Lang.translate('dblink_test_checking'));
          client.reconnect().then(function () {
            Lampa.Noty.show(Lampa.Lang.translate('dblink_test_ok'));
            autoEnsureSyncChannel();
            try { Profiles.refreshCacheFromTelegram(); } catch (e) {}
          })["catch"](function (err) {
            if (err && err.needSetup) {
              showSchemaSetupModal();
              return;
            }
            Lampa.Noty.show(Lampa.Lang.translate('dblink_test_fail') + ': ' + (err && err.message || ''));
          });
        }
      });
      SettingsApi.addParam({
        component: 'dblink_connection',
        param: {
          name: 'dblink_disconnect',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_disconnect'),
          description: Lampa.Lang.translate('dblink_settings_disconnect_desc')
        },
        onChange: function onChange() {
          var client = DBLinkClient.getInstance();
          var enabledCtrl = Lampa.Controller.enabled().name;
          Lampa.Modal.open({
            title: Lampa.Lang.translate('dblink_settings_disconnect'),
            html: $('<div style="padding: 1em">' + Lampa.Lang.translate('dblink_settings_disconnect_confirm') + '</div>'),
            buttons: [{
              name: Lampa.Lang.translate('dblink_settings_disconnect'),
              onSelect: function onSelect() {
                client.logout();
                Lampa.Modal.close();
                Lampa.Settings.update();
                Lampa.Controller.toggle(enabledCtrl);
              }
            }, {
              name: Lampa.Lang.translate('dblink_cancel'),
              onSelect: function onSelect() {
                Lampa.Modal.close();
                Lampa.Controller.toggle(enabledCtrl);
              }
            }]
          });
        }
      });

      SettingsApi.addParam({
        component: 'dblink_sync_page',
        param: {
          name: 'dblink_sync_enabled',
          type: 'trigger',
          "default": false
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_sync_enabled')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set('dblink_sync_enabled', value);
        }
      });
      SettingsApi.addParam({
        component: 'dblink_sync_page',
        param: {
          name: 'dblink_heartbeat',
          type: 'trigger',
          "default": false
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_sync_heartbeat')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set('dblink_heartbeat', value);
          var client = DBLinkClient.getInstance();
          if (value) {
            var channelId = Lampa.Storage.get('dblink_channel_id', '');
            var syncLogTopicId = Lampa.Storage.get('dblink_sync_log_topic', '');
            if (channelId && syncLogTopicId && client.isConnected()) {
              client.startHeartbeat(channelId, syncLogTopicId);
            }
          } else {
            client.stopHeartbeat();
          }
        }
      });
      SettingsApi.addParam({
        component: 'dblink_sync_page',
        param: {
          name: 'dblink_broadcast',
          type: 'trigger',
          "default": false
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_sync_broadcast')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set('dblink_broadcast', value);
        }
      });
      SettingsApi.addParam({
        component: 'dblink_sync_page',
        param: {
          name: 'dblink_sync_timeout',
          type: 'select',
          values: {
            5: '5',
            10: '10',
            30: '30',
            60: '60'
          },
          "default": '10'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_timeout'),
          description: Lampa.Lang.translate('dblink_settings_timeout_desc')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set('dblink_sync_timeout', value);
        }
      });
      SettingsApi.addParam({
        component: 'dblink_sync_page',
        param: {
          name: 'dblink_poll_interval',
          type: 'select',
          values: {
            5: '5',
            10: '10',
            30: '30'
          },
          "default": '10'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_poll_interval'),
          description: Lampa.Lang.translate('dblink_settings_poll_interval_desc')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set('dblink_poll_interval', value);
        }
      });

      SettingsApi.addParam({
        component: 'dblink_tools',
        param: {
          name: 'dblink_import_cub',
          type: 'button'
        },
        field: {
          name: 'Import from Cub'
        },
        description: 'Migrate Cub profiles to DBLink',
        onChange: function onChange() {
          var profilesTopicId = Lampa.Storage.get('dblink_profiles_topic', '');
          if (!profilesTopicId) {
            Lampa.Noty.show('Sync channel not ready');
            return;
          }
          startMigration(profilesTopicId);
        }
      });

      SettingsApi.addParam({
        component: 'dblink_tools',
        param: {
          name: 'dblink_avatar_style',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('dblink_settings_avatar_style'),
          description: Lampa.Lang.translate('dblink_settings_avatar_style_desc')
        },
        onRender: function onRender(item) {
          var style = Lampa.Storage.get('dblink_avatar_style', 'fun-emoji');
          var label = style ? style.charAt(0).toUpperCase() + style.slice(1) : Lampa.Lang.translate('dblink_avatar_none');
          item.find('.settings-param__name').text(Lampa.Lang.translate('dblink_settings_avatar_style'));
          if (!item.find('.dblink-avatar-preview').length) {
            item.find('.settings-param__name').after('<span class="dblink-avatar-preview" style="margin-left:0.5em;opacity:0.6"></span>');
          }
          item.find('.dblink-avatar-preview').text(label);
        },
        onChange: function onChange() {
          openAvatarStyleSelect();
        }
      });
      SettingsApi.addParam({
        component: 'dblink_tools',
        param: {
          name: 'dblink_manage_plugins',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('dblink_plugins_manage')
        },
        onRender: function onRender(item) {
          var activeId = Lampa.Storage.get('dblink_active_profile', '');
          if (!activeId) item.addClass('hide');
        },
        onChange: function onChange() {
          var activeId = Lampa.Storage.get('dblink_active_profile', '');
          var activeName = Lampa.Storage.get('dblink_active_profile_name', '');
          if (!activeId) {
            Lampa.Noty.show('No active profile');
            return;
          }
          PluginManager.open(activeId, activeName || 'Active', true);
        }
      });

    }
    function openAvatarStyleSelect() {
      var current = Lampa.Storage.get('dblink_avatar_style', 'fun-emoji');
      var enabledCtrl = Lampa.Controller.enabled().name;
      var items = [];
      var hasStoredStyle = Lampa.Storage.get('dblink_avatar_style', null) !== null;

      items.push({
        title: Lampa.Lang.translate('dblink_avatar_none'),
        selected: !hasStoredStyle
      });
      DICE_BEAR_STYLES.forEach(function (s) {
        var previewUrl = DICE_BEAR_BASE + s + '/svg?seed=Lampa';
        var iconHtml = '<img src="' + previewUrl + '" style="width:2em;height:2em;border-radius:50%;object-fit:cover;">';
        items.push({
          title: s,
          template: 'selectbox_icon',
          icon: iconHtml,
          selected: s === current
        });
      });
      Lampa.Select.show({
        title: Lampa.Lang.translate('dblink_settings_avatar_style'),
        items: items,
        onBack: function onBack() {
          Lampa.Controller.toggle(enabledCtrl);
        },
        onSelect: function onSelect(item) {
          var selectedStyle = item.title === Lampa.Lang.translate('dblink_avatar_none') ? '' : item.title;
          Lampa.Storage.set('dblink_avatar_style', selectedStyle);
          Lampa.Controller.toggle(enabledCtrl);
          Lampa.Settings.create('dblink_tools', {
            onBack: function onBack() {
              Lampa.Settings.create('dblink');
            }
          });
        }
      });
    }

    function discoverDevices() {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return Promise.resolve([]);
      var channelId = Lampa.Storage.get(STORAGE_KEYS.CHANNEL_ID, '');
      var syncLogTopicId = Lampa.Storage.get(STORAGE_KEYS.SYNC_LOG_TOPIC, '');
      if (!channelId || !syncLogTopicId) return Promise.resolve([]);
      return client.getOnlineDevices(channelId, syncLogTopicId);
    }

    function sendOpenCard(deviceId, cardData) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;
      var channelId = Lampa.Storage.get(STORAGE_KEYS.CHANNEL_ID, '');
      var remoteCmdTopicId = Lampa.Storage.get(STORAGE_KEYS.REMOTE_CMD_TOPIC, '');
      if (!channelId || !remoteCmdTopicId) return;
      client.publish(channelId, remoteCmdTopicId, 'open_card', {
        card: cardData
      }, deviceId);
    }
    function sendPlayVideo(deviceId, mediaData) {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;
      var channelId = Lampa.Storage.get(STORAGE_KEYS.CHANNEL_ID, '');
      var remoteCmdTopicId = Lampa.Storage.get(STORAGE_KEYS.REMOTE_CMD_TOPIC, '');
      if (!channelId || !remoteCmdTopicId) return;
      client.publish(channelId, remoteCmdTopicId, 'play_video', {
        media: mediaData
      }, deviceId);
    }

    function showDevicePicker(options) {

      var enabledCtrl = Lampa.Controller.enabled().name;
      discoverDevices().then(function (devices) {
        var myId = getDeviceId();

        devices = devices.filter(function (d) {
          return d.device_id !== myId;
        });
        if (devices.length === 0) {
          Lampa.Noty.show('No other devices online');
          if (options.onCancel) options.onCancel();
          return;
        }
        var items = devices.map(function (d) {
          return {
            title: d.device_name || 'Unknown',
            _device: d
          };
        });
        items.push({
          title: Lampa.Lang.translate('dblink_cancel') || 'Cancel',
          _cancel: true
        });
        Lampa.Select.show({
          title: options.title || Lampa.Lang.translate('dblink_select_device'),
          items: items,
          onBack: function onBack() {
            Lampa.Controller.toggle(enabledCtrl);
            if (options.onCancel) options.onCancel();
          },
          onSelect: function onSelect(item) {
            Lampa.Controller.toggle(enabledCtrl);
            if (item._cancel) {
              if (options.onCancel) options.onCancel();
              return;
            }
            if (options.onSelect) options.onSelect(item._device);
          }
        });
      })["catch"](function () {
        Lampa.Noty.show(Lampa.Lang.translate('dblink_discover_fail'));
        if (options.onCancel) options.onCancel();
      });
    }

    function setupContextMenu() {
      var manifest = {
        type: 'video',
        version: VERSION,
        name: Lampa.Lang.translate('dblink_open_on_device'),
        description: '',
        onContextMenu: function onContextMenu(object) {
          var client = DBLinkClient.getInstance();
          if (!client.isConnected()) return null;
          return {
            name: Lampa.Lang.translate('dblink_open_on_device'),
            description: ''
          };
        },
        onContextLauch: function onContextLauch(data) {
          var card = Lampa.Utils.clearCard ? Lampa.Utils.clearCard(JSON.parse(JSON.stringify(data))) : data;
          showDevicePicker({
            title: Lampa.Lang.translate('dblink_open_on_device'),
            onSelect: function onSelect(device) {
              sendOpenCard(device.device_id, card);
              Lampa.Noty.show(Lampa.Lang.translate('dblink_sent_to').replace('{device}', device.device_name || 'device'));
            }
          });
        }
      };
      Lampa.Manifest.plugins = manifest;
    }

    function setupPlayerPanel() {
      Lampa.PlayerPanel.listener.follow('share', function (e) {
        var client = DBLinkClient.getInstance();
        if (!client.isConnected()) return;
        showDevicePicker({
          title: Lampa.Lang.translate('dblink_play_on_device'),
          onSelect: function onSelect(device) {
            var playdata = Lampa.Player.playdata();
            if (playdata) {
              sendPlayVideo(device.device_id, playdata);
              Lampa.Noty.show(Lampa.Lang.translate('dblink_sent_to').replace('{device}', device.device_name || 'device'));
            }
          }
        });
      });
    }

    function addBroadcastButton() {
      $('.open--broadcast').remove();
      var $broadcastBtn = $('<div class="head__action selector open--broadcast" style="display:none">' + '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' + '<path d="M1.04272 7.22978V6.76392C1.04272 4.00249 3.2813 1.76392 6.04272 1.76392H17.7877C20.5491 1.76392 22.7877 4.00249 22.7877 6.76392V17.2999C22.7877 20.0613 20.5491 22.2999 17.7877 22.2999H15.8387" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"></path>' + '<circle cx="6.69829" cy="16.6443" r="5.65556" fill="currentColor"></circle>' + '</svg>' + '</div>');
      $('.head__action.open--search').after($broadcastBtn);
      function updateVisibility() {
        var client = DBLinkClient.getInstance();
        var active = Lampa.Activity.active();
        if (client.isConnected() && active && active.component === 'full') {
          $broadcastBtn.show();
        } else {
          $broadcastBtn.hide();
        }
      }
      updateVisibility();
      Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'start') updateVisibility();
      });
      Lampa.Listener.follow('lws_connect', function (e) {
        updateVisibility();
      });
      $broadcastBtn.on('hover:enter hover:click hover:touch', function () {
        var card = Lampa.Activity.extractObject ? Lampa.Activity.extractObject(Lampa.Activity.active()) : null;
        if (!card) {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_nothing_share'));
          return;
        }
        showDevicePicker({
          title: Lampa.Lang.translate('dblink_open_on_device'),
          onSelect: function onSelect(device) {
            sendOpenCard(device.device_id, card);
            Lampa.Noty.show(Lampa.Lang.translate('dblink_sent_to').replace('{device}', device.device_name || 'device'));
          }
        });
      });
    }

    function setupBroadcast() {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) return;
      setupContextMenu();
      setupPlayerPanel();
      addBroadcastButton();
    }
    var Broadcast = {
      discoverDevices: discoverDevices,
      showDevicePicker: showDevicePicker,
      sendOpenCard: sendOpenCard,
      sendPlayVideo: sendPlayVideo,
      setupContextMenu: setupContextMenu,
      setupPlayerPanel: setupPlayerPanel,
      addBroadcastButton: addBroadcastButton,
      setupBroadcast: setupBroadcast
    };

    var DEVICE_KEY_PREFIXES = ['player', 'player_', 'subtitles_', 'video_quality_', 'navigation_', 'interface_', 'background_', 'glass_', 'card_', 'poster_', 'animation_', 'scroll_', 'request_caching', 'cache_images', 'mask', 'light_version', 'menu_always', 'black_style', 'dblink_heartbeat', 'dblink_broadcast'];

    var CACHE_PATTERNS = [/_cache$/, /_line_cache/, /_ts$/, /_line$/];

    var EXCLUDE_KEYS_SET = {
      'GramJs:apiCache': true
    };

    function categorize(key) {

      if (key.indexOf('dblink_') === 0) {
        var isDevice = DEVICE_KEY_PREFIXES.some(function (p) {
          return key === p || key.indexOf(p) === 0;
        });
        if (!isDevice) return 'dblink_meta';
        return 'device_state';
      }

      if (EXCLUDE_KEYS_SET[key]) return 'cache_exclude';

      for (var i = 0; i < CACHE_PATTERNS.length; i++) {
        if (CACHE_PATTERNS[i].test(key)) return 'cache_exclude';
      }

      for (var j = 0; j < DEVICE_KEY_PREFIXES.length; j++) {
        var p = DEVICE_KEY_PREFIXES[j];
        if (key === p || key.indexOf(p) === 0) return 'device_state';
      }

      return 'core';
    }

    function buildManifest(meta, chunks) {
      var totalKeys = 0;
      var totalBytes = 0;
      var chunkList = (chunks || []).map(function (ch) {
        totalKeys += (ch.keys || []).length;
        totalBytes += ch.raw_bytes || 0;
        return {
          id: ch.id,
          category: ch.category,
          keys: ch.keys || [],
          raw_bytes: ch.raw_bytes || 0,
          file_name: ch.file_name,
          telegram_msg_id: ch.telegram_msg_id || 0
        };
      });
      return {
        meta: {
          type: 'dblink_backup',
          version: 1,
          created_at: meta.created_at || Math.floor(Date.now() / 1000),
          device_id: meta.device_id || '',
          device_name: meta.device_name || 'Unknown'
        },
        totals: {
          total_chunks: chunkList.length,
          total_keys: totalKeys,
          total_bytes: totalBytes
        },
        chunks: chunkList
      };
    }

    function validateManifest(m) {
      if (!m || _typeof(m) !== 'object') throw new Error('Manifest is not an object');
      if (m.meta && m.meta.type !== 'dblink_backup') throw new Error('Not a DBLink backup manifest');
      if (!m.meta || !m.meta.created_at || !m.meta.device_id) throw new Error('Manifest missing required meta fields');
      if (!m.chunks || !Array.isArray(m.chunks) || !m.chunks.length) throw new Error('Manifest has no chunks');
      if (!m.totals || typeof m.totals.total_chunks !== 'number') throw new Error('Manifest missing totals');
      return true;
    }

    var CHUNK_SIZE = 64 * 1024;

    function collectCategorized() {
      var core = {};
      var deviceState = {};
      var excludedCount = 0;
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key) continue;
        var cat = categorize(key);
        if (cat === 'core') {
          core[key] = localStorage.getItem(key);
        } else if (cat === 'device_state') {
          deviceState[key] = localStorage.getItem(key);
        } else {
          excludedCount++;
        }
      }
      return {
        core: core,
        device_state: deviceState,
        excluded: excludedCount
      };
    }

    function buildChunks(collected, chunkSize) {
      if (chunkSize === undefined) chunkSize = CHUNK_SIZE;
      var chunks = [];
      var chunkId = 0;
      function nextChunkId() {
        var s = String(chunkId);
        while (s.length < 3) s = '0' + s;
        chunkId++;
        return 'chunk_' + s;
      }
      var categories = ['core', 'device_state'];
      for (var ci = 0; ci < categories.length; ci++) {
        var category = categories[ci];
        var keys = collected[category];
        if (!keys) continue;
        var keyEntries = Object.keys(keys);
        if (!keyEntries.length) continue;
        var currentChunk = {
          keys: {}
        };
        var currentSize = 2;

        for (var ki = 0; ki < keyEntries.length; ki++) {
          var key = keyEntries[ki];
          var value = keys[key];

          var estimatedSize = JSON.stringify(key).length + 2 + value.length;
          if (ki > 0) estimatedSize += 1;

          if (estimatedSize > chunkSize) {

            if (Object.keys(currentChunk.keys).length > 0) {
              chunks.push(finalizeChunk(currentChunk, category, nextChunkId()));
              currentChunk = {
                keys: {}
              };
              currentSize = 2;
            }

            var bigChunk = {
              keys: {}
            };
            bigChunk.keys[key] = value;
            chunks.push(finalizeChunk(bigChunk, category, nextChunkId()));
            currentSize = 2;
            continue;
          }

          if (currentSize + estimatedSize > chunkSize && Object.keys(currentChunk.keys).length > 0) {
            chunks.push(finalizeChunk(currentChunk, category, nextChunkId()));
            currentChunk = {
              keys: {}
            };
            currentSize = 2;
          }
          currentChunk.keys[key] = value;
          currentSize += estimatedSize;
        }

        if (Object.keys(currentChunk.keys).length > 0) {
          chunks.push(finalizeChunk(currentChunk, category, nextChunkId()));
        }
      }
      return chunks;
    }
    function finalizeChunk(chunk, category, id) {
      var data = {
        category: category,
        keys: chunk.keys || {}
      };
      return {
        id: id,
        category: category,
        keys: Object.keys(data.keys),
        keysData: data.keys,

        raw_bytes: JSON.stringify(data).length,
        file_name: id + '.json'
      };
    }

    function buildExportPayload(collected, meta, chunkSize) {
      var chunks = buildChunks(collected, chunkSize);
      var now = Math.floor(Date.now() / 1000);
      var backupName = 'backup_' + now;
      var manifest = buildManifest({
        created_at: now,
        device_id: meta.device_id,
        device_name: meta.device_name
      }, chunks.map(function (ch) {
        return {
          id: ch.id,
          category: ch.category,
          keys: ch.keys,
          raw_bytes: ch.raw_bytes,
          file_name: backupName + '/' + ch.file_name
        };
      }));
      return {
        chunks: chunks,
        manifest: manifest,
        backupName: backupName
      };
    }

    function listBackupSessions(c, ch, bt) {
      return c.getBackupFiles(ch, bt, 50).then(function (files) {
        var sessions = {};
        files.forEach(function (f) {
          var m = f.fileName.match(/^backup_(\d+)\/manifest\.json$/);
          if (!m) return;
          var ts = parseInt(m[1], 10);
          var isFinal = f.fileName.indexOf('_final') >= 0;

          var deviceInfo = '';
          try {
            if (f.text) {
              var caption = JSON.parse(f.text);
              if (caption.device_name) deviceInfo = caption.device_name;
            }
          } catch (e) {}

          if (!sessions[ts] || isFinal) {
            sessions[ts] = {
              ts: ts,
              label: formatTimestamp(ts),
              deviceInfo: deviceInfo,
              manifestFile: f,
              files: files
            };
          }
        });
        return Object.keys(sessions).map(function (k) {
          return sessions[k];
        }).sort(function (a, b) {
          return b.ts - a.ts;
        });
      });
    }

    function downloadManifest(c, session) {
      return c.downloadFile(session.manifestFile).then(function (jsonStr) {
        if (!jsonStr) throw new Error('Failed to download manifest');
        var manifest = JSON.parse(jsonStr);
        validateManifest(manifest);
        return manifest;
      });
    }

    function findChunkFiles(session, manifest) {
      var results = [];
      manifest.chunks.forEach(function (ch) {

        var expectedName = ch.file_name;
        var found = null;
        for (var i = 0; i < session.files.length; i++) {
          if (session.files[i].fileName === expectedName) {
            found = session.files[i];
            break;
          }
        }
        if (found) {
          results.push({
            file: found,
            chunkMeta: ch
          });
        } else {
          console.warn('DBLink', 'Chunk not found:', expectedName);
        }
      });
      return results;
    }

    function parseChunk(jsonStr) {
      var data = JSON.parse(jsonStr);
      if (!data || !data.keys || _typeof(data.keys) !== 'object') {
        throw new Error('Invalid chunk format');
      }
      return data;
    }

    function formatTimestamp(unixTs) {
      try {
        var pad = function pad(n) {
          return n < 10 ? '0' + n : String(n);
        };
        var d = new Date(unixTs * 1000);
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      } catch (e) {
        return String(unixTs);
      }
    }

    var STORAGE_CHANNEL_ID = STORAGE_KEYS.CHANNEL_ID;
    var STORAGE_SYNC_LOG_TOPIC = STORAGE_KEYS.SYNC_LOG_TOPIC;
    var STORAGE_PROFILES_TOPIC = STORAGE_KEYS.PROFILES_TOPIC;
    var STORAGE_PROFILES_SYNC_TOPIC = STORAGE_KEYS.PROFILES_SYNC;
    var STORAGE_BACKUP_TOPIC = STORAGE_KEYS.BACKUP_TOPIC;
    function Hub () {
      var refreshTimer = null;
      var currentChannelId = null;
      var currentProfilesTopicId = null;
      var self = this;
      var scroll = null;
      var last = null;
      var activeTab = 'profiles';
      var _initializing = false;
      var _profilesSig = null;
      var TABS = ['profiles', 'devices', 'plugins'];
      var tabIdx = 0;

      self.create = function () {
        scroll = new Lampa.Scroll({
          mask: true,
          over: true
        });
        scroll.render().addClass('dblink-scroll');

        scroll.onWheel = function (step) {
          if (!last) return;
          Navigator.move(step > 0 ? 'down' : 'up');
        };

        self.html = $('<div class="dblink-activity"></div>');
        self.html.append(scroll.render());

        _initializing = true;
        var body = scroll.body(true);
        body.innerHTML = '<div style="padding:2em;text-align:center;color:#8D8D8D">' + (Lampa.Lang.translate('dblink_loading') || "Loading\u2026") + '</div>';
        return self.render();
      };
      self.render = function () {
        return self.html;
      };

      self.start = function () {
        if (Lampa.Activity.active() && Lampa.Activity.active().activity !== self.activity) return;
        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(scroll.render());
            var focus = last && $(last).closest('body').length ? last : false;
            Lampa.Controller.collectionFocus(focus, scroll.render());
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            Navigator.move('down');
          },
          left: function left() {
            var $cur = $(last);
            if ($cur.hasClass('dblink-tab') && tabIdx > 0) {
              tabIdx--;
              focusTab(TABS[tabIdx]);
            } else if ($cur.hasClass('dblink-tab') && tabIdx === 0) {
              Lampa.Controller.toggle('menu');
            } else if (Navigator.canmove('left')) {
              Navigator.move('left');
            } else {
              Lampa.Controller.toggle('menu');
            }
          },
          right: function right() {
            var $cur = $(last);
            if ($cur.hasClass('dblink-tab') && tabIdx < TABS.length - 1) {
              tabIdx++;
              focusTab(TABS[tabIdx]);
            } else if (Navigator.canmove('right')) {
              Navigator.move('right');
            }
          },
          back: function back() {
            self.back();
          }
        });
        Lampa.Controller.toggle('content');
        init();

        if (!self.__pluginStorageHandler) {
          self.__pluginStorageHandler = function (e) {
            if (e && e.key === 'plugins' && activeTab === 'plugins') {
              renderPlugins();
            }
          };
          Lampa.Storage.listener.follow('change', self.__pluginStorageHandler);
        }
        focusFirst();
      };
      self.pause = function () {
        if (refreshTimer) {
          clearInterval(refreshTimer);
          refreshTimer = null;
        }
      };
      self.stop = function () {
        if (refreshTimer) {
          clearInterval(refreshTimer);
          refreshTimer = null;
        }
      };
      self.back = function () {
        Lampa.Activity.backward();
      };
      self.destroy = function () {
        if (self.__destroyed) return;
        self.__destroyed = true;
        if (refreshTimer) {
          clearInterval(refreshTimer);
          refreshTimer = null;
        }
        try {
          if (scroll && scroll.body) scroll.body().off();
        } catch (e) {}
        if (self._deltaHandler) {
          DBLinkClient.getInstance().off('profile_delta', self._deltaHandler);
          self._deltaHandler = null;
        }
        try {
          if (scroll) scroll.destroy();
        } catch (e) {}
        try {
          self.html.remove();
        } catch (e) {}
      };

      function switchTab(tabId) {
        if (tabId === activeTab) return;
        activeTab = tabId;
        tabIdx = TABS.indexOf(tabId);
        scroll.clear();
        last = null;
        scroll.reset();
        if (tabId === 'profiles') renderProfiles();else if (tabId === 'devices') renderDevices();else if (tabId === 'plugins') renderPlugins();
      }

      function focusFirst() {
        focusTabBar();
      }

      function renderTabBar() {
        var html = '<div class="dblink-tabs" style="display:flex;gap:0.8em;padding:0 2em 1em">';
        TABS.forEach(function (t) {
          var label = t === 'profiles' ? Lampa.Lang.translate('dblink_profiles') || 'Profiles' : t === 'devices' ? Lampa.Lang.translate('dblink_devices') || 'Devices' : Lampa.Lang.translate('dblink_plugins') || 'Plugins';
          html += '<div class="simple-button selector dblink-tab' + (t === activeTab ? ' active' : '') + '" data-tab="' + t + '">' + label + '</div>';
        });
        html += '</div>';
        return html;
      }
      function bindTabEvents() {
        $(scroll.body()).find('.dblink-tab').each(function () {
          var el = this;
          $(el).off('._gltab');

          $(el).on('hover:focus._gltab', function () {
            last = el;
            scroll.update($(el), true);
          });

          $(el).on('hover:enter._gltab', function () {
            if ($(el).data('tab') !== activeTab) switchTab($(el).data('tab'));
          });
        });
      }

      function focusTab(tabId) {
        var tabEl = $(scroll.body()).find('.dblink-tab[data-tab="' + tabId + '"]');
        if (tabEl.length) {
          last = tabEl[0];
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(tabEl[0], scroll.render());
          scroll.update(tabEl, true);
        }
      }

      function renderProfiles(isRefresh) {
        var body = scroll.body(true);
        function shellReset() {
          body.innerHTML = '';
          bodyPrep(body);
          body.insertAdjacentHTML('beforeend', renderTabBar());
          bindTabEvents();
        }

        // \u0421\u0442\u0430\u043d\u0438 \u0431\u0435\u0437 \u0434\u0430\u043d\u0438\u0445 - \u043d\u0430 \u0442\u0438\u0445\u043e\u043c\u0443 \u043e\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u0456 \u043d\u0456\u0447\u043e\u0433\u043e \u043d\u0435 \u0447\u0456\u043f\u0430\u0454\u043c\u043e
        if (_initializing) {
          if (!isRefresh) { shellReset(); showEmpty(body, Lampa.Lang.translate('dblink_loading') || "Loading\u2026"); focusFirst(); }
          return;
        }
        if (!currentProfilesTopicId) {
          if (!isRefresh) { shellReset(); showEmpty(body, Lampa.Lang.translate('dblink_no_profiles') || 'No profiles'); focusFirst(); }
          return;
        }
        var client = DBLinkClient.getInstance();
        if (!client.isConnected()) {
          if (!isRefresh) { shellReset(); showEmpty(body, Lampa.Lang.translate('dblink_not_connected') || 'Not connected'); focusFirst(); }
          return;
        }

        // \u041f\u0435\u0440\u0448\u0438\u0439 \u0440\u0435\u043d\u0434\u0435\u0440 \u043f\u043e\u043a\u0430\u0437\u0443\u0454 Loading; \u0442\u0438\u0445\u0435 \u043e\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u043b\u0438\u0448\u0430\u0454 \u043f\u043e\u0442\u043e\u0447\u043d\u0438\u0439 \u0441\u043f\u0438\u0441\u043e\u043a
        if (!isRefresh) {
          shellReset();
          showEmpty(body, Lampa.Lang.translate('dblink_loading') || "Loading\u2026");
        }

        client.getMessages(getChannelId(), currentProfilesTopicId, 50).then(function (msgs) {
          var pms = msgs.filter(function (m) {
            var text = m.message || m.text;
            if (!text) return false;
            try {
              var d = JSON.parse(stripCodeFence(text));
              return d && d.meta && d.meta.type === 'profile';
            } catch (e) {
              return false;
            }
          });
          var activeId = Lampa.Storage.get('dblink_active_profile', '');
          var sig = pms.map(function (m) { return String(m.id); }).sort().join(',') + '|' + activeId;
          // \u0411\u0435\u0437 \u0437\u043c\u0456\u043d - \u0431\u0435\u0437 \u0440\u0435\u0431\u0456\u043b\u0434\u0443 (\u0443\u0441\u0443\u0432\u0430\u0454 \u043c\u0435\u0440\u0435\u0445\u0442\u0456\u043d\u043d\u044f \u0432\u0456\u0434 \u043f\u043e\u043b\u043b\u0456\u043d\u0433\u0443)
          if (isRefresh && sig === _profilesSig) return;
          _profilesSig = sig;

          shellReset();
          if (!pms.length) {
            showEmpty(body, Lampa.Lang.translate('dblink_no_profiles') || 'No profiles');
            focusFirst();
            return;
          }
          var addEl = createItem('gs-profile-add-item', '+', Lampa.Lang.translate('dblink_create_profile') || 'Create profile', '', null, null);
          addEl.style.gridColumn = '1 / -1';
          body.appendChild(addEl);

          pms.forEach(function (m) {
            try {
              var d = JSON.parse(stripCodeFence(m.message || m.text));
            } catch (e) {
              return;
            }
            var p = d.payload && d.payload.profile;
            if (!p) return;
            var isActive = String(activeId) === String(m.id);
            var avatar = Profiles.getAvatar(p.name);
            var isUrl = avatar && avatar.indexOf('https://') === 0;
            var avatarHtml = isUrl ? '<img src="' + avatar + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:0.5em">' : avatar;
            var subText = isActive ? Lampa.Lang.translate('dblink_profile_active') || 'Active' : '';
            var badgeCls = isActive ? 'badge--active' : null;
            var badgeText = isActive ? Lampa.Lang.translate('dblink_active') || 'Active' : '';
            var el = createItem('gs-profile-item', avatarHtml, p.name || 'Unnamed', subText, badgeCls, badgeText, isUrl);
            el.dataset.id = m.id;
            el.dataset.name = p.name || 'Unnamed';
            el.dataset.active = String(isActive);
            body.appendChild(el);
          });

          bindProfileEvents();
          Profiles.saveProfilesCache(pms);
          focusFirst();
        })["catch"](function () {
          if (!isRefresh) { shellReset(); showEmpty(body, Lampa.Lang.translate('title_error') || 'Error'); focusFirst(); }
        });
      }
      function bindProfileEvents() {

        $(scroll.body()).find('.gs-profile-add-item').each(function () {
          var el = this;
          $(el).off('._gl').on('hover:enter._gl', function () {
            createProfileHandler();
          });
        });

        $(scroll.body()).find('.gs-profile-item').each(function () {
          var el = this;
          $(el).off('._gl').on('hover:enter._gl', function () {
            if ($(el).data('active') !== true) Profiles.quickSwitchProfile($(el).data('id'));
          });
          $(el).off('hover:long._gl').on('hover:long._gl', function () {
            profileMenu($(el));
          });
        });
      }
      function createProfileHandler() {
        Lampa.Input.edit({
          title: Lampa.Lang.translate('dblink_create_profile') || 'Profile name',
          value: '',
          free: true,
          nosave: true,
          align: 'center'
        }, function (name) {
          if (!name) return;
          var client = DBLinkClient.getInstance();
          if (!client.isConnected()) {
            Lampa.Noty.show('Not connected');
            return;
          }
          var profileName = name.trim();
          var avatar = Profiles.getAvatar(profileName);
          var now = Math.floor(Date.now() / 1000);
          var caption = buildCaption({
            name: profileName,
            avatar: avatar,
            updated: now
          });
          client.getMessages(getChannelId(), currentProfilesTopicId, 50).then(function (msgs) {
            var hasProfiles = msgs.some(function (m) {
              var text = m.message || m.text;
              if (!text) return false;
              try {
                var d = JSON.parse(stripCodeFence(text));
                return d && d.meta && d.meta.type === 'profile';
              } catch (e) {
                return false;
              }
            });
            var fileData = buildFileData({
              name: profileName,
              avatar: avatar,
              bookmarks: hasProfiles ? {
                favorite: {}
              } : {
                favorite: collectFavorite()
              },
              timeline: hasProfiles ? {} : collectTimeline(),
              plugins: collectPlugins(),
              settings: collectSettings()
            });
            client.sendFile(getChannelId(), currentProfilesTopicId, JSON.stringify(fileData, null, 2), buildProfileFileName(profileName, now), caption).then(function (msgId) {
              if (msgId) {
                Lampa.Storage.set(STORAGE_KEYS.ACTIVE_PROFILE, String(msgId));
                Lampa.Storage.set(STORAGE_KEYS.ACTIVE_PROFILE_TS, String(now));
                Lampa.Storage.set(STORAGE_KEYS.ACTIVE_PROFILE_NAME, profileName);
                renderProfiles();
                Lampa.Noty.show(Lampa.Lang.translate('dblink_profile_created') || 'Profile created');
              } else {
                Lampa.Noty.show('Failed to create profile');
              }
            })["catch"](function (e) {
              console.error('DBLink', 'Create profile error:', e);
              Lampa.Noty.show('Failed to create profile');
            });
          })["catch"](function () {
            Lampa.Noty.show('Failed to check existing profiles');
          });
        });
      }

      function renderDevices() {
        var body = scroll.body(true);
        body.innerHTML = '';
        body.insertAdjacentHTML('beforeend', renderTabBar());
        bindTabEvents();
        var client = DBLinkClient.getInstance();
        var isConnected = client.isConnected();

        bodyPrep(body);
        var sEl = document.createElement('div');
        sEl.className = 'dblink-item selector gs-status-item';
        sEl.style.gridColumn = '1 / -1';
        sEl.innerHTML = '<div class="gs-avatar" style="border-radius:50%;width:1.2em;height:1.2em;font-size:0.9em;margin-right:0.8em;background:' + (isConnected ? '#4caf50' : '#DD7337') + '"></div>' + '<div class="gs-content">' + '<div class="gs-title">' + (isConnected ? 'Connected' : Lampa.Lang.translate('dblink_not_connected') || 'Not connected') + '</div>' + '<div class="gs-sub">' + escHtml(isConnected ? getDeviceName() : '-') + '</div>' + '</div>';
        body.appendChild(sEl);
        if (!isConnected) {
          $(sEl).on('hover:enter', function () {
            client.connect()["catch"](function () {});
          });
        } else {
          $(sEl).addClass('gs-device-item').data('self', true).data('id', 'this').data('name', getDeviceName());
        }
        var chId = Lampa.Storage.get(STORAGE_CHANNEL_ID, '');
        var slId = Lampa.Storage.get(STORAGE_SYNC_LOG_TOPIC, '');
        if (!isConnected || !chId || !slId) {
          focusFirst();
          return;
        }
        client.getOnlineDevices(chId, slId).then(function (devices) {
          var myId = getDeviceId();
          if (!devices.some(function (d) {
            return d.device_id === myId;
          })) {
            devices.push({
              device_id: myId,
              device_name: getDeviceName(),
              timestamp: Math.floor(Date.now() / 1000)
            });
          }
          devices.sort(function (a, b) {
            if (a.device_id === myId) return -1;
            if (b.device_id === myId) return 1;
            return (a.device_name || '').localeCompare(b.device_name || '');
          });
          devices.forEach(function (d) {
            var isThis = d.device_id === myId;
            var initial = d.device_name ? d.device_name.charAt(0).toUpperCase() : '?';
            var rawName = d.device_name || 'Unknown';

            var cleanName = rawName.indexOf('Mac Device - ') === 0 ? rawName.slice(13) : rawName;
            var subText = isThis ? Lampa.Lang.translate('dblink_this_device') || 'This device' : '';
            var badgeText = isThis ? 'active' : 'online';
            var el = createItem('gs-device-item', initial, cleanName, subText, 'badge--info', badgeText);
            el.dataset.id = d.device_id;
            el.dataset.name = rawName;
            el.dataset.self = String(isThis);
            body.appendChild(el);
          });
          bindDeviceEvents();
          focusFirst();
        })["catch"](function () {
          focusFirst();
        });
      }
      function bindDeviceEvents() {
        $(scroll.body()).find('.gs-device-item').each(function () {
          var el = this;
          $(el).off('hover:focus._gl').on('hover:focus._gl', function () {
            last = el;
            scroll.update($(el), true);
          });
          $(el).off('hover:enter._gl').on('hover:enter._gl', function () {
            showDeviceMenu($(el).data('id'), $(el).data('name'), $(el).data('self') === true);
          });
          $(el).off('hover:long._gl').on('hover:long._gl', function () {
            if ($(el).data('self') === true) exportBackup();
          });
        });
      }

      function renderPlugins() {
        var body = scroll.body(true);
        body.innerHTML = '';
        body.insertAdjacentHTML('beforeend', renderTabBar());
        bindTabEvents();
        var activeId = Lampa.Storage.get('dblink_active_profile', '');
        if (!activeId) {
          showEmpty(body, Lampa.Lang.translate('dblink_no_profiles') || 'No active profile');
          focusFirst();
          return;
        }
        var plugins;
        try {
          plugins = Lampa.Storage.get('plugins', []);
        } catch (e) {
          plugins = [];
        }
        bodyPrep(body);

        var addEl = createItem('gs-plugin-add-item', '+', Lampa.Lang.translate('dblink_plugins_add') || 'Add plugin', Lampa.Lang.translate('dblink_plugins_manage_hint') || 'Add plugins via URL', null);
        addEl.style.gridColumn = '1 / -1';
        body.appendChild(addEl);
        if (!plugins || !plugins.length) {
          showEmpty(body, Lampa.Lang.translate('dblink_no_plugins') || 'No plugins installed');
        } else {
          plugins.forEach(function (plugin, idx) {
            var isOn = plugin.status === 1;
            var name = (plugin.name || plugin.url || 'Plugin').slice(0, 60);
            var url = (plugin.url || 'local').slice(0, 80);

            var badgeCls = isOn ? null : 'badge--inactive';
            var badgeTxt = isOn ? '' : Lampa.Lang.translate('player_disabled') || 'disabled';
            var el = createItem('gs-plugin-item', '', name, url, badgeCls, badgeTxt);
            el.dataset.idx = idx;
            body.appendChild(el);
          });
        }
        bindPluginEvents();
        focusFirst();
      }
      function bindPluginEvents() {
        $(scroll.body()).find('.gs-plugin-item').each(function () {
          var el = this;
          $(el).off('hover:focus._gl').on('hover:focus._gl', function () {
            last = el;
            scroll.update($(el), true);
          });
          $(el).off('hover:enter._gl').on('hover:enter._gl', function () {
            var idx = parseInt($(el).data('idx'), 10);
            var plugins = getPlugins();
            if (!plugins[idx]) return;
            var p = plugins[idx];
            select({
              title: p.name || p.url || 'Plugin',
              items: [{
                title: p.status === 1 ? 'Disable' : 'Enable',
                _do: 'toggle'
              }, {
                title: Lampa.Lang.translate('dblink_plugins_edit_name') || 'Edit name',
                _do: 'edit_name'
              }, {
                title: Lampa.Lang.translate('dblink_plugins_edit_url') || 'Edit URL',
                _do: 'edit_url'
              }, {
                title: Lampa.Lang.translate('dblink_plugins_remove') || 'Remove',
                _do: 'remove'
              }, {
                title: Lampa.Lang.translate('dblink_cancel') || 'Cancel',
                _do: 'cancel',
                cancel: true
              }],
              onSelect: function onSelect(item) {
                if (item._do === 'toggle') doToggle(idx);else if (item._do === 'remove') doRemove(idx);else if (item._do === 'edit_name') doEditPluginName(idx);else if (item._do === 'edit_url') doEditPluginUrl(idx);
              }
            });
          });
          $(el).off('hover:long._gl').on('hover:long._gl', function () {
            doToggle(parseInt($(el).data('idx'), 10));
          });
        });
        $(scroll.body()).find('.gs-plugin-add-item').each(function () {
          var el = this;
          $(el).off('hover:focus._gl').on('hover:focus._gl', function () {
            last = el;
            scroll.update($(el), true);
          });
          $(el).off('hover:enter._gl').on('hover:enter._gl', function () {
            doAddPlugin();
          });
        });
      }
      function doEditPluginName(idx) {
        var plugins = getPlugins();
        if (!plugins[idx]) return;
        input({
          title: Lampa.Lang.translate('dblink_plugins_edit_name') || 'Plugin name',
          value: plugins[idx].name || '',
          onSubmit: function onSubmit(newName) {
            if (!newName || !newName.trim()) return;
            plugins[idx].name = newName.trim();
            savePlugins(plugins);
            renderPlugins();
            showReloadPrompt(function () {
              focusFirst();
            });
          }
        });
      }
      function doEditPluginUrl(idx) {
        var plugins = getPlugins();
        if (!plugins[idx]) return;
        input({
          title: Lampa.Lang.translate('dblink_plugins_edit_url') || 'Plugin URL',
          value: plugins[idx].url || '',
          onSubmit: function onSubmit(newUrl) {
            if (!newUrl || !newUrl.trim()) return;
            newUrl = newUrl.trim();
            if (!newUrl.match(/^https?:\/\/.+/i)) {
              Lampa.Noty.show('Invalid URL');
              return;
            }
            plugins[idx].url = newUrl;
            savePlugins(plugins);
            renderPlugins();
            showReloadPrompt(function () {
              focusFirst();
            });
          }
        });
      }

      function createItem(cls, avatar, title, sub, badgeCls, badgeText, isHtmlAvatar) {
        var el = document.createElement('div');
        el.className = 'dblink-item selector ' + cls;

        var avatarHtml = avatar ? '<div class="gs-avatar">' + (isHtmlAvatar ? avatar : escHtml(avatar)) + '</div>' : '';
        el.innerHTML = avatarHtml + '<div class="gs-content">' + '<div class="gs-title">' + escHtml(title) + '</div>' + '<div class="gs-sub">' + escHtml(sub) + '</div>' + '</div>' + (badgeCls ? '<div class="gs-badge ' + badgeCls + '">' + escHtml(badgeText || '') + '</div>' : '');

        $(el).on('hover:focus', function () {
          last = el;
          scroll.update($(el), true);
        });
        return el;
      }
      function bodyPrep(body) {
        $(body).addClass('dblink-body--grid').removeClass('dblink-body--content');
      }
      function showEmpty(body, msg) {
        body.insertAdjacentHTML('beforeend', '<div class="dblink-item" style="justify-content:center;align-items:center;display:flex;padding:2em;grid-column:1/-1"><span style="color:#8D8D8D">' + escHtml(msg) + '</span></div>');
      }
      function focusTabBar() {
        var firstTab = $(scroll.body()).find('.dblink-tab').first();
        if (firstTab.length) {
          last = firstTab[0];
          Lampa.Controller.collectionSet(scroll.render());
          Lampa.Controller.collectionFocus(firstTab[0], scroll.render());
          scroll.immediate(firstTab[0], true);
        }
      }

      function getPlugins() {
        try {
          return Lampa.Storage.get('plugins', []);
        } catch (e) {
          return [];
        }
      }
      function savePlugins(p) {
        Lampa.Storage.set('plugins', p);
      }
      function doToggle(idx) {
        var plugins = getPlugins();
        if (!plugins[idx]) return;
        plugins[idx].status = plugins[idx].status === 1 ? 0 : 1;
        savePlugins(plugins);

        if (window.Lampa && Lampa.Plugins) {
          try {
            Lampa.Plugins.init();
          } catch (e) {}
        }
        var st = Lampa.Storage.get('dblink_profiles_sync_topic', '');
        if (st) Profiles.publishDeviceDelta(st, 'device_plugin_status', {
          device_id: getDeviceId(),
          url: plugins[idx].url,
          status: plugins[idx].status
        }, 'all');
        Lampa.Noty.show((plugins[idx].name || 'Plugin') + ': ' + (plugins[idx].status === 1 ? 'on' : 'off'));
        renderPlugins();

        showReloadPrompt(function () {

          focusFirst();
        });
      }
      function doRemove(idx) {
        var plugins = getPlugins();
        var url = plugins[idx] ? plugins[idx].url : '';
        plugins.splice(idx, 1);
        savePlugins(plugins);

        if (window.Lampa && Lampa.Plugins) {
          try {
            Lampa.Plugins.init();
          } catch (e) {}
        }
        var st = Lampa.Storage.get('dblink_profiles_sync_topic', '');
        if (st) Profiles.publishLocalDelta(st, 'plugin_change', {
          action: 'remove',
          plugin: {
            url: url
          }
        });
        Lampa.Noty.show(Lampa.Lang.translate('dblink_plugins_removed') || 'Plugin removed');
        renderPlugins();
        showReloadPrompt(function () {
          focusFirst();
        });
      }
      function doAddPlugin() {
        input({
          title: Lampa.Lang.translate('dblink_plugins_add_url') || 'Plugin URL (.js)',
          onSubmit: function onSubmit(url) {
            if (!url) return;
            url = url.trim();
            if (!url.match(/^https?:\/\/.+/i)) {
              Lampa.Noty.show('Invalid URL');
              return;
            }
            var plugins = getPlugins();
            if (plugins.some(function (p) {
              return p.url === url;
            })) {
              Lampa.Noty.show('Already installed');
              return;
            }
            var gn = url.split('/').pop().replace(/\.js(\?.*)?$/i, '').replace(/[-_]/g, ' ') || 'Plugin';
            input({
              title: Lampa.Lang.translate('dblink_plugins_name') || 'Plugin name',
              value: gn,
              onSubmit: function onSubmit(name) {
                var np = {
                  url: url,
                  name: name && name.trim() || gn,
                  status: 1,
                  custom: {}
                };
                Profiles.addToPluginRegistry(url, np.name);
                plugins.push(np);
                savePlugins(plugins);

                if (window.Lampa && Lampa.Plugins) {
                  try {
                    Lampa.Plugins.init();
                  } catch (e) {}
                }
                var st = Lampa.Storage.get('dblink_profiles_sync_topic', '');
                if (st) Profiles.publishLocalDelta(st, 'plugin_change', {
                  action: 'add',
                  plugin: np
                });
                Lampa.Noty.show('Plugin added');
                renderPlugins();
                showReloadPrompt(function () {
                  focusFirst();
                });
              }
            });
          }
        });
      }

      function showDeviceMenu(did, dname, isThis) {
        var items = [];
        if (!isThis) items.push({
          title: Lampa.Lang.translate('dblink_device_open'),
          action: 'open'
        });
        if (isThis) items.push({
          title: Lampa.Lang.translate('dblink_backup_export') || 'Export Backup',
          action: 'export'
        });
        items.push({
          title: Lampa.Lang.translate('dblink_backup_import') || 'Import Backup',
          action: 'import'
        });
        if (isThis) items.push({
          title: Lampa.Lang.translate('dblink_device_rename'),
          action: 'rename'
        });
        items.push({
          title: Lampa.Lang.translate('dblink_cancel') || 'Cancel',
          cancel: true
        });
        select({
          title: dname,
          items: items,
          onSelect: function onSelect(item) {
            if (item.action === 'open') {
              var a = Lampa.Activity.active();
              if (a && a.card) {
                Broadcast.sendOpenCard(did, a.card);
                Lampa.Noty.show(Lampa.Lang.translate('dblink_sent_to').replace('{device}', dname));
              } else {
                Lampa.Noty.show(Lampa.Lang.translate('dblink_nothing_share'));
              }
            } else if (item.action === 'export') exportBackup();else if (item.action === 'import') importBackup();else if (item.action === 'rename') {
              var c = Lampa.Storage.get('dblink_device_label', getDeviceName());
              input({
                title: Lampa.Lang.translate('dblink_device_name_title'),
                value: c,
                onSubmit: function onSubmit(n) {
                  if (n && n.trim()) {
                    Lampa.Storage.set('dblink_device_label', n.trim());
                    Lampa.Noty.show(Lampa.Lang.translate('dblink_device_renamed'));
                  }
                }
              });
            }
          }
        });
      }

      function exportBackup() {
        var c = DBLinkClient.getInstance(),
          bt = Lampa.Storage.get(STORAGE_BACKUP_TOPIC, '');
        if (!c.isConnected()) {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_not_connected'));
          return;
        }
        if (!bt) {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_topic_not_ready'));
          return;
        }
        var ch = parseInt(Lampa.Storage.get(STORAGE_CHANNEL_ID, ''), 10);
        Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_uploading'));

        var collected = collectCategorized();
        var payload = buildExportPayload(collected, {
          device_id: getDeviceId(),
          device_name: getDeviceName()
        });
        var total = payload.chunks.length;

        var seq = Promise.resolve();
        payload.chunks.forEach(function (ch_data, idx) {
          seq = seq.then(function () {
            var chunkJson = JSON.stringify({
              category: ch_data.category,
              keys: ch_data.keysData
            });
            return c.sendFile(ch, bt, chunkJson, payload.backupName + '/' + ch_data.file_name, JSON.stringify({
              type: 'dblink_backup_chunk',
              index: idx,
              category: ch_data.category
            })).then(function (msgId) {
              if (msgId) payload.manifest.chunks[idx].telegram_msg_id = msgId;
              Lampa.Noty.show(idx + 1 + '/' + total + ' ' + (Lampa.Lang.translate('dblink_backup_uploading') || 'chunks'));
            });
          });
        });

        seq.then(function () {
          var manifestJson = JSON.stringify(payload.manifest, null, 2);
          return c.sendFile(ch, bt, manifestJson, payload.backupName + '/manifest.json', JSON.stringify({
            device_id: getDeviceId(),
            device_name: getDeviceName(),
            timestamp: Math.floor(Date.now() / 1000)
          }));
        }).then(function (msgId) {
          Lampa.Noty.show(msgId ? Lampa.Lang.translate('dblink_backup_exported') || 'Backup saved: ' + total + ' chunks' : Lampa.Lang.translate('dblink_backup_failed') || 'Backup failed');
        })["catch"](function () {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_failed') || 'Backup failed');
        });
      }
      function importBackup() {
        var c = DBLinkClient.getInstance(),
          bt = Lampa.Storage.get(STORAGE_BACKUP_TOPIC, '');
        if (!c.isConnected()) {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_not_connected'));
          return;
        }
        if (!bt) {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_topic_not_ready'));
          return;
        }
        var ch = parseInt(Lampa.Storage.get(STORAGE_CHANNEL_ID, ''), 10);
        Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_fetching'));
        listBackupSessions(c, ch, bt).then(function (sessions) {
          if (!sessions || !sessions.length) {
            Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_no_files') || 'No backups');
            return;
          }
          select({
            title: Lampa.Lang.translate('dblink_backup_pick_title') || 'Select backup',
            items: sessions.map(function (s) {
              return {
                title: s.label + (s.deviceInfo ? ' (' + s.deviceInfo + ')' : ''),
                subtitle: Lampa.Lang.translate('dblink_backup_restore_title') || 'Restore',
                _session: s
              };
            }).concat([{
              title: Lampa.Lang.translate('dblink_cancel') || 'Cancel',
              cancel: true
            }]),
            onSelect: function onSelect(item) {
              if (item.cancel || !item._session) return;
              var session = item._session;

              select({
                title: Lampa.Lang.translate('dblink_backup_restore_title') || 'Restore backup?',
                items: [{
                  title: session.deviceInfo || 'Device',
                  _info: true
                }, {
                  title: session.label,
                  _info: true
                }, {
                  title: Lampa.Lang.translate('dblink_backup_restore_btn') || 'Restore',
                  action: 'restore'
                }, {
                  title: Lampa.Lang.translate('dblink_cancel') || 'Cancel',
                  cancel: true
                }],
                onSelect: function onSelect(confItem) {
                  if (confItem.action !== 'restore') return;
                  Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_downloading') || 'Restoring...');

                  downloadManifest(c, session).then(function (manifest) {

                    var chunkFiles = findChunkFiles(session, manifest);
                    if (!chunkFiles.length) {
                      Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_invalid') || 'No chunks found');
                      return;
                    }

                    var restoreSeq = Promise.resolve();
                    var appliedCount = 0;
                    chunkFiles.forEach(function (cf, idx) {
                      restoreSeq = restoreSeq.then(function () {
                        return c.downloadFile(cf.file).then(function (jsonStr) {
                          if (!jsonStr) return;
                          try {
                            var data = parseChunk(jsonStr);
                            var keys = data.keys || {};
                            Object.keys(keys).forEach(function (k) {
                              Lampa.Storage.set(k, keys[k]);
                            });
                            appliedCount++;
                          } catch (e) {
                            console.warn('DBLink', 'Chunk parse error:', e);
                          }
                          Lampa.Noty.show(idx + 1 + '/' + chunkFiles.length + ' chunks restored');
                        });
                      });
                    });
                    restoreSeq.then(function () {
                      Lampa.Noty.show((Lampa.Lang.translate('dblink_backup_restored') || 'Restored') + ' (' + appliedCount + '/' + chunkFiles.length + ')');

                      Lampa.Listener.send('dblink_backup_restored', {
                        restored_at: manifest.meta.created_at
                      });

                      setTimeout(function () {
                        softRefresh();
                      }, 600);
                    })["catch"](function (err) {
                      console.error('DBLink', 'Restore error:', err);
                      Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_failed') || 'Restore failed');
                    });
                  })["catch"](function (err) {
                    Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_invalid') || 'Manifest error');
                    console.error('DBLink', 'Manifest error:', err);
                  });
                }
              });
            }
          });
        })["catch"](function () {
          Lampa.Noty.show(Lampa.Lang.translate('dblink_backup_failed') || 'Failed to list backups');
        });
      }

      function profileMenu($card) {
        var id = $card.data('id'),
          name = $card.data('name') || 'Unnamed',
          active = $card.data('active') === true;
        var items = [];
        items.push({
          title: Lampa.Lang.translate('dblink_plugins') || 'Plugins',
          action: 'plugins'
        });
        items.push({
          title: Lampa.Lang.translate('dblink_sync') || 'Sync',
          action: 'sync'
        });
        items.push({
          title: Lampa.Lang.translate('dblink_profile_rename') || 'Rename',
          action: 'rename'
        });
        if (!active) items.push({
          title: Lampa.Lang.translate('dblink_delete') || 'Delete',
          action: 'delete'
        });
        items.push({
          title: Lampa.Lang.translate('dblink_cancel') || 'Cancel',
          cancel: true
        });
        select({
          title: name,
          items: items,
          onSelect: function onSelect(item) {
            if (item.action === 'plugins') PluginManager.open(id, name, active);else if (item.action === 'sync') Profiles.syncProfile(id, currentProfilesTopicId);else if (item.action === 'rename') doRenameProfile(id, name);else if (item.action === 'delete') deleteProfile(id);
          }
        });
      }
      function doRenameProfile(msgId, currentName) {
        input({
          title: Lampa.Lang.translate('dblink_profile_rename') || 'Rename profile',
          value: currentName,
          onSubmit: function onSubmit(newName) {
            if (!newName || !newName.trim() || newName.trim() === currentName) return;
            Profiles.renameProfile(msgId, currentProfilesTopicId, newName.trim(), function () {
              renderProfiles();
            });
          }
        });
      }
      function deleteProfile(id) {
        var ch = parseInt(Lampa.Storage.get('dblink_channel_id', ''), 10);
        if (!ch) return;
        DBLinkClient.getInstance().deleteMessage(ch, parseInt(id, 10)).then(function (ok) {
          if (ok) {
            if (String(Lampa.Storage.get('dblink_active_profile', '')) === String(id)) {
              Lampa.Storage.set('dblink_active_profile', '');
              Lampa.Storage.set('dblink_active_profile_ts', '');
            }
            renderProfiles();
            Lampa.Noty.show('Profile deleted');
          }
        })["catch"](function () {
          Lampa.Noty.show('Delete failed');
        });
      }

      function init() {
        currentChannelId = Lampa.Storage.get(STORAGE_CHANNEL_ID, null);
        Lampa.Storage.get(STORAGE_SYNC_LOG_TOPIC, null);
        currentProfilesTopicId = Lampa.Storage.get(STORAGE_PROFILES_TOPIC, null);
        Lampa.Storage.get(STORAGE_PROFILES_SYNC_TOPIC, null);
        Lampa.Storage.get(STORAGE_BACKUP_TOPIC, null);
        var client = DBLinkClient.getInstance();

        _initializing = true;
        renderProfiles();

        client.connect().then(function () {
          return ensureSyncChannel();
        }).then(function () {
          if (self.__destroyed) return;
          _initializing = false;
          var ch = Lampa.Storage.get(STORAGE_CHANNEL_ID, ''),
            sl = Lampa.Storage.get(STORAGE_SYNC_LOG_TOPIC, '');
          if (ch && sl) client.startHeartbeat(ch, sl);
          self._deltaHandler = function (data) {
            Profiles.applyDelta(data);
          };
          client.on('profile_delta', self._deltaHandler);
          renderProfiles();
          if (refreshTimer) clearInterval(refreshTimer);
          refreshTimer = setInterval(function () {
            if (activeTab === 'profiles') renderProfiles(true);
          }, 15000);
        })["catch"](function (err) {
          if (self.__destroyed) return;
          _initializing = false;
          renderProfiles();
          console.warn('DBLink', 'Hub init error:', err);
        });
      }

      function ensureSyncChannel() {
        var client = DBLinkClient.getInstance();
        if (currentChannelId) return ensureTopics();
        return client.findChannel(CHANNEL_TITLE).then(function (id) {
          if (id) {
            currentChannelId = id;
            Lampa.Storage.set(STORAGE_CHANNEL_ID, id);
            return ensureTopics();
          }
          return createChannel();
        });
      }
      function ensureTopics() {
        var client = DBLinkClient.getInstance(),
          ps = [];
        function ensure(name, storeKey, setter) {
          var s = Lampa.Storage.get(storeKey, '');
          if (s) {
            setter(s);
            return Promise.resolve();
          }
          return client.findTopic(currentChannelId, name).then(function (id) {
            if (id) {
              setter(id);
              Lampa.Storage.set(storeKey, id);
              return;
            }
            return client.createTopic(currentChannelId, name).then(function (tid) {
              if (tid) {
                setter(tid);
                Lampa.Storage.set(storeKey, tid);
              }
            });
          });
        }
        ps.push(ensure('sync-log', STORAGE_SYNC_LOG_TOPIC, function (id) {
        }));
        ps.push(ensure('profiles', STORAGE_PROFILES_TOPIC, function (id) {
          currentProfilesTopicId = id;
        }));
        ps.push(ensure('profiles-sync', STORAGE_PROFILES_SYNC_TOPIC, function (id) {
        }));
        ps.push(ensure('backup', STORAGE_BACKUP_TOPIC, function (id) {
        }));
        return Promise.all(ps);
      }
      function createChannel() {
        var client = DBLinkClient.getInstance();
        return client.createChannel(CHANNEL_TITLE).then(function (peerId) {
          if (!peerId) throw new Error('Create channel failed');
          currentChannelId = peerId;
          Lampa.Storage.set(STORAGE_CHANNEL_ID, peerId);
          var seq = Promise.resolve();
          TOPIC_NAMES.forEach(function (name) {
            seq = seq.then(function () {
              return client.createTopic(peerId, name).then(function (tid) {
                if (!tid) return;
                var s = '';
                if (name === 'sync-log') {
                  s = STORAGE_SYNC_LOG_TOPIC;
                } else if (name === 'profiles') {
                  s = STORAGE_PROFILES_TOPIC;
                  currentProfilesTopicId = tid;
                } else if (name === 'profiles-sync') {
                  s = STORAGE_PROFILES_SYNC_TOPIC;
                } else if (name === 'backup') {
                  s = STORAGE_BACKUP_TOPIC;
                }
                if (s) Lampa.Storage.set(s, tid);
              })["catch"](function (e) {
                console.warn('DBLink', 'Topic ' + name + ':', e);
              });
            });
          });
          return seq;
        })["catch"](function (err) {
          Lampa.Noty.show('Failed to create sync channel');
          throw err;
        });
      }

    }

    function startPlugin() {
      window.plugin_dblink_ready = true;
      Profiles.callbacks.onOpenPluginManager = PluginManager.open;

      try {
        if (document.currentScript) {
          var src = document.currentScript.src;
          if (src) window.__dblink_self_url = src.split('?')[0];
        }
      } catch (e) {}
      if (!window.__dblink_self_url) {

        window.__dblink_self_url = './plugins/DBLink.js';
      }

      var manifest = {
        type: 'plugin',
        version: VERSION,
        author: '@lme_chat',
        name: 'LampaDBLink',
        description: 'Sync via Supabase database',
        component: 'dblink_hub',
        onContextMenu: function onContextMenu(object) {
          var client = DBLinkClient.getInstance();
          if (!client.isConnected()) return null;
          return {
            name: Lampa.Lang.translate('dblink_open_on_device'),
            description: ''
          };
        },
        onContextLauch: function onContextLauch(data) {
          var card = Lampa.Utils.clearCard ? Lampa.Utils.clearCard(JSON.parse(JSON.stringify(data))) : data;
          Broadcast.showDevicePicker({
            title: Lampa.Lang.translate('dblink_open_on_device'),
            onSelect: function onSelect(device) {
              Broadcast.sendOpenCard(device.device_id, card);
              Lampa.Noty.show(Lampa.Lang.translate('dblink_sent_to').replace('{device}', device.device_name || 'device'));
            }
          });
        }
      };
      Lampa.Manifest.plugins = manifest;
      Lampa.Component.add('dblink_hub', Hub);
      Lampa.Component.add('dblink_plugin_manager', PluginManagerComponent);
      lang();
      initSettings();
      Lampa.Template.add('dblink_style', '<style>.dblink-activity{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;height:100%}.dblink-activity .head__title{font-size:1.4em}.dblink-hub{padding:1em 2em;max-width:50em;margin:0 auto}.dblink-hub__header{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:justify;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between;margin-bottom:2em;padding-bottom:1em;border-bottom:1px solid rgba(255,255,255,0.1)}.dblink-hub__title{font-size:1.6em;font-weight:700;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;gap:.5em}.dblink-hub__actions{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;gap:.5em}.dblink-hub__section{margin-bottom:2em}.dblink-hub__section-title{font-size:1.2em;font-weight:600;margin-bottom:1em;color:rgba(255,255,255,0.7)}.dblink-status{background:rgba(255,255,255,0.05);-webkit-border-radius:.8em;border-radius:.8em;padding:1.5em;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;gap:1em}.dblink-status__indicator{width:1em;height:1em;-webkit-border-radius:50%;border-radius:50%;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.dblink-status__indicator--connected{background:#4caf50;-webkit-box-shadow:0 0 .6em rgba(76,175,80,0.5);box-shadow:0 0 .6em rgba(76,175,80,0.5)}.dblink-status__indicator--disconnected{background:#f44336}.dblink-status__indicator--connecting{background:#ffc107;-webkit-animation:dblink-pulse 1.5s ease-in-out infinite;animation:dblink-pulse 1.5s ease-in-out infinite}.dblink-status__indicator--auth_needed{background:#ff9800}.dblink-status__indicator--error{background:#f44336}.dblink-status__info{-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;min-width:0}.dblink-status__label{font-size:1.1em;font-weight:600;margin-bottom:.2em}.dblink-status__detail{font-size:.9em;color:rgba(255,255,255,0.5)}@-webkit-keyframes dblink-pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes dblink-pulse{0%,100%{opacity:1}50%{opacity:.4}}.dblink-devices__empty{text-align:center;padding:2em;color:rgba(255,255,255,0.4);font-size:1.1em}.dblink-device{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;gap:1em;padding:1em 1.2em;background:rgba(255,255,255,0.03);-webkit-border-radius:.6em;border-radius:.6em;margin-bottom:.5em;cursor:pointer;-webkit-transition:background .2s;-o-transition:background .2s;transition:background .2s}.dblink-device.focus,.dblink-device.hover{background:rgba(255,255,255,0.1);outline:.2em solid #fff;outline-offset:.3em}.dblink-device__icon{width:2.5em;height:2.5em;-webkit-border-radius:.5em;border-radius:.5em;background:-webkit-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:-o-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:linear-gradient(135deg,#08c 0,#00a2e8 100%);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;font-size:.9em;color:white}.dblink-device__info{-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;min-width:0}.dblink-device__name{font-size:1.1em;font-weight:600}.dblink-device__meta{font-size:.85em;color:rgba(255,255,255,0.4)}.dblink-device__status{font-size:.8em;padding:.3em .6em;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(76,175,80,0.15);color:#4caf50}.dblink-device--this{opacity:.6;cursor:default}.dblink-auth{padding:1em;text-align:center}.dblink-auth__qr-container{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;margin-bottom:1.5em;min-height:18em}.dblink-auth__qr-placeholder{width:16em;height:16em;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;background:rgba(255,255,255,0.05);-webkit-border-radius:1em;border-radius:1em}.dblink-auth__qr-img{width:16em;height:16em;-webkit-border-radius:1em;border-radius:1em;background:white;padding:.5em}.dblink-auth__status{font-size:1.1em;color:rgba(255,255,255,0.6);line-height:1.5}.dblink-auth__scan-hint{margin-bottom:.5em;color:rgba(255,255,255,0.8)}.dblink-auth__confirm-hint{font-size:.85em;color:rgba(255,255,255,0.4)}.dblink-btn{display:-webkit-inline-box;display:-webkit-inline-flex;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;gap:.4em;padding:.6em 1.2em;-webkit-border-radius:.5em;border-radius:.5em;font-size:.9em;font-weight:600;cursor:pointer;border:0;-webkit-transition:background .2s,opacity .2s;-o-transition:background .2s,opacity .2s;transition:background .2s,opacity .2s}.dblink-btn.focus,.dblink-btn.hover{outline:.2em solid #fff;outline-offset:.3em}.dblink-btn--primary{background:-webkit-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:-o-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:linear-gradient(135deg,#08c 0,#00a2e8 100%);color:white}.dblink-btn--ghost{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8)}.dblink-btn--ghost.focus{background:rgba(255,255,255,0.15)}.dblink-btn--small{padding:.4em .8em;font-size:.8em}@media screen and (max-width:1024px){.dblink-hub{padding:.8em 1em}.dblink-tabs{padding-left:1em;padding-right:1em}.dblink-status{padding:1em}.dblink-auth__qr-placeholder,.dblink-auth__qr-img{width:12em;height:12em}.dblink-auth__qr-container{min-height:14em}}@media screen and (max-width:480px){.dblink-hub__header{-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;gap:.8em;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start}}.dblink-2fa{padding:1em;text-align:center}.dblink-2fa__desc{font-size:1.1em;color:rgba(255,255,255,0.8);margin-bottom:.5em;line-height:1.4}.dblink-2fa__hint{font-size:.9em;color:rgba(255,255,255,0.5);margin-bottom:1.5em}.dblink-2fa__input-wrap{margin-bottom:1.5em}.dblink-2fa__input{width:100%;max-width:20em;padding:.8em 1em;border:.15em solid rgba(255,255,255,0.2);-webkit-border-radius:.5em;border-radius:.5em;background:rgba(255,255,255,0.08);color:#fff;font-size:1.1em;text-align:center;outline:0;-webkit-box-sizing:border-box;box-sizing:border-box}.dblink-2fa__input:focus{border-color:#08c}.dblink-2fa__actions{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;gap:.8em;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}.dblink-2fa__btn{display:-webkit-inline-box;display:-webkit-inline-flex;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;padding:.7em 1.5em;-webkit-border-radius:.5em;border-radius:.5em;font-size:1em;font-weight:600;cursor:pointer;min-width:8em;-webkit-transition:background .2s;-o-transition:background .2s;transition:background .2s}.dblink-2fa__btn_ok{background:-webkit-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:-o-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:linear-gradient(135deg,#08c 0,#00a2e8 100%);color:white}.dblink-2fa__btn_cancel{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.8)}.dblink-2fa__btn.focus,.dblink-2fa__btn.hover{outline:.2em solid #fff;outline-offset:.3em}.dblink-tabs{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;gap:.8em;padding:0 2em;margin-bottom:1em}.dblink-tab.active{background:rgba(255,255,255,0.15) !important;border-color:rgba(255,255,255,0.3) !important;color:#fff !important}.dblink-body--grid>.dblink-tabs,.dblink-tabs{grid-column:1/-1}.dblink-device-avatar{width:2em;height:2em;-webkit-border-radius:.4em;border-radius:.4em;background:-webkit-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:-o-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:linear-gradient(135deg,#08c 0,#00a2e8 100%);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;color:#fff;font-weight:600;font-size:.9em}.dblink-avatar{-webkit-border-radius:50%;border-radius:50%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;color:#fff;font-weight:700;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;overflow:hidden}.dblink-avatar--head{width:24px;height:24px;font-size:11px}.dblink-avatar--list{width:2em;height:2em;font-size:.9em}.dblink-profile-avatar{width:2.2em;height:2.2em;-webkit-border-radius:50%;border-radius:50%;background:-webkit-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:-o-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:linear-gradient(135deg,#08c 0,#00a2e8 100%);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;color:#fff;font-weight:600;font-size:.9em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.gs-plugin-toggle{width:1.2em;height:1.2em;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;font-size:1.2em}.gs-plugin-toggle.on{color:#4caf50}.gs-plugin-toggle.off{color:rgba(255,255,255,0.3)}.gs-status-item .dblink-status__indicator{margin:auto}.gs-profile-item .gs-avatar{background:rgba(255,255,255,0.06) !important}.gs-profile-item .gs-avatar img{width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.5em;border-radius:.5em}.gs-profile-add-item{border:2px dashed rgba(255,215,0,0.3);background:transparent !important;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;text-align:center;color:rgba(255,255,255,0.5)}.gs-profile-add-item.focus,.gs-profile-add-item.hover{border-color:rgba(255,215,0,0.7);color:rgba(255,255,255,0.8)}.gs-profile-add-item .gs-avatar{background:-webkit-linear-gradient(315deg,#d4a017 0,#ffd700 100%) !important;background:-o-linear-gradient(315deg,#d4a017 0,#ffd700 100%) !important;background:linear-gradient(135deg,#d4a017 0,#ffd700 100%) !important}.dblink-item{background:#404040;-webkit-border-radius:1em;border-radius:1em;padding:1.2em 1.4em;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;cursor:pointer;position:relative;-webkit-box-sizing:border-box;box-sizing:border-box}.dblink-item.focus{outline:.3em solid #fff;outline-offset:.3em;-webkit-border-radius:1.2em;border-radius:1.2em}.dblink-body--grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1em;padding:1em 2em}@media(max-width:1024px){.dblink-body--grid{grid-template-columns:1fr;padding-bottom:80px}}@media(max-width:480px){.dblink-body--grid{padding-left:1em;padding-right:1em}}.dblink-body--grid>.dblink-item{margin:0;min-height:0}.dblink-body--grid>.dblink-item+.dblink-item{margin:0}.dblink-body--content{padding:1em 2em}.gs-avatar{width:2.5em;height:2.5em;-webkit-border-radius:.5em;border-radius:.5em;background:-webkit-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:-o-linear-gradient(315deg,#08c 0,#00a2e8 100%);background:linear-gradient(135deg,#08c 0,#00a2e8 100%);display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;color:#fff;font-weight:700;font-size:.9em;margin-right:1em}.gs-content{-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;min-width:0}.gs-title{font-size:1.1em;line-height:normal;margin-bottom:.2em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap}.gs-sub{font-size:.84em;color:#8d8d8d;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;white-space:nowrap}.gs-badge{font-size:.78em;padding:.3em .5em;-webkit-border-radius:.3em;border-radius:.3em;background:rgba(0,0,0,0.18);-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;margin-left:auto}.gs-badge.badge--active{color:#6dce4b}.gs-badge.badge--inactive{color:#dd7337}.gs-badge.badge--info{color:#8d8d8d}.dblink-body--grid>.dblink-tabs,.dblink-tabs{grid-column:1/-1}</style>');
      $('body').append(Lampa.Template.get('dblink_style', {}, true));
      setupBroadcastListener();
      setupBackupRestoredListener();
      addMenu();

      Lampa.Listener.follow('app', function __glHeadBtn(e) {
        if (e.type === 'ready') {
          addProfileHeadButton();
        }
      });
      Broadcast.setupPlayerPanel();
      Broadcast.addBroadcastButton();
      autoConnect();
      autoActivateProfile();
      setupProfileDeltaListeners();
      setupDeviceSettingsListener();
      startDeltaPolling();
    }

    var deltaPollTimer = null;
    function startDeltaPolling() {

      if (deltaPollTimer) {
        clearInterval(deltaPollTimer);
        deltaPollTimer = null;
      }

      window.__dblink_poke_deltas = function () {
        try { Profiles.refreshDeltas(); } catch (e) {}
      };

      var client = DBLinkClient.getInstance();
      var pollInterval = getInt(STORAGE_KEYS.POLL_INTERVAL, 10) * 1000;
      var check = setInterval(function () {
        if (client.isConnected()) {
          clearInterval(check);

          Profiles.refreshDeltas();
          deltaPollTimer = setInterval(function () {
            if (document.hidden) return;
            Profiles.refreshDeltas();
          }, pollInterval);
        }
      }, 2000);
    }
    function setupProfileDeltaListeners() {
      if (!window.Lampa || !Lampa.Favorite || !Lampa.Favorite.listener) return;
      Lampa.Favorite.listener.follow('add,added', function (e) {
        if (isSkipPublish()) return;
        var profilesSyncTopicId = Lampa.Storage.get('dblink_profiles_sync_topic', '');
        if (!profilesSyncTopicId) return;
        Profiles.publishLocalDelta(profilesSyncTopicId, 'bookmark_add', {
          card_id: e.card.id,
          type: e.where,
          card: Lampa.Utils.clearCard(JSON.parse(JSON.stringify(e.card)))
        });
      });
      Lampa.Favorite.listener.follow('remove', function (e) {
        if (e.method !== 'id') return;
        if (isSkipPublish()) return;
        var profilesSyncTopicId = Lampa.Storage.get('dblink_profiles_sync_topic', '');
        if (!profilesSyncTopicId) return;
        Profiles.publishLocalDelta(profilesSyncTopicId, 'bookmark_remove', {
          card_id: e.card.id,
          type: e.where
        });
      });

      var lastTimecodePublish = 0;
      Lampa.Listener.follow('state:changed', function (e) {
        if (e.target !== 'timeline' || e.reason !== 'update') return;
        var profilesSyncTopicId = Lampa.Storage.get('dblink_profiles_sync_topic', '');
        if (!profilesSyncTopicId) return;

        var now = Date.now();
        if (now - lastTimecodePublish < 30000) return;
        lastTimecodePublish = now;
        var road = e.data && e.data.road;
        if (!road || !road.time) return;
        Profiles.publishLocalDelta(profilesSyncTopicId, 'timecode_update', {
          hash: e.data.hash,
          time: road.time,
          duration: road.duration || 0,
          percent: road.percent || 0
        });
      });
    }

    function setupDeviceSettingsListener() {
      var lastDevicePublish = {};
      Lampa.Storage.listener.follow('change', function (e) {
        if (!e || !e.key) return;

        if (!Profiles.isDeviceKey(e.key)) return;
        var profilesSyncTopicId = Lampa.Storage.get('dblink_profiles_sync_topic', '');
        if (!profilesSyncTopicId) return;

        var now = Date.now();
        if (lastDevicePublish[e.key] && now - lastDevicePublish[e.key] < 5000) return;
        lastDevicePublish[e.key] = now;
        var value;
        try {
          value = JSON.parse(localStorage.getItem(e.key));
        } catch (x) {
          value = localStorage.getItem(e.key);
        }
        Profiles.publishDeviceDelta(profilesSyncTopicId, 'device_setting', {
          device_id: getDeviceId(),
          key: e.key,
          value: value
        }, 'all');
      });
    }

    function autoActivateProfile() {
      var activeId = Lampa.Storage.get('dblink_active_profile', '');
      if (!activeId) return;
      var profilesTopicId = Lampa.Storage.get('dblink_profiles_topic', '');
      var profilesSyncTopicId = Lampa.Storage.get('dblink_profiles_sync_topic', '');
      if (!profilesTopicId) return;
      var client = DBLinkClient.getInstance();
      var check = setInterval(function () {
        if (document.hidden) return;
        if (client.isConnected()) {
          clearInterval(check);
          Profiles.startAutoActivation(profilesTopicId, profilesSyncTopicId);
        }
      }, 2000);

      setTimeout(function () {
        clearInterval(check);
      }, 30000);
    }

    function getProjectRef() {
      var url = Lampa.Storage.get(STORAGE_KEYS.SUPA_URL, '') || DEFAULT_SUPABASE_URL || '';
      var m = url.match(/^https?:\/\/([^.]+)\.supabase\./i);
      return m ? m[1] : '';
    }

    function copyToClipboard(text) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '0';
        ta.style.opacity = '0';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try { ta.setSelectionRange(0, text.length); } catch (e) {}
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        if (ok) return true;
      } catch (e) {}
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
          return true;
        }
      } catch (e) {}
      return false;
    }

    function showSchemaSetupModal() {
      var ref = getProjectRef();
      var sqlLink = ref ? 'https://supabase.com/dashboard/project/' + ref + '/sql/new' : 'https://supabase.com/dashboard';
      var enabledCtrl = Lampa.Controller.enabled().name;
      var html = $('<div style="padding:1em;max-width:44em">' + '<p style="margin-bottom:.6em">' + Lampa.Lang.translate('dblink_setup_intro') + '</p>' + '<pre style="white-space:pre-wrap;word-break:break-word;background:rgba(255,255,255,0.08);padding:1em;border-radius:.5em;font-size:.82em;line-height:1.4">' + escHtml(BOOTSTRAP_SQL) + '</pre>' + '<p style="opacity:.7;font-size:.85em;margin-top:.6em">' + Lampa.Lang.translate('dblink_setup_link') + '<br>' + escHtml(sqlLink) + '</p>' + '</div>');
      Lampa.Modal.open({
        title: Lampa.Lang.translate('dblink_setup_title'),
        html: html,
        size: 'medium',
        buttons: [{
          name: Lampa.Lang.translate('dblink_setup_copy'),
          onSelect: function onSelect() {
            var ok = copyToClipboard(BOOTSTRAP_SQL);
            Lampa.Noty.show(Lampa.Lang.translate(ok ? 'dblink_setup_copied' : 'dblink_setup_copy_fail'));
          }
        }, {
          name: Lampa.Lang.translate('dblink_setup_open'),
          onSelect: function onSelect() {
            try {
              if (Lampa.Utils && Lampa.Utils.openLink) Lampa.Utils.openLink(sqlLink);else window.open(sqlLink, '_blank');
            } catch (e) {
              try { window.open(sqlLink, '_blank'); } catch (e2) {}
            }
          }
        }, {
          name: Lampa.Lang.translate('dblink_setup_retry'),
          onSelect: function onSelect() {
            Lampa.Modal.close();
            Lampa.Controller.toggle(enabledCtrl);
            var c = DBLinkClient.getInstance();
            Lampa.Noty.show(Lampa.Lang.translate('dblink_test_checking'));
            c.reconnect().then(function () {
              Lampa.Noty.show(Lampa.Lang.translate('dblink_test_ok'));
              autoEnsureSyncChannel();
              try { Profiles.refreshCacheFromTelegram(); } catch (e) {}
            })["catch"](function (err) {
              if (err && err.needSetup) showSchemaSetupModal();else Lampa.Noty.show(Lampa.Lang.translate('dblink_test_fail') + ': ' + (err && err.message || ''));
            });
          }
        }, {
          name: Lampa.Lang.translate('dblink_cancel'),
          onSelect: function onSelect() {
            Lampa.Modal.close();
            Lampa.Controller.toggle(enabledCtrl);
          }
        }]
      });
    }

    function autoConnect() {
      var client = DBLinkClient.getInstance();
      if (!client.hasCredentials()) return;

      function doConnect() {
        client.connect().then(function () {
          console.log('DBLink', 'Auto-connected to Supabase.');
          autoEnsureSyncChannel();
          Profiles.refreshCacheFromTelegram();
          if (client.isEnabled('dblink_heartbeat')) client.startHeartbeat();
        })["catch"](function (err) {
          console.warn('DBLink', 'Auto-connect failed:', err && err.message);
          if (err && err.needSetup) Lampa.Noty.show(Lampa.Lang.translate('dblink_setup_needed'));
        });
      }
      if (window.appready) doConnect();else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type === 'ready') doConnect();
        });
      }
    }

    function setupBroadcastListener() {
      var client = DBLinkClient.getInstance();
      client.on('open_card', function (data) {

        Lampa.Noty.show(Lampa.Lang.translate('dblink_noty_card_received').replace('{device}', data.meta && data.meta.device_name || ''));
        if (data.payload && data.payload.card) {
          Lampa.Activity.push({
            url: '',
            title: data.payload.card.title || '',
            component: 'full',
            page: 1,
            card: data.payload.card
          });
        }
      });
      client.on('play_video', function (data) {

        if (data.payload && data.payload.media) {
          Lampa.Player.play(data.payload.media);
        }
      });
    }

    function setupBackupRestoredListener() {
      Lampa.Listener.follow('dblink_backup_restored', function (e) {

        if (e && e.restored_at) {
          Lampa.Storage.set('dblink_last_delta_seen', String(e.restored_at));
        }
      });
    }

    function addProfileHeadButton() {
      var $profileBtn = $('<div class="head__action selector open--dblink-profile" ' + 'style="display:none">' + '<div class="dblink-avatar dblink-avatar--head">?</div>' + '</div>');

      $('.open--dblink-profile').remove();

      var $headActions = $('.head__actions');
      if ($headActions.length) {
        var $fs = $headActions.find('.full--screen');
        if ($fs.length) $fs.before($profileBtn);else $headActions.prepend($profileBtn);
      } else {
        $('.head__action.open--search').after($profileBtn);
      }
      function updateProfileButton() {
        var client = DBLinkClient.getInstance();
        var activeId = Lampa.Storage.get('dblink_active_profile', '');
        var activeName = Lampa.Storage.get('dblink_active_profile_name', '');
        if (!client.hasCredentials() || !activeId || !activeName) {
          $profileBtn.hide();
          return;
        }
        $profileBtn.show();
        var $av = $profileBtn.find('.dblink-avatar');
        var avatarHtml = renderAvatar(activeName, {
          className: 'dblink-avatar dblink-avatar--head',
          style: 'width:100%;height:100%;object-fit:cover;border-radius:50%;'
        });
        $av.replaceWith(avatarHtml);
        updateConnectionIndicator();
      }

      function updateConnectionIndicator() {
        var client = DBLinkClient.getInstance();
        if (!client.hasCredentials() || $profileBtn.css('display') === 'none') {
          $profileBtn.removeAttr('data-state');
          return;
        }
        if (client.isConnected()) {
          $profileBtn.removeAttr('data-state');
        } else if (client.isConnecting()) {
          $profileBtn.attr('data-state', 'connecting');
        } else {
          $profileBtn.attr('data-state', 'disconnected');
        }
      }
      updateProfileButton();

      var connClient = DBLinkClient.getInstance();
      connClient.on('connection', function (e) {
        updateConnectionIndicator();
      });
      Lampa.Storage.listener.follow('change', function (e) {
        if (e.name === 'dblink_active_profile' || e.name === 'dblink_active_profile_name' || e.name === 'dblink_avatar_style') {
          updateProfileButton();
        }
      });

      Lampa.Listener.follow('activity', function (e) {
        if ($profileBtn.css('display') === 'none') return;

        if (e.type === 'start' && e.component === 'menu') {
          $profileBtn.hide();
        } else if (e.type === 'stop' && e.component === 'menu') {
          $profileBtn.show();
        }
      });
      $profileBtn.on('hover:enter hover:click hover:touch', function () {
        showProfileSidebar();
      });
    }

    function showProfileSidebar() {
      var client = DBLinkClient.getInstance();
      if (!client.isConnected()) {
        Lampa.Noty.show('Connect to Telegram first');
        return;
      }
      var cachedProfiles = Profiles.getCachedProfiles();
      var hasCache = cachedProfiles.length > 0;
      var enabledCtrl = Lampa.Controller.enabled().name;
      var items = [];

      items.push({
        title: Lampa.Lang.translate('dblink_create_profile') || 'Create profile',
        template: 'selectbox_icon',
        icon: '<svg width="1.4em" height="1.4em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
        _add: true
      });
      if (hasCache) {

        cachedProfiles.forEach(function (p) {
          var iconHtml = renderAvatar(p.name, {
            className: 'dblink-avatar dblink-avatar--list',
            style: 'width:2em;height:2em;object-fit:cover;'
          });
          items.push({
            title: p.name,
            template: 'selectbox_icon',
            icon: iconHtml,
            selected: p.isActive || false,
            subtitle: p.isActive ? Lampa.Lang.translate('dblink_profile_active') || 'Active' : '',
            _msgId: p.msgId,
            _name: p.name
          });
        });
      }
      Lampa.Select.show({
        title: Lampa.Lang.translate('account_profiles') || 'Profiles',
        items: items,
        onSelect: function onSelect(item) {
          if (item._add) {
            Profiles.createProfile(Lampa.Storage.get('dblink_profiles_topic', ''), Lampa.Storage.get('dblink_profiles_sync_topic', ''), $());
          } else if (item._msgId) {
            Profiles.quickSwitchProfile(item._msgId);
          }
        },
        onBack: function onBack() {
          setTimeout(function () {
            Lampa.Controller.toggle(enabledCtrl);
          }, 100);
        },
        onFullDraw: function onFullDraw(container) {
          container.append($('<div class="selectbox-item selectbox-item--icon selector">' + '<div class="selectbox-item__icon">' + '<svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' + '</div>' + '<div>' + '<div class="selectbox-item__title">' + (Lampa.Lang.translate('dblink_hub_title') || 'DBLink HUB') + '</div>' + '</div>' + '</div>').on('hover:enter', function () {
            Lampa.Activity.push({
              url: '',
              title: Lampa.Lang.translate('dblink_hub_title') || 'DBLink',
              component: 'dblink_hub',
              page: 1
            });
          }));
        }
      });
    }

    function addMenu() {
      function insert() {
        var button = $("<li class=\"menu__item selector\">\n            <div class=\"menu__ico\">\n                <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\" fill=\"currentColor\" stroke=\"none\"/>\n                    <path d=\"M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5\" stroke-width=\"1.7\"/>\n                    <path d=\"M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7\" stroke-width=\"1.7\"/>\n                </svg>\n            </div>\n            <div class=\"menu__text\">".concat(Lampa.Lang.translate('dblink_menu_title'), "</div>\n        </li>"));
        button.on('hover:enter', function () {
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('dblink_hub_title'),
            component: 'dblink_hub',
            page: 1
          });
        });
        $('.menu .menu__list').eq(0).append(button);
      }
      if (window.appready) insert();else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type === 'ready') insert();
        });
      }
    }

    if (!window.plugin_dblink_ready) startPlugin();

    return startPlugin;

})();
