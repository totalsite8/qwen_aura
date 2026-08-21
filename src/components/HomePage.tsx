import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Gift, Layers, Search, ShoppingBag, Wrench, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePwaStore } from "../features/pwa/pwaStore";
import { spring, springTight } from "../lib/motion";
import { getSuggestions } from "../lib/classify";
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
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-14 pt-8">
      <div className="flex w-full flex-col items-center gap-10 md:flex-row md:justify-center md:gap-16">
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

      <p className="mt-16 text-center text-[12px] text-faint">
        Демо-прототип Aura · товары, категории, подарки и услуги
      </p>
    </main>
  );
}
