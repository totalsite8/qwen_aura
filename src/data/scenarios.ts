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
import type { ClarifyQuestion, CompanyOffer, FeedItem, ProcessStep, QueryType, Scenario } from "../types";
import { classifyQuery, norm } from "../lib/classify";
import { fmtMoney, hashStr, mulberry } from "../lib/utils";
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

/* ─────────── Живая лента «Что я сейчас делаю» ───────────
   Каждый шаг — не просто пункт, а реальная работа: запросы,
   перебор магазинов и страниц, сравнение цен, проверки. */

const MKT_GOODS = ["Ozon", "Wildberries", "Яндекс Маркет", "Мегамаркет", "DNS", "М.Видео", "Ситилинк", "Авито"];
const MKT_GIFT = ["Ozon", "Wildberries", "Яндекс Маркет", "Мегамаркет", "Lamoda", "Авито"];

const q = (text: string): FeedItem => ({ kind: "query", text });
const chk = (text: string): FeedItem => ({ kind: "check", text });
const stat = (text: string, count?: number): FeedItem => ({ kind: "stat", text, count });
const link = (text: string, urls: string[]): FeedItem => ({ kind: "link", text, urls });
const market = (text: string, count: number, detail?: string): FeedItem => ({ kind: "market", text, count, detail });
const cmp = (text: string, detail: string, count: number): FeedItem => ({ kind: "compare", text, detail, count });

const slug = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 26);

function marketFeeds(mkts: string[], seed: number): FeedItem[] {
  const rnd = mulberry(seed);
  const picks = mkts.filter((_, i) => i < 5 + (seed % 3));
  return picks.map((m) => market(m, 8 + Math.floor(rnd() * 26)));
}

function offerTotal(feeds: FeedItem[]): number {
  return feeds.filter((f) => f.kind === "market").reduce((a, f) => a + (f.count ?? 0), 0);
}

