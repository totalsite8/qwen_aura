import type { QueryType, Suggestion } from "../types";
import { ALL_LISTS } from "../data/queries";

export const norm = (s: string) => s.trim().toLowerCase().replace(/ё/g, "е");

const GIFT_WORDS = [
  "подар",
  "дарить",
  "на 23",
  "на 8 марта",
  "день рождения",
  "новосель",
  "годовщин",
  "на свадьб",
  "на выписку",
  "1 сентября",
];

const SERVICE_WORDS = [
  "остекл",
  "балкон",
  "ремонт",
  "уборк",
  "переезд",
  "грузчик",
  "фотограф",
  "установ",
  "монтаж",
  "замен",
  "утепл",
  "потолк",
  "проводк",
  "электр",
  "двер",
  "кондиционер",
  "сборк",
  "чистк",
  "видеонаблюд",
  "репетитор",
  "стилист",
  "курьер",
  "доставк",
  "шиномонтаж",
  "бурени",
  "скважин",
  "забор",
  "профнастил",
];

const PRODUCT_RE =
  /(iphone|airpods|ipad|macbook|imac|playstation|nintendo|xbox|kindle|gopro|dyson|galaxy|pixel|rog ally|zenbook|thinkpad|magicbook|redmi|poco|wh-1000|wf-1000|mx master|powercore|vertuo|optigrill|magic 7|magic7)|([a-z][a-z0-9+#-]*\s+\d\d?)|(\d\d?\s+[a-z][a-z0-9-]+)/i;

const CATEGORY_HINTS = ["до ", "для ", "под ", "недорог", "выбрать", "какой ", "какая ", "бюджет"];

export interface Classified {
  type: QueryType;
  matched: string;
}

/** Клиентская имитация понимания запроса: списки → эвристики → fallback */
export function classifyQuery(raw: string): Classified | null {
  const q = norm(raw);
  if (!q) return null;

  // 1. Полное совпадение с размеченными списками
  for (const list of ALL_LISTS) {
    for (const item of list.items) {
      if (norm(item.text) === q) return { type: list.type, matched: item.text };
    }
  }
  // 2. Взаимное вхождение
  for (const list of ALL_LISTS) {
    for (const item of list.items) {
      const t = norm(item.text);
      if (t.includes(q) && q.length >= 6) return { type: list.type, matched: item.text };
      if (q.includes(t)) return { type: list.type, matched: item.text };
    }
  }
  // 3. Эвристики
  if (GIFT_WORDS.some((w) => q.includes(w))) return { type: "gift_search", matched: raw.trim() };
  if (SERVICE_WORDS.some((w) => q.includes(w))) return { type: "service_search", matched: raw.trim() };
  if (PRODUCT_RE.test(raw)) return { type: "exact_product", matched: raw.trim() };
  if (CATEGORY_HINTS.some((w) => q.includes(w))) return { type: "category_search", matched: raw.trim() };
  return null;
}

/** Живые подсказки под строкой ввода */
export function getSuggestions(input: string): Suggestion[] {
  const q = norm(input);
  const all: Suggestion[] = ALL_LISTS.flatMap((l) =>
    l.items.map((i) => ({ text: i.text, type: l.type }))
  );
  if (q.length < 2) {
    // стартовый набор: по одному hero из каждого типа + пара популярных
    const heroes = ["Honor Magic 7 Pro", "Беспроводные наушники до 3 000₽", "Подарок парню на 23 февраля", "Остеклить балкон", "Ноутбук для учёбы и работы", "Фотограф на праздник"];
    return heroes.map((h) => all.find((a) => norm(a.text) === norm(h))!).filter(Boolean);
  }
  const scored = all
    .map((s) => {
      const t = norm(s.text);
      let score = 0;
      if (t === q) score = 100;
      else if (t.startsWith(q)) score = 80;
      else if (t.includes(q)) score = 60;
      else {
        const words = q.split(/\s+/).filter(Boolean);
        const hits = words.filter((w) => w.length > 2 && t.includes(w)).length;
        if (hits > 0) score = 20 + hits * 10;
      }
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map((x) => x.s);

  return scored;
}
