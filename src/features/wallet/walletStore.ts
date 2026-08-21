import { create } from "zustand";
import type { PointsEntry } from "../../types";

interface WalletState {
  points: number;
  history: PointsEntry[];
  addPoints: (amount: number, label: string) => void;
}

const KEY = "aura-wallet-v1";

const initial = (): { points: number; history: PointsEntry[] } => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { points: number; history: PointsEntry[] };
      if (typeof parsed.points === "number" && Array.isArray(parsed.history)) return parsed;
    }
  } catch {
    /* повреждённые данные — начнём заново */
  }
  return {
    points: 1000,
    history: [{ id: "welcome", label: "Приветственный бонус", amount: 1000, date: "сегодня" }],
  };
};

export const useWalletStore = create<WalletState>((set, get) => ({
  ...initial(),
  addPoints: (amount, label) => {
    const entry: PointsEntry = {
      id: `e${Date.now()}`,
      label,
      amount,
      date: "сегодня",
    };
    const next = {
      points: get().points + amount,
      history: [entry, ...get().history].slice(0, 12),
    };
    set(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* не критично для демо */
    }
  },
}));
