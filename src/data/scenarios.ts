import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BadgeCheck,
  Gift,
  Layers,
  LineChart,
  ListChecks,
  MessageSquare,
  PackageSearch,
  Scale,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { ClarifyQuestion, CompanyOffer, ProcessStep, QueryType, Scenario } from "../types";
import { classifyQuery, norm } from "../lib/classify";
import { CATEGORIES, HERO_TEXTS, SERVICES, EXACT_PRODUCTS, type QuerySeed } from "./queries";
import {
  EARBUDS_PRODUCTS,
  GIFT_DIRECTIONS,
  GIFT_MAIN,
  HONOR_PRODUCTS,
  categoryProductsFor,
  exactProductsFor,
  serviceOffersFor,
} from "./products";

const steps = (list: [LucideIcon, string, number][]): ProcessStep[] =>
  list.map(([icon, text, duration], i) => ({ id: `s${i}`, icon, text, duration }));

/** Живая лента «Что я сейчас делаю» для каждого типа сценария */
export const PROCESS_STEPS: Record<QueryType, ProcessStep[]> = {
  exact_product: steps([
    [Sparkles, "Понимаю задачу", 1300],
    [ShoppingBag, "Проверяю наличие и цены", 1800],
    [BookOpen, "Читаю свежие обзоры", 1700],
    [Scale, "Сравниваю продавцов по надёжности", 1900],
    [ShieldCheck, "Проверяю, действительно ли это лучший вариант", 1600],
    [Wand2, "Готовлю результат", 1100],
  ]),
  category_search: steps([
    [Sparkles, "Понимаю задачу", 1200],
    [PackageSearch, "Собираю подходящие варианты", 2000],
    [BookOpen, "Читаю свежие обзоры и отзывы", 1800],
    [Scale, "Сравниваю отзывы, цены и надёжность", 1900],
    [ShieldCheck, "Проверяю, действительно ли это лучший вариант", 1500],
    [Wand2, "Готовлю результат", 1000],
  ]),
  gift_search: steps([
    [Sparkles, "Понимаю задачу", 1200],
    [Gift, "Собираю идеи под интересы", 2000],
    [LineChart, "Проверяю, что сейчас актуально дарить", 1600],
    [Scale, "Сравниваю цены и отзывы", 1700],
    [BadgeCheck, "Убираю банальные варианты", 1400],
    [Wand2, "Готовлю подборку", 1000],
  ]),
  service_search: steps([
    [Sparkles, "Понимаю задачу", 1200],
    [ListChecks, "Составила описание задачи", 1400],
    [Send, "Отправила в проверенные компании", 1600],
    [MessageSquare, "Получаю ответы", 2200],
    [Scale, "Сравниваю цены и условия", 1700],
    [ShieldCheck, "Проверяю скрытые доплаты", 1500],
    [Wand2, "Готовлю рекомендацию", 900],
  ]),
};

export const CATEGORY_QUESTIONS: ClarifyQuestion[] = [
  {
    id: "budget",
    title: "Бюджет — строгий?",
    summaryLabel: "Бюджет",
    options: [
      { id: "strict", label: "Строгий — не выше суммы" },
      { id: "flex", label: "Гибкий — ±20% допустимо" },
    ],
  },
  {
    id: "priority",
    title: "Что важнее?",
    summaryLabel: "Приоритет",
    options: [
      { id: "price", label: "Цена" },
      { id: "quality", label: "Качество" },
      { id: "balance", label: "Баланс" },
    ],
  },
  {
    id: "use",
    title: "Для чего нужно?",
    summaryLabel: "Использование",
    options: [
      { id: "home", label: "Для дома" },
      { id: "work", label: "Для работы" },
      { id: "sport", label: "Для спорта" },
      { id: "uni", label: "Универсально" },
    ],
  },
  {
    id: "pref",
    title: "Есть ли предпочтения?",
    summaryLabel: "Пожелания",
    options: [
      { id: "brands", label: "Только популярные бренды" },
      { id: "any", label: "Не важно" },
      { id: "fresh", label: "Хочу новинку" },
    ],
  },
];

