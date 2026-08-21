import { useEffect, useState } from "react";
import { create } from "zustand";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const readStored = (): ThemeMode => {
  try {
    const v = localStorage.getItem("aura-theme");
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: readStored(),
  setMode: (mode) => {
    try {
      localStorage.setItem("aura-theme", mode);
    } catch {
      /* приватный режим — не критично */
    }
    set({ mode });
  },
}));

export function applyTheme(mode: ThemeMode) {
  const sys = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = mode === "dark" || (mode === "system" && sys);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.backgroundColor = dark ? "#0a1210" : "#f3f6f4";
}

/** Подписка на смену темы и системных настроек */
export function initTheme() {
  applyTheme(useThemeStore.getState().mode);
  try {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => applyTheme(useThemeStore.getState().mode));
  } catch {
    /* старые браузеры */
  }
  return useThemeStore.subscribe((s) => applyTheme(s.mode));
}

export function useDark(): boolean {
  const mode = useThemeStore((s) => s.mode);
  const [sys, setSys] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = () => setSys(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mode === "dark" || (mode === "system" && sys);
}
