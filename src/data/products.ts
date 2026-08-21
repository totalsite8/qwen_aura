import type { ArtKind, CompanyOffer, GiftDirection, Product, ReliabilityCheck } from "../types";
import { genHistory, hashStr, mulberry, fmtNum } from "../lib/utils";
import type { QuerySeed } from "./queries";

let uid = 0;
const nextId = () => `p${++uid}-${Date.now().toString(36)}`;

/** Универсальный конструктор товара с правдоподобными значениями по умолчанию */
export function P(partial: Partial<Product> & Pick<Product, "title" | "price">): Product {
  const id = partial.id ?? nextId();
  const seed = hashStr(id + partial.title);
  const rnd = mulberry(seed);
  const price = partial.price;
  const checks: ReliabilityCheck[] = partial.reliabilityChecks ?? [
    { label: "Цена не выше средней за 90 дней", status: "ok" },
    { label: "Продавец с высоким рейтингом", status: "ok" },
    { label: "Много подтверждённых покупок", status: rnd() > 0.3 ? "ok" : "warn" },
    { label: "Низкий риск подделки", status: "ok" },
    { label: "Доставка с отслеживанием", status: "ok" },
  ];
  return {
    id,
    brand: partial.brand ?? "—",
    category: partial.category ?? "Подбор Aura",
    art: partial.art ?? "gadget",
    oldPrice: partial.oldPrice,
    rating: partial.rating ?? Math.round((4.2 + rnd() * 0.7) * 10) / 10,
    reviewsCount: partial.reviewsCount ?? Math.round(120 + rnd() * 2400),
    delivery: partial.delivery ?? "2–4 дня",
    warranty: partial.warranty ?? "Гарантия 1 год",
    points: partial.points ?? Math.max(30, Math.round((price * 0.028) / 10) * 10),
    features: partial.features ?? ["Проверено по отзывам", "Хит продаж в категории"],
    whySelected: partial.whySelected ?? [
      "Хорошая цена относительно рынка",
      "Высокий рейтинг по отзывам",
      "Надёжный продавец",
    ],
    priceHistory: partial.priceHistory ?? genHistory(seed, price),
    marketAverage: partial.marketAverage ?? Math.round(price * (1.04 + rnd() * 0.08)),
    reliabilityChecks: checks,
    isAuraChoice: partial.isAuraChoice ?? false,
    ...partial,
    title: partial.title,
    price,
  };
}

/* ────────────────────────── HERO: Honor Magic 7 Pro ────────────────────────── */

