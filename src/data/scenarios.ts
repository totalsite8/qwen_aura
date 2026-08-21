import {
  BookOpen,
  Gift,
  Layers,
  LineChart,
  ListChecks,
  Radar,
  Scale,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { ClarifyQuestion, CompanyOffer, FeedItem, Lane, ProcessPlan, QueryType, Scenario } from "../types";
import { classifyQuery, norm } from "../lib/classify";
import { fmtMoney, fmtNum, hashStr, mulberry } from "../lib/utils";
import { CATEGORIES, EXACT_PRODUCTS, HERO_TEXTS, SERVICES, type QuerySeed } from "./queries";
import {
  EARBUDS_PRODUCTS,
  GIFT_DIRECTIONS,
  GIFT_MAIN,
  HONOR_PRODUCTS,
  categoryProductsFor,
  exactProductsFor,
  serviceOffersFor,
} from "./products";

/* ─────────── Команда Aura: параллельные дорожки специалистов ───────────
   Пока пользователь смотрит, несколько специалистов одновременно
   серфят сеть: запросы, магазины, страницы, проверки — у каждого свой поток. */

const MKT_GOODS = ["Ozon", "Wildberries", "Яндекс Маркет", "Мегамаркет", "DNS", "М.Видео", "Ситилинк", "Авито"];
const MKT_GIFT = ["Ozon", "Wildberries", "Яндекс Маркет", "Мегамаркет", "Lamoda", "Авито"];

const q = (text: string): FeedItem => ({ kind: "query", text });
const chk = (text: string): FeedItem => ({ kind: "check", text });
const stat = (text: string, count?: number): FeedItem => ({ kind: "stat", text, count });
const link = (text: string, urls: string[]): FeedItem => ({ kind: "link", text, urls });
const market = (text: string, count: number, detail?: string): FeedItem => ({ kind: "market", text, count, detail });
const cmp = (text: string, detail: string, count: number, best = false): FeedItem => ({
  kind: "compare",
  text,
  detail,
  count,
  best,
});

const slug = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 26);

function marketFeeds(mkts: string[], seed: number): FeedItem[] {
  const rnd = mulberry(seed);
  const picks = mkts.filter((_, i) => i < 5 + (seed % 3));
  return picks.map((m) => market(m, 8 + Math.floor(rnd() * 26)));
}

const offerTotal = (feeds: FeedItem[]) =>
  feeds.filter((f) => f.kind === "market").reduce((a, f) => a + (f.count ?? 0), 0);

const LANE_TIMING: { offset: number; duration: number }[] = [
  { offset: 0, duration: 7200 },
  { offset: 350, duration: 8200 },
  { offset: 750, duration: 9000 },
  { offset: 1150, duration: 9900 },
];

