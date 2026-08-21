import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const nf = new Intl.NumberFormat("ru-RU");

export const fmtNum = (n: number) => nf.format(Math.round(n));
export const fmtMoney = (n: number) => `${nf.format(Math.round(n))} ₽`;

/** Русская плюрализация: plural(5, "балл", "балла", "баллов") */
export function plural(n: number, one: string, few: string, many: string) {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (d === 1) return one;
  if (d > 1 && d < 5) return few;
  return many;
}

export const pointsLabel = (n: number) => `+${fmtNum(n)} ${plural(n, "балл", "балла", "баллов")}`;

/** Детерминированный hash строки */
export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

/** Детерминированный PRNG (mulberry32) */
export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** История цены за ~90 дней: плавное снижение с «дном» и отметкой «сегодня» */
export function genHistory(seed: number, todayPrice: number, n = 48): number[] {
  const rnd = mulberry(seed);
  const start = todayPrice * (1.1 + rnd() * 0.14);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = start + (todayPrice - start) * Math.pow(t, 0.85);
    const wave = Math.sin(t * 9 + seed % 7) * todayPrice * 0.018;
    const noise = (rnd() - 0.5) * todayPrice * 0.022;
    const dip = Math.exp(-Math.pow((t - 0.62) / 0.07, 2)) * todayPrice * 0.055;
    out.push(Math.round(base + wave + noise - dip));
  }
  out[n - 1] = todayPrice;
  return out;
}

/** ?fast=1 в адресе ускоряет демо-анимации */
let fastCache: boolean | null = null;
export function isFastMode() {
  if (fastCache !== null) return fastCache;
  try {
    fastCache =
      new URLSearchParams(window.location.search).has("fast") ||
      /fast=1/.test(window.location.hash);
  } catch {
    fastCache = false;
  }
  return fastCache;
}

export const speed = (ms: number) => (isFastMode() ? Math.max(110, Math.round(ms * 0.14)) : ms);

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

/** Плавный счётчик чисел, уважает prefers-reduced-motion */
export function useCountUp(target: number, duration = 900, delay = 0) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  const raf = useRef(0);
  useEffect(() => {
    if (reduced || isFastMode()) {
      setValue(target);
      return;
    }
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const el = ts - start - delay;
      if (el < 0) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, el / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, delay, reduced]);
  return value;
}

export function usePrefersReducedMotion() {
  return useReducedMotion() ?? false;
}
