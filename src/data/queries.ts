import type { ArtKind, QueryType } from "../types";

export interface QuerySeed {
  text: string;
  /** правдоподобный «Выбор Aura» для категорий */
  chosenTitle?: string;
  altTitles?: string[];
  art?: ArtKind;
  /** названия компаний для услуг */
  companies?: string[];
  priceFrom?: number;
  unit?: string;
}

/** 20 точных товаров */
export const EXACT_PRODUCTS: QuerySeed[] = [
  { text: "Honor Magic 7 Pro", art: "phone" },
  { text: "iPhone 16 Pro 256GB", art: "phone" },
  { text: "AirPods Pro 3", art: "earbuds" },
  { text: "Sony WH-1000XM5", art: "headphones" },
  { text: "Samsung Galaxy S24 Ultra", art: "phone" },
  { text: "MacBook Air M3 13", art: "laptop" },
  { text: "PlayStation 5 Slim", art: "console" },
  { text: "Nintendo Switch OLED", art: "console" },
  { text: "Dyson V15 Detect", art: "vacuum" },
  { text: "Xiaomi Robot Vacuum X20+", art: "vacuum" },
  { text: "Kindle Paperwhite 2024", art: "gadget" },
  { text: "GoPro Hero 12 Black", art: "camera" },
  { text: "Samsung Galaxy Watch 6", art: "watch" },
  { text: "JBL Charge 5", art: "speaker" },
  { text: "Logitech MX Master 3S", art: "gadget" },
  { text: "ASUS ROG Ally", art: "console" },
  { text: "Anker PowerCore 20000", art: "gadget" },
  { text: "Bosch GBH 2-26 DRE", art: "tool" },
  { text: "Tefal OptiGrill Elite", art: "appliance" },
  { text: "Nespresso Vertuo Next", art: "appliance" },
];

