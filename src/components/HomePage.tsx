import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Gift,
  Layers,
  Radar,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePwaStore } from "../features/pwa/pwaStore";
import { spring, springTight } from "../lib/motion";
import { getSuggestions } from "../lib/classify";
import { fmtNum } from "../lib/utils";
import type { QueryType, Suggestion } from "../types";
import { Orb } from "./Orb";
import { TypeBadge } from "./ui";

const ROTATE = [
  "Honor Magic 7 Pro",
  "Беспроводные наушники до 3 000₽",
  "Подарок парню на 23 февраля",
  "Остеклить балкон",
];

const TYPE_ICON: Record<QueryType, LucideIcon> = {
  exact_product: ShoppingBag,
  category_search: Layers,
  gift_search: Gift,
  service_search: Wrench,
};

/* ─────────── Фразы сомнения, которые витают при любом поиске ─────────── */
const DOUBTS: {
  t: string;
  x: string;
  y: string;
  tilt: number;
  dur: number;
  delay: number;
  size: number;
  mobile?: boolean;
}[] = [
  { t: "как найти лучшую цену?", x: "5%", y: "11%", tilt: -3, dur: 9, delay: 0, size: 13, mobile: true },
  { t: "а если это не оригинал?", x: "64%", y: "7%", tilt: 2, dur: 11, delay: -3, size: 14, mobile: true },
  { t: "вдруг отзывы ненастоящие?", x: "76%", y: "28%", tilt: -2, dur: 10, delay: -5, size: 12.5 },
  { t: "не переплачиваю ли я?", x: "6%", y: "36%", tilt: 2, dur: 12, delay: -2, size: 12.5, mobile: true },
  { t: "доставка не затянется?", x: "80%", y: "52%", tilt: -3, dur: 9.5, delay: -6, size: 12 },
  { t: "а если сломается через месяц?", x: "3%", y: "58%", tilt: 1.5, dur: 10.5, delay: -4, size: 12 },
  { t: "продавцу можно доверять?", x: "68%", y: "74%", tilt: 2, dur: 11.5, delay: -1, size: 13, mobile: true },
  { t: "гарантия точно есть?", x: "10%", y: "79%", tilt: -2, dur: 9, delay: -7, size: 12, mobile: true },
  { t: "почему там дешевле?", x: "38%", y: "89%", tilt: 1, dur: 10, delay: -3.5, size: 11.5 },
  { t: "это цена без подвоха?", x: "36%", y: "3%", tilt: -1.5, dur: 12.5, delay: -8, size: 12 },
];

function DoubtField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        maskImage: "radial-gradient(ellipse 62% 48% at 50% 40%, transparent 26%, black 78%)",
        WebkitMaskImage: "radial-gradient(ellipse 62% 48% at 50% 40%, transparent 26%, black 78%)",
      }}
    >
      {DOUBTS.map((d) => (
        <span
          key={d.t}
          className={`doubt rounded-full border border-line bg-card/60 px-3 py-1.5 font-mono text-faint backdrop-blur-[3px] ${
            d.mobile ? "" : "hidden sm:inline-block"
          }`}
          style={{
            left: d.x,
            top: d.y,
            fontSize: d.size,
            ["--dur" as string]: `${d.dur}s`,
            ["--delay" as string]: `${d.delay}s`,
            ["--tilt" as string]: `${d.tilt}deg`,
            opacity: 0.75,
          }}
        >
          {d.t}
        </span>
      ))}
    </div>
  );
}

/* ─────────── Пульт команды: кто работает над каждым поиском ─────────── */
const TEAM: { icon: LucideIcon; role: string; desc: string; base: number; unit: string; tick: number }[] = [
  { icon: Radar, role: "Искатель цен", desc: "сравнивает цены во всех магазинах сети", base: 2340, unit: "цен под наблюдением", tick: 7 },
  { icon: ShieldCheck, role: "Ревизор подлинности", desc: "проверяет продавцов и товары на честность", base: 412, unit: "проверок сегодня", tick: 3 },
  { icon: BookOpen, role: "Исследователь отзывов", desc: "читает отзывы и обзоры — вместо вас", base: 18430, unit: "отзывов проанализировано", tick: 12 },
  { icon: Truck, role: "Аналитик условий", desc: "сверяет доставку, возврат и гарантию", base: 96, unit: "магазинов на связи", tick: 1 },
];

