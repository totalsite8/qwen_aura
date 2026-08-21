import type { LucideIcon } from "lucide-react";

/** Четыре типа запросов, которые понимает Aura */
export type QueryType = "exact_product" | "category_search" | "gift_search" | "service_search";

export type ArtKind =
  | "phone"
  | "earbuds"
  | "headphones"
  | "laptop"
  | "watch"
  | "speaker"
  | "vacuum"
  | "gift"
  | "console"
  | "camera"
  | "home"
  | "appliance"
  | "tool"
  | "gadget";

/** Живая активность внутри шага процесса — «настоящий веб-поиск» */
export type FeedKind = "query" | "market" | "link" | "compare" | "check" | "stat";

export interface FeedItem {
  kind: FeedKind;
  text: string;
  detail?: string;
  /** для market: найдено предложений; для compare: рейтинг/счёт */
  count?: number;
  /** для link: адреса, которые Aura «открывает» */
  urls?: string[];
}

export interface ProcessStep {
  id: string;
  icon: LucideIcon;
  text: string;
  /** длительность в мс при обычной скорости */
  duration: number;
  feeds: FeedItem[];
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  art: ArtKind;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  delivery: string;
  warranty: string;
  /** баллы — бесплатный бонус за покупку, НЕ вычитаются из цены */
  points: number;
  features: string[];
  whySelected: string[];
  priceHistory: number[];
  marketAverage: number;
  reliabilityChecks: { label: string; status: "ok" | "warn" }[];
  isAuraChoice: boolean;
  seller: string;
  score: number;
  sentiment: { pos: number; neu: number; neg: number };
}

export interface CompanyOffer {
  id: string;
  companyName: string;
  rating: number;
  reviewsCount: number;
  estimatedPrice: string;
  responseTime: string;
  warranty: string;
  notes: string[];
  tags: string[];
  hiddenFeesWarning: boolean;
  recommended: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
}

export interface ClarifyQuestion {
  id: string;
  title: string;
  summaryLabel: string | null;
  options: QuestionOption[];
}

export interface GiftDirection {
  title: string;
  subtitle: string;
  main: Product;
  alternatives: Product[];
}

export interface Scenario {
  type: QueryType;
  label: string;
  questions: ClarifyQuestion[];
  process: ProcessStep[];
  products: Product[];
  giftDirections: GiftDirection[];
  taskSummary: { label: string; value: string }[];
  companies: CompanyOffer[];
  attentionNotes: string[];
  intro: string;
}

export interface Suggestion {
  text: string;
  type: QueryType;
}

export interface PointsEntry {
  id: string;
  label: string;
  amount: number;
  date: string;
}