export const GIFT_QUESTIONS: ClarifyQuestion[] = [
  {
    id: "who",
    title: "Кому подарок?",
    summaryLabel: "Кому",
    options: [
      { id: "bf", label: "Парню" },
      { id: "gf", label: "Девушке" },
      { id: "mom", label: "Маме" },
      { id: "dad", label: "Папе" },
      { id: "friend", label: "Другу" },
      { id: "colleague", label: "Коллеге" },
    ],
  },
  {
    id: "age",
    title: "Примерный возраст?",
    summaryLabel: "Возраст",
    options: [
      { id: "u20", label: "до 20" },
      { id: "20-30", label: "20–30" },
      { id: "30-45", label: "30–45" },
      { id: "45+", label: "45+" },
    ],
  },
  {
    id: "budget",
    title: "Какой бюджет?",
    summaryLabel: "Бюджет",
    options: [
      { id: "1000", label: "до 1 000₽" },
      { id: "3000", label: "до 3 000₽" },
      { id: "5000", label: "до 5 000₽" },
      { id: "10000", label: "до 10 000₽" },
      { id: "any", label: "Не важно" },
    ],
  },
  {
    id: "interests",
    title: "Чем человек увлекается?",
    summaryLabel: "Интересы",
    options: [
      { id: "tech", label: "Техника" },
      { id: "home", label: "Дом" },
      { id: "sport", label: "Спорт" },
      { id: "beauty", label: "Красота" },
      { id: "hobby", label: "Хобби" },
      { id: "uni", label: "Универсально" },
    ],
  },
];

export const SERVICE_QUESTIONS: ClarifyQuestion[] = [
  {
    id: "scope",
    title: "Какой формат работ?",
    summaryLabel: "Формат",
    options: [
      { id: "only", label: "Только основная работа" },
      { id: "with", label: "С отделкой и доп. работами" },
      { id: "turnkey", label: "Под ключ" },
    ],
  },
  {
    id: "when",
    title: "Когда нужно?",
    summaryLabel: "Срок",
    options: [
      { id: "asap", label: "Как можно скорее" },
      { id: "month", label: "В течение месяца" },
      { id: "look", label: "Пока смотрю цены" },
    ],
  },
  {
    id: "budget",
    title: "Ориентир по бюджету?",
    summaryLabel: "Бюджет",
    options: [
      { id: "50", label: "До 50 000₽" },
      { id: "50-100", label: "50–100 000₽" },
      { id: "100-200", label: "100–200 000₽" },
      { id: "calc", label: "Не знаю, посчитать" },
    ],
  },
  {
    id: "important",
    title: "Что важнее всего?",
    summaryLabel: "Важно",
    options: [
      { id: "price", label: "Цена" },
      { id: "time", label: "Сроки" },
      { id: "warranty", label: "Гарантия" },
      { id: "reviews", label: "Отзывы" },
    ],
  },
];

/* ─────────── hero-данные услуги «Остеклить балкон» ─────────── */

export const BALCONY_COMPANIES: CompanyOffer[] = [
  {
    id: "balkon-service",
    companyName: "БалконСервис",
    rating: 4.9,
    reviewsCount: 312,
    estimatedPrice: "68 000–84 000 ₽",
    responseTime: "за 40 минут",
    warranty: "3 года по договору",
    notes: ["Цена уже с монтажом и доставкой", "Бесплатный замер в удобное время", "Профиль и стеклопакеты — с сертификатами"],
    tags: ["Ответ быстро", "Есть гарантия", "Замер бесплатно"],
    hiddenFeesWarning: false,
    recommended: true,
  },
  {
    id: "okna-profi",
    companyName: "ОкнаПрофи",
    rating: 4.7,
    reviewsCount: 198,
    estimatedPrice: "от 61 000 ₽",
    responseTime: "за 2 часа",
    warranty: "12 месяцев",
    notes: ["В базовую цену не входит демонтаж старой рамы", "Подъём на этаж считается отдельно"],
    tags: ["Нужен выезд замерщика", "Финальная цена после осмотра"],
    hiddenFeesWarning: true,
    recommended: false,
  },
  {
    id: "teply-dom",
    companyName: "ТёплыйДом",
    rating: 4.8,
    reviewsCount: 254,
    estimatedPrice: "72 000–90 000 ₽",
    responseTime: "за 1 час",
    warranty: "24 месяца",
    notes: ["Тёплый профиль — подходит под утепление", "Рассрочка 0% на 4 месяца"],
    tags: ["Есть гарантия", "Рассрочка 0%"],
    hiddenFeesWarning: false,
    recommended: false,
  },
  {
    id: "stroy-grad",
    companyName: "СтройГрад",
    rating: 4.4,
    reviewsCount: 87,
    estimatedPrice: "от 58 000 ₽",
    responseTime: "за 3 часа",
    warranty: "6 месяцев",
    notes: ["Самая низкая базовая цена — обязательно уточните, что входит", "Отлив, подоконник и козырёк оплачиваются отдельно"],
    tags: ["Возможны скрытые доплаты", "Финальная цена после осмотра"],
    hiddenFeesWarning: true,
    recommended: false,
  },
];

