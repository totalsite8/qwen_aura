import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Coins, Sparkles, Star, X, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { spring, springSoft } from "../lib/motion";
import { fmtNum, plural } from "../lib/utils";
import type { QueryType } from "../types";

/* ─────────── Модалка ─────────── */
export function Modal({
  open,
  onClose,
  children,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[6px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="card relative w-full overflow-hidden shadow-2xl"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={spring}
          >
            <button
              aria-label="Закрыть"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full p-2 text-soft transition hover:bg-bg2 hover:text-ink"
            >
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────── Раскрывающийся блок (дашборды) ─────────── */
export function Collapsible({
  icon: Icon,
  title,
  hint,
  badge,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-bg2/70"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pine/10 text-pine">
          <Icon size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{title}</span>
          {hint && <span className="block truncate text-[13px] text-soft">{hint}</span>}
        </span>
        {badge}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springSoft} className="shrink-0 text-faint">
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 17 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────── Бейджи и чипы ─────────── */
export function AuraBadge({ big = false }: { big?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-pine font-semibold text-pine-fg ${
        big ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs"
      }`}
    >
      <Sparkles size={big ? 15 : 13} />
      Выбор Aura
    </span>
  );
}

export function PointsChip({ points, big = false }: { points: number; big?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-amber-soft font-bold text-amber ${
        big ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs"
      }`}
    >
      <Coins size={big ? 15 : 13} />
      +{fmtNum(points)} {plural(points, "балл", "балла", "баллов")}
    </span>
  );
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-soft">
      <Star size={14} className="fill-amber text-amber" />
      <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
      {count !== undefined && <span>· {fmtNum(count)} отзывов</span>}
    </span>
  );
}

const TYPE_LABEL: Record<QueryType, { label: string; cls: string }> = {
  exact_product: { label: "Товар", cls: "bg-pine/12 text-pine" },
  category_search: { label: "Подбор", cls: "bg-teal/12 text-teal" },
  gift_search: { label: "Подарок", cls: "bg-amber-soft text-amber" },
  service_search: { label: "Услуга", cls: "bg-warn/12 text-warn" },
};

export function TypeBadge({ type }: { type: QueryType }) {
  const t = TYPE_LABEL[type];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${t.cls}`}>
      {t.label}
    </span>
  );
}

/* ─────────── Заголовок с line-mask reveal ─────────── */
export function MaskTitle({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`line-mask ${className}`}>
      <motion.span initial={{ y: "112%" }} animate={{ y: "0%" }} transition={{ type: "spring", stiffness: 90, damping: 17 }}>
        {text}
      </motion.span>
    </span>
  );
}