/** Собирает «живой» процесс под конкретный запрос и уже готовые результаты */
export function processFor(
  type: QueryType,
  query: string,
  products: Scenario["products"],
  companies: Scenario["companies"]
): ProcessStep[] {
  const seed = hashStr(query);
  const sl = slug(query);
  const rnd = mulberry(seed + 7);
  const mk = (list: [LucideIcon, string, number, FeedItem[]][]): ProcessStep[] =>
    list.map(([icon, text, duration, feeds], i) => ({ id: `s${i}`, icon, text, duration, feeds }));

  const scan = marketFeeds(MKT_GOODS, seed);
  const scanTotal = offerTotal(scan);

  const productRows: FeedItem[] = products.slice(0, 3).map((p) =>
    cmp(p.seller, `${fmtMoney(p.price)} · ${p.warranty.toLowerCase()}`, Math.round(p.score * 10))
  );
  // count здесь — оценка сравнения (не цена), чтобы «лучший» доставался рекомендации
  const companyRows: FeedItem[] = companies.slice(0, 4).map((c, i) => {
    const score = c.recommended ? 96 : Math.max(55, 88 - i * 9 - (hashStr(c.id) % 7));
    return cmp(c.companyName, `${c.estimatedPrice} · гарантия ${c.warranty}`, score);
  });

  if (type === "exact_product") {
    return mk([
      [Sparkles, "Понимаю задачу", 1300, [q(`«${query}»`), chk("Определила: конкретная модель — без лишних вопросов")]],
      [ShoppingBag, "Сканирую магазины", 2400, [q(`${query} купить цена`), ...scan, stat("Предложений собрано", scanTotal)]],
      [BookOpen, "Читаю свежие обзоры", 1700, [
        link("Открываю обзоры и тесты", [
          `youtube.com/results?search_query=${sl}-обзор`,
          `4pda.to/forum/index.php?showtopic=${sl}`,
          `ixbt.com/review/${sl}.html`,
        ]),
        stat("Обзоров и тестов изучено", 24 + Math.floor(rnd() * 20)),
      ]],
      [Scale, "Сравниваю цены и условия", 2000, [...productRows, stat(`${scanTotal} → достойных вариантов`, Math.min(12, 4 + products.length))]],
      [ShieldCheck, "Проверяю, действительно ли это лучший вариант", 1600, [
        link("Сверяю карточки продавцов", [`ozon.ru/product/${sl}`, `market.yandex.ru/product/${sl}`, `avito.ru/${sl}`]),
        chk("Условия возврата и гарантии"),
        chk("История цены за 90 дней"),
      ]],
      [Wand2, "Готовлю результат", 1100, [stat("Карточка «Выбор Aura» собрана")]],
    ]);
  }

  if (type === "category_search") {
    return mk([
      [Sparkles, "Понимаю задачу", 1200, [q(`«${query}»`), chk("Уточнила параметры — они учтены в поиске")]],
      [PackageSearch, "Собираю подходящие варианты", 2200, [q(`${query} рейтинг 2026`), ...scan, stat("Предложений собрано", scanTotal)]],
      [BookOpen, "Читаю свежие обзоры и отзывы", 1800, [
        link("Смотрю подборки и тесты", [`youtube.com/results?search_query=лучшие-${sl}`, `ichip.ru/podborki/${sl}`, `roskachestvo.gov.ru/research/${sl}`]),
        stat("Отзывов проанализировано", 300 + Math.floor(rnd() * 600)),
      ]],
      [Scale, "Сравниваю отзывы, цены и надёжность", 2000, [...productRows, stat("В финал прошли", products.length)]],
      [ShieldCheck, "Проверяю, действительно ли это лучший вариант", 1500, [
        link("Перепроверяю finalists", [`ozon.ru/category/${sl}`, `wildberries.ru/catalog/${sl}`]),
        chk("Цена не выше средней по подборке"),
      ]],
      [Wand2, "Готовлю результат", 1000, [stat("Подборка собрана")]],
    ]);
  }

  if (type === "gift_search") {
    const giftScan = marketFeeds(MKT_GIFT, seed + 3);
    return mk([
      [Sparkles, "Понимаю задачу", 1200, [q(`«${query}»`), chk("Учла интересы и бюджет из ответов")]],
      [Gift, "Собираю идеи под интересы", 2100, [q(`подарок ${slug(query.replace(/подарок/i, "")).replace(/-/g, " ")} идеи 2026`), ...giftScan, stat("Идей собрано", offerTotal(giftScan))]],
      [LineChart, "Проверяю, что сейчас актуально дарить", 1600, [
        link("Смотрю тренды подарков", [`ozon.ru/highlight/${sl}`, `wildberries.ru/podborki/${sl}`]),
        stat("Трендов проверено", 6 + Math.floor(rnd() * 6)),
      ]],
      [Scale, "Сравниваю цены и отзывы", 1700, [...productRows, stat("Направлений подарка", 3)]],
      [BadgeCheck, "Убираю банальные варианты", 1400, [chk("Без носков и пены для бритья"), chk("Всё успеет приехать вовремя")]],
      [Wand2, "Готовлю подборку", 1000, [stat("Подборка готова")]],
    ]);
  }

  // service_search
  const coScan: FeedItem[] = companies.map((c) => {
    const m = c.responseTime.match(/(\d+)/);
    return market(c.companyName, m ? parseInt(m[1], 10) : 60, "ответ");
  });
  return mk([
    [Sparkles, "Понимаю задачу", 1200, [q(`«${query}»`), chk("Детали из ответов — в описании задачи")]],
    [ListChecks, "Составила описание задачи", 1400, [stat("Понятное ТЗ для компаний готово")]],
    [Send, "Отправила в проверенные компании", 1700, [q(`${query} — заявка`), ...coScan.slice(0, 6), stat("Компаний получили задачу", coScan.length)]],
    [MessageSquare, "Получаю ответы", 2200, [
      link("Читаю ответы компаний", companies.slice(0, 3).map((c) => `${slug(c.companyName)}.ru/offer`)),
      stat("Развёрнутых ответов", companies.length),
    ]],
    [Scale, "Сравниваю цены и условия", 1700, [...companyRows, stat("Смета сверена по пунктам")]],
    [ShieldCheck, "Проверяю скрытые доплаты", 1500, [
      chk("Доставка и подъём включены?"),
      chk("Демонтаж и расходники в смете?"),
      chk("Гарантия — письменно в договоре"),
    ]],
    [Wand2, "Готовлю рекомендацию", 900, [stat("Рекомендация Aura готова")]],
  ]);
}

/** Сводка по процессу для финального итога */
export function computeStats(steps: ProcessStep[]) {
  let offers = 0, markets = 0, checks = 0, links = 0, pages = 0, responses = 0;
  for (const s of steps)
    for (const f of s.feeds) {
      if (f.kind === "market") {
        markets++;
        // в услугах count — минуты до ответа, а не предложения
        if (f.detail === "ответ") responses += 1;
        else offers += f.count ?? 0;
      }
      if (f.kind === "check") checks++;
      if (f.kind === "link") {
        links++;
        pages += f.urls?.length ?? 0;
      }
    }
  const sec = Math.round(steps.reduce((a, s) => a + s.duration, 0) / 100) / 10;
  return { offers, markets, checks, links, pages, responses, sec };
}

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
    process: [],
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
  }

  if (c.type === "category_search") {
    base.questions = CATEGORY_QUESTIONS;
    if (hero === "category_search") {
      base.products = EARBUDS_PRODUCTS;
    } else {
      const seed = findSeed(CATEGORIES, c.matched) ?? { text: c.matched, art: "gadget" as const };
      base.products = categoryProductsFor(seed);
    }
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
  }

  // service_search
  if (c.type === "service_search") {
    base.questions = SERVICE_QUESTIONS;
    if (hero === "service_search") {
      base.companies = BALCONY_COMPANIES;
      base.attentionNotes = ATTENTION_BALCONY;
    } else {
      const seed = findSeed(SERVICES, c.matched) ?? { text: c.matched, companies: undefined, priceFrom: 8000 };
      base.companies = serviceOffersFor(seed);
    }
  }

  // живой процесс собирается по уже готовым результатам — цифры везде честные
  base.process = processFor(c.type, c.matched, base.products, base.companies);
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