/** Собирает план работы команды под конкретный запрос и уже готовые результаты */
export function buildPlan(
  type: QueryType,
  query: string,
  products: Scenario["products"],
  companies: Scenario["companies"]
): ProcessPlan {
  const seed = hashStr(query);
  const sl = slug(query);
  const rnd = mulberry(seed + 7);
  const chosen = products[0];
  const lanes: Lane[] = [];
  const add = (role: string, icon: Lane["icon"], feeds: FeedItem[], result: string, i: number) =>
    lanes.push({ id: `lane-${i}`, role, icon, feeds, result, ...LANE_TIMING[i] });

  const scan = marketFeeds(MKT_GOODS, seed);
  const scanTotal = offerTotal(scan);

  const priceRows = (i: number) =>
    products.slice(0, 3).map((p, j) =>
      cmp(p.seller, `${fmtMoney(p.price)} · ${p.delivery.toLowerCase()}`, Math.round(p.score * 10), j === i)
    );

  const companyRows: FeedItem[] = companies.slice(0, 4).map((c) => {
    const score = c.recommended ? 96 : Math.max(55, 88 - (hashStr(c.id) % 17));
    return cmp(c.companyName, `${c.estimatedPrice} · гарантия ${c.warranty}`, score, c.recommended);
  });

  if (type === "exact_product") {
    add("Искатель цен", Radar, [
      q(`«${query}» купить цена`),
      ...scan,
      ...priceRows(0),
      stat("Предложений собрано", scanTotal),
    ], `Лучшая цена: ${chosen ? fmtMoney(chosen.price) : "найдена"}`, 0);

    add("Ревизор подлинности", ShieldCheck, [
      q(`${query} официальный магазин`),
      link("Сверяю карточки продавцов", [`ozon.ru/product/${sl}`, `market.yandex.ru/product/${sl}`, `avito.ru/${sl}`]),
      chk("Продавец с высоким рейтингом и историей"),
      chk("Комплектация совпадает с официальной"),
      chk("История цены за 90 дней — без накруток"),
      stat("Параметров проверено", 340 + Math.floor(rnd() * 120)),
    ], "Подлинность и гарантия подтверждены", 1);

    add("Исследователь отзывов", BookOpen, [
      q(`${query} отзывы ${new Date().getFullYear()}`),
      link("Открываю обзоры и отзывы", [
        `youtube.com/results?search_query=${sl}-обзор`,
        `4pda.to/forum/index.php?showtopic=${sl}`,
        `ixbt.com/review/${sl}.html`,
      ]),
      stat("Отзывов прочитано", chosen?.reviewsCount ?? 900),
      chk(`Тон отзывов: ${chosen?.sentiment.pos ?? 90}% положительные`),
      chk("Жалоб на брак за полгода — единицы"),
    ], `${fmtNum(chosen?.reviewsCount ?? 0)} отзывов · ${chosen?.sentiment.pos ?? 90}% «за»}`, 2);

    add("Аналитик доставки", Truck, [
      q(`${query} доставка сроки`),
      ...products.slice(0, 3).map((p, j) => cmp(p.seller, `доставка: ${p.delivery.toLowerCase()}`, 90 - j * 8, j === 0)),
      chk("Условия возврата — 14 дней"),
      chk("Доставка с отслеживанием"),
      stat("Вариантов доставки сверено", products.length + 2),
    ], chosen ? `Доставка: ${chosen.delivery.toLowerCase()}` : "Доставка сверена", 3);
  } else if (type === "category_search") {
    add("Аналитик подбора", Layers, [
      q(`«${query}» рейтинг ${new Date().getFullYear()}`),
      link("Смотрю подборки и тесты", [`youtube.com/results?search_query=лучшие-${sl}`, `ichip.ru/podborki/${sl}`, `roskachestvo.gov.ru/research/${sl}`]),
      stat("Моделей в категории", 74 + Math.floor(rnd() * 40)),
      chk("Ваши ответы учтены: бюджет и сценарий"),
      stat("→ достойных кандидатов", 10 + Math.floor(rnd() * 6)),
    ], `${products.length} финалистов из ~90 моделей`, 0);

    add("Искатель цен", Radar, [
      q(`${query} цена`),
      ...scan,
      ...priceRows(0),
      stat("Предложений собрано", scanTotal),
    ], chosen ? `Лучшая цена: ${fmtMoney(chosen.price)}` : "Цены собраны", 1);

    add("Исследователь отзывов", BookOpen, [
      q(`${query} отзывы реальные`),
      link("Читаю ветки обсуждений", [`otzovik.com/search/${sl}`, `irecommend.ru/search/${sl}`, `market.yandex.ru/${sl}/reviews`]),
      stat("Отзывов проанализировано", 380 + Math.floor(rnd() * 500)),
      chk("Отсеяла накрученные оценки"),
    ], "Отзывы очищены от накруток", 2);

    add("Ревизор надёжности", ShieldCheck, [
      q(`${query} надёжный продавец`),
      link("Проверяю продавцов", [`ozon.ru/category/${sl}`, `wildberries.ru/catalog/${sl}`]),
      chk("Рейтинг продавца ≥ 4.7"),
      chk("Возврат и гарантия — без мелкого шрифта"),
      stat("Пунктов проверки", 12),
    ], "Продавцы проверены по 12 пунктам", 3);
  } else if (type === "gift_search") {
    const giftScan = marketFeeds(MKT_GIFT, seed + 3);
    add("Искатель идей", Gift, [
      q(`подарок ${slug(query.replace(/подарок/i, "")).replace(/-/g, " ")} идеи`),
      ...giftScan,
      link("Смотрю подарочные подборки", [`ozon.ru/highlight/${sl}`, `wildberries.ru/podborki/${sl}`]),
      stat("Идей собрано", offerTotal(giftScan)),
    ], "3 направления подарка", 0);

    add("Аналитик трендов", LineChart, [
      q(`что дарят в ${new Date().getFullYear()} тренды`),
      link("Проверяю, что сейчас дарят", [`trendbox.ru/${sl}`, `pikabu.ru/tag/${sl}`]),
      stat("Трендов проверено", 6 + Math.floor(rnd() * 6)),
      chk("Без банальных носков и пены для бритья"),
    ], "Только актуальные идеи", 1);

    add("Искатель цен", Radar, [
      ...priceRows(0),
      chk("Укладываемся в бюджет из ответов"),
      stat("Вариантов по карману", products.length + 4),
    ], chosen ? `Главный вариант: ${fmtMoney(chosen.price)}` : "Бюджет соблюдён", 2);

    add("Контролёр сроков", Truck, [
      chk("Успеет приехать до праздника"),
      ...products.slice(0, 3).map((p, j) => cmp(p.seller, `доставка: ${p.delivery.toLowerCase()}`, 88 - j * 7, j === 0)),
      stat("Вариантов с быстрой доставкой", products.length),
    ], chosen ? `Доставка: ${chosen.delivery.toLowerCase()}` : "Сроки проверены", 3);
  } else {
    const coSend: FeedItem[] = companies.map((c) => {
      const m = c.responseTime.match(/(\d+)/);
      return market(c.companyName, m ? parseInt(m[1], 10) : 60, "ответ");
    });
    const nHidden = companies.filter((c) => c.hiddenFeesWarning).length;

    add("Составитель задачи", ListChecks, [
      stat("Понятное описание задачи готово"),
      chk("Бюджет и сроки зафиксированы"),
      chk("Важные критерии — в приоритетах"),
      stat("Компаний подобрано по специализации", companies.length + 3),
    ], "Задача разослана компаниям", 0);

    add("Сборщик ответов", Send, [
      q(`${query} — заявка`),
      ...coSend,
      link("Читаю ответы компаний", companies.slice(0, 3).map((c) => `${slug(c.companyName)}.ru/offer`)),
      stat("Развёрнутых ответов", companies.length),
    ], `${companies.length} ответов получено`, 1);

    add("Аудитор смет", Scale, [
      ...companyRows,
      chk("Смета сверена по пунктам"),
      stat("Строк сметы проверено", 22 + Math.floor(rnd() * 10)),
    ], "Цены разложены по полочкам", 2);

    add("Проверщик гарантии", ShieldCheck, [
      chk("Доставка и подъём включены?"),
      chk("Демонтаж и расходники в смете?"),
      chk("Гарантия — письменно в договоре"),
      stat("Скрытых доплат найдено", nHidden),
    ], nHidden > 0 ? `Подсвечено доплат: ${nHidden}` : "Доплат не найдено", 3);
  }

  const total = Math.max(...lanes.map((l) => l.offset + l.duration));
  return { lanes, total };
}

