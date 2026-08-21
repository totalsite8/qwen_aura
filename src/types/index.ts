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
  points: number;
  features: string[];
  whySelected: string[];
  priceHistory: number[];
  marketAverage: number;
  reliabilityChecks: { label: string; status: "ok" | "warn" }[];
  isAuraChoice: boolean;
}

export interface ReliabilityCheck {
  label: string;
  status: "ok" | "warn";
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

export type StepState = "pending" | "active" | "done";

export interface ProcessStep {
  id: string;
  icon: LucideIcon;
  text: string;
  /** длительность в мс при обычной скорости */
  duration: number;
}

export interface QuestionOption {
  id: string;
  label: string;
}

export interface ClarifyQuestion {
  id: string;
  title: string;
  /** подпись строки в сводке «Поняла задачу»; если null — в сводку не попадает */
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
  /** человекочитаемое название сценария */
  label: string;
  questions: ClarifyQuestion[];
  process: ProcessStep[];
  products: Product[];
  giftDirections: GiftDirection[];
  /** строки карточки «Поняла задачу» (услуги) */
  taskSummary: { label: string; value: string }[];
  companies: CompanyOffer[];
  attentionNotes: string[];
  /** короткая реплика Aura перед стартом */
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