/** 20 категорий / направлений */
export const CATEGORIES: QuerySeed[] = [
  {
    text: "Беспроводные наушники до 3 000₽",
    chosenTitle: "Moondrop Space Travel",
    altTitles: ["Soundcore R50i", "QCY HT05 Melobuds ANC", "Redmi Buds 6 Lite", "Edifier X2s"],
    art: "earbuds",
  },
  {
    text: "Мини-ПК для домашнего сервера",
    chosenTitle: "Beelink SER5 Max 5800H",
    altTitles: ["GMKtec NucBox K6", "Minisforum UM690", "ASUS PN63-S1"],
    art: "gadget",
  },
  {
    text: "Ноутбук для учёбы и работы",
    chosenTitle: "ASUS Vivobook 15 OLED",
    altTitles: ["Lenovo IdeaPad Slim 5", "HP Pavilion 15", "Honor MagicBook X16"],
    art: "laptop",
  },
  {
    text: "Робот-пылесос для шерсти животных",
    chosenTitle: "Roborock Q7",
    altTitles: ["Xiaomi Robot Vacuum S12", "Dreame D10 Plus", "Ecovacs Deebot N8"],
    art: "vacuum",
  },
  {
    text: "Смартфон до 20 000₽",
    chosenTitle: "Redmi Note 14",
    altTitles: ["Realme C67", "Tecno Spark 20 Pro", "Samsung Galaxy A16"],
    art: "phone",
  },
  {
    text: "Механическая клавиатура для печати",
    chosenTitle: "Keychron K8 Pro",
    altTitles: ["Royal Kludge RK87", "Akko 3087 Plus", "ZET Gaming Key"],
    art: "gadget",
  },
  {
    text: "Монитор 27 дюймов для работы",
    chosenTitle: "LG UltraGear 27 4K",
    altTitles: ["Samsung Odyssey G5", "AOC Q27G2S", "MSI PRO MP273"],
    art: "gadget",
  },
  {
    text: "Портативная колонка для вечеринок",
    chosenTitle: "JBL Flip 6",
    altTitles: ["Sony SRS-XB100", "Anker Soundcore 3", "Marshall Willen"],
    art: "speaker",
  },
  {
    text: "Электросамокат для города",
    chosenTitle: "Ninebot F2 Plus",
    altTitles: ["Kugoo G-Max 2", "Xiaomi Electric Scooter 4", "Hoverbot S2"],
    art: "gadget",
  },
  {
    text: "Кофемашина для дома",
    chosenTitle: "DeLonghi Magnifica S",
    altTitles: ["Philips Series 2200", "Krups Evidence", "Polaris PACM 2080"],
    art: "appliance",
  },
  {
    text: "Увлажнитель воздуха для спальни",
    chosenTitle: "Xiaomi Smart Humidifier 2",
    altTitles: ["Polaris PUH 9090", "Electrolux EHU-3815D", "Boneco U200"],
    art: "appliance",
  },
  {
    text: "Игровое кресло",
    chosenTitle: "Cougar Armor One",
    altTitles: ["ThunderX3 EC3", "ZONE 51 Rush", "Anderon G-05"],
    art: "home",
  },
  {
    text: "Внешний SSD на 1 ТБ",
    chosenTitle: "Samsung T7 Shield",
    altTitles: ["SanDisk Extreme Portable", "Kingston XS1000", "WD My Passport SSD"],
    art: "gadget",
  },
  {
    text: "Фен для волос с ионизацией",
    chosenTitle: "Laifen Swift",
    altTitles: ["Remington ProLuxe", "Philips 5000 Series", "DEWAL 03-100"],
    art: "appliance",
  },
  {
    text: "Умные часы для спорта",
    chosenTitle: "Amazfit GTR 4",
    altTitles: ["Huawei Watch GT 4", "CMF Watch Pro", "Garmin Forerunner 55"],
    art: "watch",
  },
  {
    text: "Телевизор 55 дюймов",
    chosenTitle: "TCL 55C805",
    altTitles: ["Hisense 55U7KQ", "Xiaomi TV A Pro 55", "Samsung Q60C"],
    art: "home",
  },
  {
    text: "Bluetooth-гарнитура для работы",
    chosenTitle: "Jabra Talk 45",
    altTitles: ["Plantronics Voyager 5200", "Hoco E89", "QCY T13 ANC"],
    art: "earbuds",
  },
  {
    text: "Настольная лампа для учёбы",
    chosenTitle: "Yeelight LED Lamp Pro",
    altTitles: ["Gauss G1.5", "Uniel TLD-520", "Camelion KD-308"],
    art: "home",
  },
  {
    text: "Рюкзак для ноутбука 15.6",
    chosenTitle: "Xiaomi Mi City Backpack 2",
    altTitles: ["Thule EnRoute", "Wenger 600645", "Case Logic Notion"],
    art: "gadget",
  },
  {
    text: "Электробритва для чувствительной кожи",
    chosenTitle: "Braun Series 5",
    altTitles: ["Philips Shaver 3000", "Panasonic ES-RT37", "Braun Series 3 ProSkin"],
    art: "appliance",
  },
];

/** 20 подарочных запросов */
export const GIFTS: QuerySeed[] = [
  { text: "Подарок парню на 23 февраля" },
  { text: "Что подарить маме на день рождения" },
  { text: "Подарок другу-геймеру до 5 000₽" },
  { text: "Подарок девушке на 8 марта" },
  { text: "Подарок папе на день рождения" },
  { text: "Подарок коллеге на Новый год" },
  { text: "Подарок бабушке" },
  { text: "Подарок подростку 14 лет" },
  { text: "Подарок учителю" },
  { text: "Подарок на новоселье" },
  { text: "Подарок жене на годовщину" },
  { text: "Подарок брату на 30 лет" },
  { text: "Подарок подруге на день рождения" },
  { text: "Подарок тренеру" },
  { text: "Подарок на 1 сентября" },
  { text: "Подарок врачу" },
  { text: "Подарок на свадьбу" },
  { text: "Подарок дедушке" },
  { text: "Подарок руководителю" },
  { text: "Подарок на выписку из роддома" },
];