/** Сводка по работе команды для финального итога */
export function computeStats(plan: ProcessPlan) {
  let offers = 0, markets = 0, checks = 0, pages = 0, responses = 0;
  for (const l of plan.lanes)
    for (const f of l.feeds) {
      if (f.kind === "market") {
        markets++;
        // в услугах count — минуты до ответа, а не предложения
        if (f.detail === "ответ") responses += 1;
        else offers += f.count ?? 0;
      }
      if (f.kind === "check") checks++;
      if (f.kind === "link") pages += f.urls?.length ?? 0;
    }
  const sec = Math.round(plan.total / 100) / 10;
  return { offers, markets, checks, pages, responses, sec };
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
  exact_product: "Вижу конкретную модель. Запускаю команду: искатель цен, ревизор подлинности, исследователь отзывов и аналитик доставки — работают параллельно.",
  category_search: "Поняла направление. Пара уточнений — и команда покажет только то, что подходит.",
  gift_search: "Отличная задача. Уточню детали — и команда соберёт подарок, который попадёт в цель.",
  service_search: "Принято. Пара вопросов — и команда отправит задачу в проверенные компании.",
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
    plan: { lanes: [], total: 0 },
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

  // план работы команды собирается по уже готовым результатам — цифры везде честные
  base.plan = buildPlan(c.type, c.matched, base.products, base.companies);
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