export const ATTENTION_BALCONY = [
  "Некоторые компании указывают цену без монтажа — всегда уточняйте состав сметы",
  "Доставка и подъём на этаж могут быть платными",
  "Финальная цена почти всегда зависит от замера — бесплатный замер хороший признак",
  "Просите гарантию письменно: в договоре или чеке",
];

export const ATTENTION_GENERIC = [
  "Сравнивайте, что именно входит в названную цену",
  "Уточняйте, не считаются ли расходные материалы отдельно",
  "Финальную цену лучше фиксировать письменно после осмотра",
  "Гарантию просите указать в договоре или чеке",
];

const INTRO: Record<QueryType, string> = {
  exact_product: "Вижу конкретную модель. Проверю цены и надёжность продавцов — без лишних вопросов.",
  category_search: "Поняла направление. Пара уточнений — и покажу только то, что подходит.",
  gift_search: "Отличная задача. Уточню детали, чтобы подарок попал в цель.",
  service_search: "Принято. Пара вопросов — и отправлю задачу в проверенные компании.",
};

const findSeed = (list: QuerySeed[], matched: string) =>
  list.find((s) => norm(s.text) === norm(matched));

/** Собирает полный сценарий под запрос. null — если запрос не распознан. */
export function resolveScenario(raw: string): Scenario | null {
  const c = classifyQuery(raw);
  if (!c) return null;

  const hero = HERO_TEXTS[norm(c.matched)];
  const label = raw.trim().replace(/\s+/g, " ");

  const base: Scenario = {
    type: c.type,
    label,
    questions: [],
    process: PROCESS_STEPS[c.type],
    products: [],
    giftDirections: [],
    taskSummary: [],
    companies: [],
    attentionNotes: ATTENTION_GENERIC,
    intro: INTRO[c.type],
  };

  if (c.type === "exact_product") {
    if (hero === "exact_product") {
      base.products = HONOR_PRODUCTS;
    } else {
      const seed = findSeed(EXACT_PRODUCTS, c.matched);
      base.products = exactProductsFor(c.matched, seed?.art);
    }
    return base;
  }

  if (c.type === "category_search") {
    base.questions = CATEGORY_QUESTIONS;
    if (hero === "category_search") {
      base.products = EARBUDS_PRODUCTS;
    } else {
      const seed = findSeed(CATEGORIES, c.matched) ?? { text: c.matched, art: "gadget" as const };
      base.products = categoryProductsFor(seed);
    }
    return base;
  }

  if (c.type === "gift_search") {
    base.questions = GIFT_QUESTIONS;
    // отдельный набор для «Полного сравнения»: без дублей главного варианта
    base.products = [
      GIFT_MAIN,
      GIFT_DIRECTIONS[0].main,
      GIFT_DIRECTIONS[2].main,
      GIFT_DIRECTIONS[1].alternatives[0],
      GIFT_DIRECTIONS[2].alternatives[0],
    ];
    base.giftDirections = GIFT_DIRECTIONS;
    return base;
  }

  // service_search
  base.questions = SERVICE_QUESTIONS;
  if (hero === "service_search") {
    base.companies = BALCONY_COMPANIES;
    base.attentionNotes = ATTENTION_BALCONY;
  } else {
    const seed = findSeed(SERVICES, c.matched) ?? { text: c.matched, companies: undefined, priceFrom: 8000 };
    base.companies = serviceOffersFor(seed);
  }
  return base;
}

/** Примеры для дружелюбного fallback, когда запрос не распознан */
export const FALLBACK_EXAMPLES = [
  "Honor Magic 7 Pro",
  "Беспроводные наушники до 3 000₽",
  "Подарок парню на 23 февраля",
  "Остеклить балкон",
  "Ноутбук для учёбы и работы",
  "Фотограф на праздник",
];