function TeamConsole() {
  const [vals, setVals] = useState(() => TEAM.map((t) => t.base));
  useEffect(() => {
    const iv = window.setInterval(
      () => setVals((v) => v.map((x, i) => x + Math.floor(Math.random() * TEAM[i].tick) + 1)),
      3600
    );
    return () => window.clearInterval(iv);
  }, []);
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.25 }}
      className="glass relative z-10 mt-12 w-full max-w-3xl overflow-hidden rounded-3xl"
      aria-label="Команда Aura"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-3">
        <p className="label-caps">За каждым поиском — целая команда</p>
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-pine">
          <span className="live-dot" />
          все на связи
        </span>
      </div>
      <ul className="divide-y divide-line/70">
        {TEAM.map((t, i) => (
          <li key={t.role} className="flex items-center gap-3.5 px-5 py-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pine/10 text-pine">
              <t.icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold leading-tight">{t.role}</p>
              <p className="truncate text-[12px] text-soft">{t.desc}</p>
            </div>
            <div className="shrink-0 text-right">
              <motion.p key={vals[i]} initial={{ opacity: 0.35, y: 3 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[15px] font-bold leading-none">
                {fmtNum(vals[i])}
              </motion.p>
              <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-faint">{t.unit}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="border-t border-line/70 px-5 py-3 text-center text-[12.5px] text-soft">
        Вы спрашиваете одной фразой — команда находит лучшее предложение в сети. Поиск всегда бесплатный.
      </p>
    </motion.section>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const openModal = usePwaStore((s) => s.openModal);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [rot, setRot] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo<Suggestion[]>(
    () => (focused && ddOpen ? getSuggestions(value) : []),
    [focused, ddOpen, value]
  );

  useEffect(() => setHi(0), [value, ddOpen]);

  // вращающийся пример в placeholder
  useEffect(() => {
    const t = setInterval(() => setRot((r) => (r + 1) % ROTATE.length), 2800);
    return () => clearInterval(t);
  }, []);

  const go = (q: string) => {
    const query = q.trim();
    if (!query) {
      toast("Напишите, что найти — например, «Honor Magic 7 Pro»");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const select = (text: string) => {
    setValue(text);
    setDdOpen(false);
    inputRef.current?.blur();
    go(text);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setDdOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!ddOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      select(suggestions[hi]?.text ?? value);
    }
  };

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-14 pt-8">
      <DoubtField />
      <div className="relative z-10 flex w-full flex-col items-center gap-10 md:flex-row md:justify-center md:gap-16">
        {/* Сфера Aura */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
          className="flex shrink-0 flex-col items-center gap-5"
        >
          <Orb size={172} onClick={openModal} />
          <p className="anim-float max-w-[220px] text-center text-[12.5px] font-medium leading-snug text-soft">
            Кликни на меня, чтобы я&nbsp;всегда был под рукой
          </p>
        </motion.div>

        {/* Строка поиска — главный элемент */}
        <div className="w-full max-w-xl">
          <h1 className="font-display text-[25px] font-bold leading-[1.15] sm:text-[32px]">
            <span className="line-mask">
              <motion.span initial={{ y: "112%" }} animate={{ y: "0%" }} transition={{ type: "spring", stiffness: 90, damping: 17 }}>
                Одна фраза —
              </motion.span>
            </span>
            <span className="line-mask text-pine">
              <motion.span initial={{ y: "112%" }} animate={{ y: "0%" }} transition={{ type: "spring", stiffness: 90, damping: 17, delay: 0.1 }}>
                и Aura нашла
              </motion.span>
            </span>
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-soft">
            Исследователи, ревизоры и аналитики Aura подключены и уже ищут лучшее предложение в сети.
            Вам достаточно одной фразы.
          </p>

          <form
            className="relative mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              go(value);
            }}
            role="search"
          >
            <div className="glass flex items-center gap-2 rounded-[22px] p-2 pl-4 shadow-xl shadow-black/[0.07] transition-[border-color,box-shadow] duration-300 focus-within:border-pine/50 focus-within:shadow-pine/10">
              <Search size={19} className="shrink-0 text-faint" aria-hidden />
              <div className="relative min-w-0 flex-1">
                {value === "" && (
                  <span className="pointer-events-none absolute inset-0 z-0 flex items-center overflow-hidden text-[16px] text-faint">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={rot}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="truncate"
                      >
                        Что найти? Например: {ROTATE[rot]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                )}
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setDdOpen(true);
                  }}
                  onFocus={() => {
                    setFocused(true);
                    setDdOpen(true);
                  }}
                  onBlur={() => setFocused(false)}
                  onKeyDown={onKey}
                  aria-label="Что найти"
                  autoComplete="off"
                  className="relative z-10 w-full bg-transparent py-2.5 text-[16px] outline-none"
                />
              </div>
              <button type="submit" className="btn btn-primary !rounded-2xl !px-5 !py-2.5">
                Найти
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Подсказки */}
            <AnimatePresence>
              {ddOpen && suggestions.length > 0 && (
                <motion.div
                  key="dd"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.99 }}
                  transition={springTight}
                  className="card absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden shadow-2xl shadow-black/10"
                >
                  <ul className="nice-scroll max-h-[320px] overflow-y-auto p-1.5" role="listbox" aria-label="Подсказки">
                    {suggestions.map((s, i) => {
                      const Icon = TYPE_ICON[s.type];
                      return (
                        <li key={s.text} role="option" aria-selected={i === hi}>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              select(s.text);
                            }}
                            onMouseEnter={() => setHi(i)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14.5px] transition-colors ${
                              i === hi ? "bg-pine/10" : "hover:bg-bg2"
                            }`}
                          >
                            <Icon size={16} className="shrink-0 text-faint" />
                            <span className="min-w-0 flex-1 truncate font-medium">{s.text}</span>
                            <TypeBadge type={s.type} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[13.5px] font-medium text-soft md:justify-start">
            <Check size={15} className="text-pine" />
            Поиск бесплатный
          </p>
        </div>
      </div>

      <TeamConsole />

      <p className="relative z-10 mt-10 text-center text-[12px] text-faint">
        Демо-прототип Aura · товары, категории, подарки и услуги
      </p>
    </main>
  );
}
