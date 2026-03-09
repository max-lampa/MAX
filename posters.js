// === РЕГИСТРАЦИЯ НАСТРОЕК КАРТОЧЕК ===

// 1. Добавляем языковые строки (опционально, но для красоты)
Lampa.Lang.add({
  lampac_cards_title: {
    ru: 'Карточки',
    en: 'Cards',
    uk: 'Картки',
  },
  // Можно добавить и другие строки, но для простоты используем русские названия напрямую
});

// 2. Иконка для раздела (можно использовать любую SVG)
var CARD_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/></svg>';

// 3. Создаём родительский компонент "Оформление", если его ещё нет
if (!Lampa.SettingsApi.components['theme']) {
  Lampa.SettingsApi.addComponent({
    component: 'theme',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67a.528.528 0 01-.13-.33c0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zM5.5 12c-.83 0-1.5-.67-1.5-1.5S4.67 9 5.5 9 7 9.67 7 10.5 6.33 12 5.5 12zm3-4C7.67 8 7 7.33 7 6.5S7.67 5 8.5 5s1.5.67 1.5 1.5S9.33 8 8.5 8zm7 0c-.83 0-1.5-.67-1.5-1.5S14.67 5 15.5 5s1.5.67 1.5 1.5S16.33 8 15.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    name: 'Оформление',
  });
}

// 4. Добавляем пустые шаблоны для вложенных разделов (нужны для открытия подразделов)
if (window.Lampa && Lampa.Template && Lampa.Template.add) {
  Lampa.Template.add('settings_theme_cards_badges', '<div></div>');
  Lampa.Template.add('settings_theme_cards_text', '<div></div>');
  Lampa.Template.add('settings_theme_cards_style', '<div></div>');
  Lampa.Template.add('settings_theme_cards_grid', '<div></div>');
}

// 5. Создаём компонент "Карточки" внутри "Оформления"
Lampa.SettingsApi.addComponent({
  component: 'theme_cards',
  icon: CARD_ICON,
  name: 'Карточки',
});

// 6. Функция для открытия подразделов (используется в кнопках)
function openCardSection(name) {
  if (!name || !window.Lampa || !Lampa.Settings || !Lampa.Settings.create) return;
  setTimeout(function () {
    Lampa.Settings.create(name, {
      onBack: function () {
        Lampa.Settings.create('theme_cards');
      }
    });
  }, 0);
}

// 7. Добавляем заголовок и кнопки для переходов в подразделы
Lampa.SettingsApi.addParam({
  component: 'theme_cards',
  param: { type: 'title' },
  field: { name: 'Разделы настроек' },
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards',
  param: { name: 'lampac_open_cards_badges', type: 'button' },
  field: { name: 'Бейджи и статус', description: 'Качество, рейтинг, просмотренное' },
  onChange: function () { openCardSection('theme_cards_badges'); },
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards',
  param: { name: 'lampac_open_cards_text', type: 'button' },
  field: { name: 'Текст и постеры', description: 'Название, размер текста, год, карточки без постера' },
  onChange: function () { openCardSection('theme_cards_text'); },
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards',
  param: { name: 'lampac_open_cards_style', type: 'button' },
  field: { name: 'Стиль карточек', description: 'Скругление и внешний вид рейтинга' },
  onChange: function () { openCardSection('theme_cards_style'); },
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards',
  param: { name: 'lampac_open_cards_grid', type: 'button' },
  field: { name: 'Сетка и фокус', description: 'Плотность сетки и увеличение карточек' },
  onChange: function () { openCardSection('theme_cards_grid'); },
});