export const HONOR_PRODUCTS: Product[] = [
  P({
    id: "honor-magic-7-pro",
    title: "Honor Magic 7 Pro 12/512 ГБ",
    brand: "Honor",
    category: "Смартфоны",
    art: "phone",
    price: 69990,
    oldPrice: 79990,
    rating: 4.8,
    reviewsCount: 1240,
    delivery: "Завтра, бесплатно",
    warranty: "Официальная, 1 год",
    points: 2100,
    isAuraChoice: true,
    features: ["6.8″ LTPO OLED 120 Гц", "Snapdragon 8 Elite", "Камера 50 Мп с ИИ-обработкой", "5850 мА·ч, зарядка 100 Вт"],
    whySelected: [
      "Лучшая цена среди проверенных продавцов",
      "Рейтинг 4.8 — самый высокий среди предложений",
      "Официальная гарантия и чек",
      "Доставка уже завтра",
      "Минимум жалоб на брак за полгода",
    ],
    marketAverage: 74500,
    reliabilityChecks: [
      { label: "Цена на 6% ниже средней за 90 дней", status: "ok" },
      { label: "Рейтинг продавца 4.9, более 12 000 отзывов", status: "ok" },
      { label: "Много подтверждённых покупок", status: "ok" },
      { label: "Официальный ввоз — низкий риск серого импорта", status: "ok" },
      { label: "Гарантия прямо указана в объявлении", status: "ok" },
      { label: "Перед праздниками доставка может занять +1 день", status: "warn" },
    ],
  }),
  P({
    id: "honor-magic-7-pro-256",
    title: "Honor Magic 7 Pro 12/256 ГБ",
    brand: "Honor",
    category: "Смартфоны",
    art: "phone",
    price: 64990,
    oldPrice: 71990,
    rating: 4.8,
    reviewsCount: 861,
    delivery: "2–3 дня",
    warranty: "Официальная, 1 год",
    points: 1900,
    features: ["Тот же флагман, меньше памяти", "6.8″ LTPO OLED 120 Гц", "Snapdragon 8 Elite"],
    whySelected: ["Дешевле при той же начинке", "Хватает, если не храните всё в телефоне"],
  }),
  P({
    id: "honor-magic-7-pro-vitrina",
    title: "Honor Magic 7 Pro · витринный образец",
    brand: "Honor",
    category: "Смартфоны",
    art: "phone",
    price: 62490,
    rating: 4.6,
    reviewsCount: 214,
    delivery: "3–5 дней",
    warranty: "Гарантия магазина, 6 мес.",
    points: 1500,
    features: ["Состояние нового, вскрытая упаковка", "Полный комплект"],
    whySelected: ["Самая низкая цена на эту модель", "Состояние подтверждено фотографиями"],
    reliabilityChecks: [
      { label: "Состояние «как новый» подтверждено", status: "ok" },
      { label: "Гарантия короче официальной — 6 месяцев", status: "warn" },
      { label: "Продавец с высоким рейтингом", status: "ok" },
    ],
  }),
  P({
    id: "galaxy-s24-ultra",
    title: "Samsung Galaxy S24 Ultra 12/256 ГБ",
    brand: "Samsung",
    category: "Смартфоны",
    art: "phone",
    price: 92990,
    oldPrice: 104990,
    rating: 4.9,
    reviewsCount: 2103,
    delivery: "Завтра",
    warranty: "Официальная, 1 год",
    points: 2800,
    features: ["6.8″ Dynamic AMOLED 2X", "S Pen в комплекте", "Камера 200 Мп"],
    whySelected: ["Если нужен Android с лучшей камерой", "Максимальный рейтинг в классе"],
  }),
  P({
    id: "iphone-15-pro",
    title: "iPhone 15 Pro 128 ГБ",
    brand: "Apple",
    category: "Смартфоны",
    art: "phone",
    price: 87490,
    rating: 4.8,
    reviewsCount: 3210,
    delivery: "Завтра",
    warranty: "Официальная, 1 год",
    points: 2600,
    features: ["A17 Pro", "Титановый корпус", "USB-C"],
    whySelected: ["Если вы в экосистеме Apple", "Ликвидность при перепродаже"],
  }),
];

/* ────────────────────── HERO: Беспроводные наушники до 3 000₽ ────────────────────── */