/** 20 услуг */
export const SERVICES: QuerySeed[] = [
  { text: "Остеклить балкон", companies: ["БалконСервис", "ОкнаПрофи", "ТёплыйДом", "СтройГрад"], priceFrom: 58000, unit: "₽" },
  { text: "Организовать переезд с грузчиками", companies: ["Переезд-Сервис", "Грузчики 24", "Аккуратный переезд"], priceFrom: 6000, unit: "₽" },
  { text: "Фотограф на праздник", companies: ["СветМомент", "Студия Кадр", "Анна Крылова"], priceFrom: 7000, unit: "₽/час" },
  { text: "Ремонт квартиры под ключ", companies: ["СтройМастер", "РемонтПро", "Первая бригада"], priceFrom: 240000, unit: "₽" },
  { text: "Установка кондиционера", companies: ["КлиматКонтроль", "МастерХолод", "ПрофВент"], priceFrom: 5500, unit: "₽" },
  { text: "Генеральная уборка квартиры", companies: ["ЧистоДом", "Уборка Про", "Феи чистоты"], priceFrom: 4500, unit: "₽" },
  { text: "Сборка мебели", companies: ["Мастер на час", "МебельСервис", "Сборка24"], priceFrom: 2500, unit: "₽" },
  { text: "Натяжные потолки", companies: ["Потолок №1", "НебоПро", "МастерПотолок"], priceFrom: 12000, unit: "₽" },
  { text: "Замена электропроводки", companies: ["ЭлектроМастер", "Вольтаж", "ТокПро"], priceFrom: 18000, unit: "₽" },
  { text: "Утепление балкона", companies: ["ТеплоРад", "УютСтрой", "БалконМастер"], priceFrom: 25000, unit: "₽" },
  { text: "Косметический ремонт кухни", companies: ["КухняСервис", "РемонтПрофи", "Мастера"], priceFrom: 40000, unit: "₽" },
  { text: "Установка межкомнатных дверей", companies: ["ДверьМастер", "Двери24", "ИнтерьерПрофи"], priceFrom: 4000, unit: "₽/дверь" },
  { text: "Чистка кондиционера", companies: ["КлиматКлин", "КулСервис", "МастерХолод"], priceFrom: 2500, unit: "₽" },
  { text: "Видеонаблюдение для дачи", companies: ["ОкоГард", "ВидеоПро", "СейфТех"], priceFrom: 15000, unit: "₽" },
  { text: "Свадебный стилист", companies: ["Образ Невесты", "СтильСвадьба", "Марина Елагина"], priceFrom: 8000, unit: "₽" },
  { text: "Репетитор по математике", companies: ["Школа Максимума", "РепетиторПро", "Елена Викторовна"], priceFrom: 1200, unit: "₽/час" },
  { text: "Курьерская доставка подарка", companies: ["ДоставкаБыстро", "КурьерСервис", "Флэш Кэт"], priceFrom: 600, unit: "₽" },
  { text: "Шиномонтаж с выездом", companies: ["КолесоСервис", "Шина24", "МобильныйШиномонтаж"], priceFrom: 2000, unit: "₽" },
  { text: "Бурение скважины на воду", companies: ["АкваБур", "СкважинаСтрой", "ВодаБур"], priceFrom: 90000, unit: "₽" },
  { text: "Установка забора из профнастила", companies: ["ЗаборСтрой", "ФэнсПрофи", "МеталлГрад"], priceFrom: 45000, unit: "₽" },
];

export const ALL_LISTS: { type: QueryType; items: QuerySeed[] }[] = [
  { type: "exact_product", items: EXACT_PRODUCTS },
  { type: "category_search", items: CATEGORIES },
  { type: "gift_search", items: GIFTS },
  { type: "service_search", items: SERVICES },
];

/** Hero-запросы, для которых данные проработаны вручную */
export const HERO_TEXTS: Record<string, QueryType> = {
  "honor magic 7 pro": "exact_product",
  "беспроводные наушники до 3 000₽": "category_search",
  "беспроводные наушники до 3000₽": "category_search",
  "подарок парню на 23 февраля": "gift_search",
  "остеклить балкон": "service_search",
};