// ===== Подраздел "Бейджи и статус" =====
Lampa.SettingsApi.addParam({
  component: 'theme_cards_badges',
  param: {
    name: 'lampac_card_quality',
    type: 'select',
    values: { show: 'Показывать', hide: 'Скрыть' },
    default: 'show',
  },
  field: { name: 'Бейдж качества', description: 'Значки 4K, HD на постере' },
  onChange: applyCardDisplay,
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards_badges',
  param: {
    name: 'lampac_card_vote',
    type: 'select',
    values: { show: 'Показывать', hide: 'Скрыть' },
    default: 'show',
  },
  field: { name: 'Рейтинг', description: 'Оценка на постере' },
  onChange: applyCardDisplay,
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards_badges',
  param: {
    name: 'lampac_card_hide_viewed',
    type: 'select',
    values: { off: 'Выключить', on: 'Включить' },
    default: 'off',
  },
  field: { name: 'Скрыть просмотренные', description: 'Не показывать карточки с маркером просмотра' },
  onChange: applyCardDisplay,
});

// ===== Подраздел "Текст и постеры" =====
Lampa.SettingsApi.addParam({
  component: 'theme_cards_text',
  param: {
    name: 'lampac_card_title',
    type: 'select',
    values: { show: 'Показывать', hide: 'Скрыть' },
    default: 'show',
  },
  field: { name: 'Название', description: 'Текст названия под карточкой' },
  onChange: applyCardDisplay,
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards_text',
  param: {
    name: 'lampac_card_title_size',
    type: 'select',
    values: { small: 'Маленький', normal: 'Обычный', large: 'Большой' },
    default: 'normal',
  },
  field: { name: 'Размер названия', description: 'Размер шрифта названия' },
  onChange: applyCardDisplay,
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards_text',
  param: {
    name: 'lampac_card_year',
    type: 'select',
    values: { show: 'Показывать', focus: 'Только при фокусе', hide: 'Скрыть' },
    default: 'show',
  },
  field: { name: 'Год выхода', description: 'Год под названием' },
  onChange: applyCardDisplay,
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards_text',
  param: {
    name: 'lampac_card_no_poster',
    type: 'select',
    values: { show: 'Показывать как есть', hide: 'Скрыть без постера', fallback: 'Подставлять fallback' },
    default: 'fallback',
  },
  field: { name: 'Карточки без постера', description: 'Скрытие или единая заглушка' },
  onChange: applyCardDisplay,
});

// ===== Подраздел "Стиль карточек" =====
Lampa.SettingsApi.addParam({
  component: 'theme_cards_style',
  param: {
    name: 'lampac_card_vote_style',
    type: 'select',
    values: { 'default': 'Стандартный', pill: 'Таблетка', colored: 'Цветной' },
    default: 'default',
  },
  field: { name: 'Стиль рейтинга', description: 'Внешний вид значка рейтинга' },
  onChange: applyCardDisplay,
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards_style',
  param: {
    name: 'lampac_card_radius',
    type: 'select',
    values: { small: 'Малое', medium: 'Среднее', large: 'Большое', round: 'Максимальное' },
    default: 'medium',
  },
  field: { name: 'Скругление углов', description: 'Радиус скругления постера' },
  onChange: applyCardDisplay,
});

// ===== Подраздел "Сетка и фокус" =====
Lampa.SettingsApi.addParam({
  component: 'theme_cards_grid',
  param: {
    name: 'lampac_card_density',
    type: 'select',
    values: { compact: 'Компакт', balance: 'Баланс', large: 'Крупно' },
    default: 'balance',
  },
  field: { name: 'Плотность сетки', description: 'Визуальная плотность карточек в рядах' },
  onChange: applyCardDisplay,
});

Lampa.SettingsApi.addParam({
  component: 'theme_cards_grid',
  param: {
    name: 'lampac_card_focus_scale',
    type: 'select',
    values: { soft: 'Мягкий', normal: 'Нормальный', strong: 'Сильный', xstrong: 'Очень сильный' },
    default: 'normal',
  },
  field: { name: 'Увеличение при фокусе', description: 'Плавное увеличение карточки при наведении/фокусе' },
  onChange: applyCardDisplay,
});