export const EARBUDS_PRODUCTS: Product[] = [
  P({
    id: "moondrop-space-travel",
    title: "Moondrop Space Travel",
    brand: "Moondrop",
    category: "Наушники TWS",
    art: "earbuds",
    price: 2990,
    oldPrice: 3490,
    rating: 4.7,
    reviewsCount: 1523,
    delivery: "Завтра, бесплатно",
    warranty: "6 месяцев",
    points: 120,
    isAuraChoice: true,
    features: ["Шумоподавление −35 дБ", "9 часов с кейсом", "Bluetooth 5.3", "Защита IP54"],
    whySelected: [
      "Шумоподавление — редкость до 3 000₽",
      "4.7 — рейтинг на основе реальных отзывов",
      "Ровный звук, хвалят в обзорах",
      "Компактные, удобны для небольших ушей",
      "Продавец с подтверждёнными поставками",
    ],
    marketAverage: 3180,
    reliabilityChecks: [
      { label: "Цена на 6% ниже средней за 90 дней", status: "ok" },
      { label: "Продавец с высоким рейтингом", status: "ok" },
      { label: "Много подтверждённых покупок", status: "ok" },
      { label: "Модель популярная — бывают подделки", status: "warn" },
      { label: "Выбран продавец с проверенными поставками", status: "ok" },
    ],
  }),
  P({
    id: "soundcore-r50i",
    title: "Soundcore R50i",
    brand: "Anker",
    category: "Наушники TWS",
    art: "earbuds",
    price: 2490,
    oldPrice: 2990,
    rating: 4.6,
    reviewsCount: 2310,
    delivery: "Завтра",
    warranty: "1 год",
    points: 100,
    features: ["30 часов с кейсом", "Басы BassUp", "IPX5"],
    whySelected: ["Рекордная автономность в бюджете", "Официальная гарантия Anker"],
  }),
  P({
    id: "qcy-ht05",
    title: "QCY HT05 Melobuds ANC",
    brand: "QCY",
    category: "Наушники TWS",
    art: "earbuds",
    price: 2790,
    rating: 4.5,
    reviewsCount: 1806,
    delivery: "2–3 дня",
    warranty: "6 месяцев",
    points: 110,
    features: ["Активное шумоподавление", "6 микрофонов для звонков", "Приложение с эквалайзером"],
    whySelected: ["Лучшие звонки в этом бюджете"],
  }),
  P({
    id: "redmi-buds-6-lite",
    title: "Redmi Buds 6 Lite",
    brand: "Xiaomi",
    category: "Наушники TWS",
    art: "earbuds",
    price: 1990,
    rating: 4.4,
    reviewsCount: 954,
    delivery: "Завтра",
    warranty: "1 год",
    points: 80,
    features: ["До 38 часов с кейсом", "Лёгкие — 3.8 г", "Bluetooth 5.3"],
    whySelected: ["Самые доступные из отобранных"],
  }),
  P({
    id: "edifier-x2s",
    title: "Edifier X2s",
    brand: "Edifier",
    category: "Наушники TWS",
    art: "earbuds",
    price: 2290,
    rating: 4.5,
    reviewsCount: 1180,
    delivery: "2–4 дня",
    warranty: "1 год",
    points: 90,
    features: ["Игровой режим 60 мс", "До 28 часов", "USB-C"],
    whySelected: ["Подойдут для игр без задержки звука"],
  }),
];

/* ────────────────────────── HERO: подарок парню на 23 февраля ────────────────────────── */

const giftP = (t: string, brand: string, price: number, art: ArtKind, why: string[], feats: string[]): Product =>
  P({
    title: t,
    brand,
    category: "Подарки",
    art,
    price,
    points: Math.max(40, Math.round((price * 0.04) / 10) * 10),
    delivery: "Завтра–послезавтра",
    warranty: "Обмен 14 дней",
    whySelected: why,
    features: feats,
  });

export const GIFT_DIRECTIONS: GiftDirection[] = [
  {
    title: "Техника на каждый день",
    subtitle: "То, чем он будет пользоваться ежедневно, — не будет пылиться на полке",
    main: giftP(
      "Беспроводная зарядная станция 3-в-1",
      "Baseus",
      2790,
      "gadget",
      ["Закрывает вечную проблему разряженных устройств", "Выглядит дороже своей цены", "Универсально — подойдут любые телефоны и часы"],
      ["Телефон + часы + наушники", "До 15 Вт", "Компактная подставка"]
    ),
    alternatives: [
      giftP("Термокружка с подогревом 55°C", "Mijia", 1990, "appliance", ["Для кофе, который не остывает", "Работает от USB"], ["Держит 55°C", "5 часов от батареи"]),
      giftP("Powerbank 20 000 мА·ч с быстрой зарядкой", "Romoss", 2490, "gadget", ["Вещь, которой точно не хватает всем", "Быстрая зарядка 22.5 Вт"], ["20 000 мА·ч", "Два выхода"]),
    ],
  },
  {
    title: "Спорт и активность",
    subtitle: "Если он ходит в зал, бегает или просто любит движение",
    main: giftP(
      "Смарт-часы Amazfit Bip 5",
      "Amazfit",
      4990,
      "watch",
      ["10 дней без подзарядки", "Большой экран, уведомления и тренировки", "Выглядят спортивно и неброско"],
      ["1.91″ AMOLED", "GPS", "120+ режимов спорта"]
    ),
    alternatives: [
      giftP("Массажный пистолет Mini", "Yunmai", 3490, "gadget", ["После тренировок — самое то", "Компактный, поместится в сумку"], ["4 насадки", "Тихий мотор"]),
      giftP("Термобутылка 750 мл", "Арктика", 1590, "gadget", ["Держит тепло 12 часов", "Для зала, походов и машины"], ["Сталь", "0.75 л"]),
    ],
  },
  {
    title: "Отдых и настроение",
    subtitle: "Подарки для вечеров, друзей и хорошего настроения",
    main: giftP(
      "Портативная колонка Sony SRS-XB100",
      "Sony",
      3990,
      "speaker",
      ["Маленькая, но звучит на удивление мощно", "Не боится брызг — можно в душ и на пикник", "Бренд, за который не стыдно"],
      ["16 ч работы", "IP67", "Стереопара из двух"]
    ),
    alternatives: [
      giftP("Настольная игра «Имаджинариум»", "Cosmodrome", 2690, "gift", ["Вечер с друзьями решён", "Простые правила, смешные картинки"], ["4–7 игроков", "300 карт"]),
      giftP("Набор дрип-кофе, 10 пакетов", "Tasty Coffee", 1890, "appliance", ["Для того, кто любит кофе, но не хочет возиться", "Свежая обжарка"], ["10 × 12 г", "Разные сорта"]),
    ],
  },
];

export const GIFT_MAIN: Product = P({
  id: "gift-main-bip5",
  title: "Смарт-часы Amazfit Bip 5",
  brand: "Amazfit",
  category: "Подарки",
  art: "watch",
  price: 4990,
  oldPrice: 5990,
  rating: 4.7,
  reviewsCount: 1342,
  delivery: "Завтра",
  warranty: "Официальная, 1 год",
  points: 150,
  isAuraChoice: true,
  features: ["1.91″ AMOLED-экран", "10 дней без подзарядки", "GPS и 120+ спортивных режимов"],
  whySelected: [
    "Попадание в интересы «техника + спорт»",
    "Укладывается в бюджет с запасом",
    "Высокий рейтинг — 4.7 по 1 300+ отзывам",
    "Не банально: не носки и не пена для бритья",
    "Успеет приехать до праздника",
  ],
  marketAverage: 5400,
});

/* ────────────────────────── Генераторы для остальных запросов ────────────────────────── */

const PREMIUM = /(iphone|macbook|dyson|playstation|rog|thinkpad|imac)/i;
const MID = /(pro|ultra|max|galaxy s|wh-1000|switch|v15|x20|watch|vertuo)/i;

function priceGuess(query: string): number {
  const m = query.match(/до\s*([\d\s]+)\s*₽?/);
  if (m) return Math.round((parseInt(m[1].replace(/\s/g, ""), 10) * 0.86) / 10) * 10;
  if (PREMIUM.test(query)) return 79990 + (hashStr(query) % 25000);
  if (MID.test(query)) return 24990 + (hashStr(query) % 30000);
  return 4990 + (hashStr(query) % 22000);
}

function brandOf(title: string): string {
  const first = title.split(/\s+/)[0];
  return /^[A-Za-zА-Яа-яЁё]/.test(first) ? first.replace(/[^\p{L}\p{N}-]/gu, "") : "Aura";
}

/** Точный товар: выбранная модель + 3 правдоподобных альтернативы */
export function exactProductsFor(query: string, art?: ArtKind): Product[] {
  const price = priceGuess(query);
  const chosen = P({
    title: query,
    brand: brandOf(query),
    category: "Точный товар",
    art: art ?? "gadget",
    price,
    oldPrice: Math.round((price * 1.12) / 10) * 10,
    isAuraChoice: true,
    delivery: "Завтра, бесплатно",
    warranty: "Официальная гарантия",
    whySelected: [
      "Лучшая цена среди проверенных продавцов",
      "Высокий рейтинг по отзывам",
      "Официальная гарантия и чек",
      "Быстрая доставка",
      "Мало жалоб на брак",
    ],
    reliabilityChecks: [
      { label: "Цена не выше средней за 90 дней", status: "ok" },
      { label: "Продавец с высоким рейтингом", status: "ok" },
      { label: "Много подтверждённых покупок", status: "ok" },
      { label: "Низкий риск серого импорта", status: "ok" },
      { label: "Доставка быстрее, чем у остальных", status: "ok" },
    ],
  });
  const alts = [
    P({ title: `${query} · предыдущее поколение`, brand: chosen.brand, category: "Точный товар", art: chosen.art, price: Math.round((price * 0.78) / 10) * 10, delivery: "2–3 дня", warranty: "Официальная гарантия", whySelected: ["Дешевле, ключевые функции те же"] }),
    P({ title: `${query} · витринный образец`, brand: chosen.brand, category: "Точный товар", art: chosen.art, price: Math.round((price * 0.88) / 10) * 10, rating: 4.5, delivery: "3–5 дней", warranty: "Гарантия магазина, 6 мес.", whySelected: ["Состояние нового при меньшей цене"], reliabilityChecks: [{ label: "Состояние подтверждено фотографиями", status: "ok" }, { label: "Гарантия короче официальной", status: "warn" }, { label: "Продавец с высоким рейтингом", status: "ok" }] }),
    P({ title: `${query} · расширенная версия`, brand: chosen.brand, category: "Точный товар", art: chosen.art, price: Math.round((price * 1.15) / 10) * 10, delivery: "Завтра", warranty: "Официальная гарантия", whySelected: ["Если нужен запас памяти и функций"] }),
  ];
  return [chosen, ...alts];
}

/** Категория: выбор из сида + альтернативы */
export function categoryProductsFor(seed: QuerySeed): Product[] {
  const price = priceGuess(seed.text);
  const chosen = P({
    title: seed.chosenTitle ?? seed.text,
    brand: brandOf(seed.chosenTitle ?? seed.text),
    category: "Категория",
    art: seed.art ?? "gadget",
    price,
    oldPrice: Math.round((price * 1.1) / 10) * 10,
    isAuraChoice: true,
    delivery: "Завтра–послезавтра",
    whySelected: [
      "Лучшее соотношение цены и качества в подборке",
      "Высокий рейтинг по реальным отзывам",
      "Проверенный продавец",
      "Укладывается в бюджет",
    ],
  });
  const alts = (seed.altTitles ?? []).map((t, i) => {
    const k = [0.88, 1.05, 0.75, 1.18][i % 4];
    return P({
      title: t,
      brand: brandOf(t),
      category: "Категория",
      art: seed.art ?? "gadget",
      price: Math.round((price * k) / 10) * 10,
      delivery: i % 2 ? "Завтра" : "2–4 дня",
      whySelected: ["Хорошая альтернатива по отзывам"],
    });
  });
  return [chosen, ...alts];
}

/** Услуги: 4 предложения компаний */
export function serviceOffersFor(seed: QuerySeed): CompanyOffer[] {
  const names = seed.companies ?? ["ПрофиМастер", "МастерДом", "СервисГрупп"];
  const base = seed.priceFrom ?? 10000;
  const rnd = mulberry(hashStr(seed.text));
  const priceK = [1, 0.93, 1.16, 1.28];
  const times = ["за 35 минут", "за 1 час", "за 2 часа", "за 3 часа"];
  const warranty = ["3 года", "12 месяцев", "24 месяца", "6 месяцев"];
  return names.map((name, i) => {
    const p = Math.round((base * priceK[i % 4]) / 100) * 100;
    const p2 = Math.round((p * (1.12 + rnd() * 0.1)) / 100) * 100;
    const hidden = i === 1 || i === 3;
    const rec = i === 0;
    return {
      id: `c${i}-${name}`,
      companyName: name,
      rating: Math.round((4.9 - i * 0.17 - rnd() * 0.1) * 10) / 10,
      reviewsCount: Math.round(80 + rnd() * 420),
      estimatedPrice: p2 !== p ? `${fmtNum(p)}–${fmtNum(p2)} ${seed.unit ?? "₽"}` : `от ${fmtNum(p)} ${seed.unit ?? "₽"}`,
      responseTime: times[i % 4],
      warranty: warranty[i % 4],
      notes: hidden
        ? [
            "В базовую цену могут быть не включены расходные материалы",
            "Доставка и подъём считаются отдельно",
            "Финальная цена — после осмотра",
          ]
        : [
            rec ? "Цена с монтажом и доставкой — без сюрпризов" : "Основные работы включены в цену",
            "Бесплатный выезд для оценки",
          ],
      tags: rec
        ? ["Ответ быстро", "Есть гарантия", "Выезд бесплатно"]
        : hidden
          ? ["Возможны скрытые доплаты", "Финальная цена после осмотра"]
          : ["Есть гарантия", "Нужен выезд замерщика"],
      hiddenFeesWarning: hidden,
      recommended: rec,
    };
  });
}
