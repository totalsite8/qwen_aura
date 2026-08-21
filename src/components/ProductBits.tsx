import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  Coins,
  ShieldCheck,
  ShoppingBag,
  Store,
  Table2,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWalletStore } from "../features/wallet/walletStore";
import { fadeUp, spring, stagger } from "../lib/motion";
import { fmtMoney, fmtNum, plural } from "../lib/utils";
import type { Product } from "../types";
import { ProductArt } from "./ProductArt";
import { AuraBadge, Modal, PointsChip, PriceGauge, ScoreRing, Stars, Tip } from "./ui";

/* ─────────── Главная плитка «Выбор Aura» ─────────── */
export function ChoiceTile({ product, onBuy }: { product: Product; onBuy: (mode: "points" | "plain") => void }) {
  return (
    <motion.article
      variants={fadeUp}
      className="tile tile-static relative flex flex-col overflow-hidden !border-pine/35 shadow-xl shadow-pine/[0.07] md:col-span-2 xl:row-span-2"
      aria-label="Выбор Aura"
    >
      <div className="grid flex-1 md:grid-cols-[300px_1fr]">
        <div className="relative">
          <ProductArt art={product.art} seedText={product.id} className="h-52 md:h-full md:min-h-[330px]" />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
            <AuraBadge big />
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold">
              <Store size={12} className="text-pine" />
              {product.seller}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold uppercase tracking-wider text-faint">
            <span>{product.brand}</span>
            <span className="h-1 w-1 rounded-full bg-faint/60" />
            <span>{product.category}</span>
          </div>

          <h2 className="font-display text-[21px] font-semibold leading-snug sm:text-[24px]">
            <span className="line-mask">
              <motion.span initial={{ y: "112%" }} animate={{ y: "0%" }} transition={{ type: "spring", stiffness: 90, damping: 17, delay: 0.06 }}>
                {product.title}
              </motion.span>
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-soft">
            <Stars rating={product.rating} count={product.reviewsCount} />
            <span className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-pine" /> {product.delivery}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-pine" /> {product.warranty}
            </span>
          </div>

          <ul className="flex flex-wrap gap-1.5">
            {product.features.map((f) => (
              <li key={f} className="rounded-full bg-bg2 px-3 py-1 text-[12px] font-medium text-soft">
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label-caps mb-1">Цена</p>
              <p className="font-display text-[26px] font-bold leading-none sm:text-[30px]">
                {fmtMoney(product.price)}
                {product.oldPrice && (
                  <span className="ml-2 align-middle text-[14px] font-medium text-faint line-through">{fmtMoney(product.oldPrice)}</span>
                )}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1 text-[12px] font-bold text-amber">
                <Coins size={13} />
                +{fmtNum(product.points)} {plural(product.points, "балл", "балла", "баллов")} Aura, если купите так
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:w-[220px]">
              <button className="btn btn-primary" onClick={() => onBuy("points")}>
                <Coins size={16} />
                Купить с баллами
              </button>
              <button className="btn btn-ghost" onClick={() => onBuy("plain")}>
                Купить без баллов
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ─────────── «Честный расчёт»: цена не меняется, баллы — сверху ─────────── */
export function HonestTile({ product, minOther }: { product: Product; minOther?: number }) {
  const cheaperExists = minOther !== undefined && minOther < product.price;
  const diff = cheaperExists ? product.price - (minOther ?? 0) : 0;
  return (
    <motion.div variants={fadeUp} className="tile tile-static flex flex-col p-5">
      <p className="label-caps mb-3 flex items-center gap-1.5">
        Честный расчёт
        <Tip text="Цена показана как в магазине, без хитростей. Баллы — бесплатный бонус поверх цены, они её не уменьшают." />
      </p>
      <dl className="space-y-2 text-[14px]">
        <div className="flex justify-between gap-3">
          <dt className="text-soft">Цена в «{product.seller}»</dt>
          <dd className="font-mono font-bold">{fmtMoney(product.price)}</dd>
        </div>
        {minOther !== undefined && (
          <div className="flex justify-between gap-3">
            <dt className="text-soft">Другие варианты подбора</dt>
            <dd className="font-mono text-soft">от {fmtMoney(minOther)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-soft">Баллы Aura после покупки</dt>
          <dd className="font-mono font-bold text-amber">+{fmtNum(product.points)}</dd>
        </div>
      </dl>
      <div className="mt-auto pt-3 text-[12.5px] leading-relaxed text-soft">
        {cheaperExists ? (
          <>
            Есть варианты от <b className="text-ink">{fmtMoney(minOther ?? 0)}</b> — как правило, они проще по комплектации
            или условиям. «{product.seller}» даёт {product.warranty.toLowerCase()} и рейтинг {product.rating.toFixed(1)}.
            Баллы начислим сверху: цена от них не меняется.
          </>
        ) : (
          <>Это лучшая цена среди проверенных магазинов. Баллы — бесплатный бонус сверху, цена от них не меняется.</>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────── Надёжность: кольцо + проверки ─────────── */
export function ReliabilityTile({ product }: { product: Product }) {
  const [all, setAll] = useState(false);
  const checks = all ? product.reliabilityChecks : product.reliabilityChecks.slice(0, 3);
  return (
    <motion.div variants={fadeUp} className="tile tile-static flex flex-col p-5">
      <p className="label-caps mb-3 flex items-center gap-1.5">
        Проверка надёжности
        <Tip text="Оценка из 10: рейтинг продавца, реальные отзывы, гарантия, цена и история магазина. Всё, чтобы вы не сомневались." />
      </p>
      <div className="flex items-center gap-4">
        <ScoreRing score={product.score} size={86} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {checks.map((c) => (
              <motion.p
                key={c.label}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-1.5 text-[12.5px] leading-snug"
              >
                {c.status === "ok" ? (
                  <Check size={13} className="mt-0.5 shrink-0 text-pine" />
                ) : (
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warn" />
                )}
                <span className={c.status === "ok" ? "text-ink" : "text-warn"}>{c.label}</span>
              </motion.p>
            ))}
          </AnimatePresence>
          {product.reliabilityChecks.length > 3 && (
            <button onClick={() => setAll((a) => !a)} className="text-[12px] font-semibold text-pine hover:underline">
              {all ? "Свернуть" : `Ещё ${product.reliabilityChecks.length - 3} проверки`}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────── Динамика цены со спарклайном ─────────── */
function Sparkline({ history }: { history: number[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = 140;
  const pad = 14;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const x = (i: number) => pad + (i / (history.length - 1)) * (W - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2);
  const path = history.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(history.length - 1)},${H - 2} L${x(0)},${H - 2} Z`;
  const minIdx = history.indexOf(min);
  const last = history.length - 1;
  const idx = hover ?? last;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-crosshair"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const t = (e.clientX - r.left) / r.width;
        setHover(Math.round(t * (history.length - 1)));
      }}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--pine)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--pine)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.3, 0.6].map((t) => (
        <line key={t} x1={pad} x2={W - pad} y1={pad + t * (H - pad * 2)} y2={pad + t * (H - pad * 2)} stroke="var(--line)" strokeDasharray="3 6" />
      ))}
      <path d={area} fill="url(#spark-fill)" />
      <path d={path} fill="none" stroke="var(--pine)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx={x(minIdx)} cy={y(min)} r="4.5" fill="var(--amber)" stroke="var(--card)" strokeWidth="2" />
      <text x={Math.min(W - 70, Math.max(40, x(minIdx)))} y={Math.min(H - 6, y(min) + 16)} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--warn)">
        дно {fmtMoney(min)}
      </text>
      {hover !== null && (
        <g>
          <line x1={x(idx)} x2={x(idx)} y1={pad - 4} y2={H - pad + 4} stroke="var(--faint)" strokeDasharray="2 4" />
          <circle cx={x(idx)} cy={y(history[idx])} r="4.5" fill="var(--ink)" stroke="var(--card)" strokeWidth="2" />
          <text x={Math.min(W - 80, Math.max(50, x(idx)))} y={Math.max(12, y(history[idx]) - 10)} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)">
            {fmtMoney(history[idx])}
          </text>
        </g>
      )}
      {hover === null && (
        <g>
          <circle cx={x(last)} cy={y(history[last])} r="4.5" fill="var(--pine)" stroke="var(--card)" strokeWidth="2" />
          <text x={x(last) - 8} y={y(history[last]) - 9} textAnchor="end" fontSize="10.5" fontWeight="700" fill="var(--pine)">
            сегодня
          </text>
        </g>
      )}
    </svg>
  );
}

export function HistoryTile({ product }: { product: Product }) {
  const good = product.price <= product.marketAverage;
  return (
    <motion.div variants={fadeUp} className="tile tile-static flex flex-col p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="label-caps flex items-center gap-1.5">
          Динамика цены · 90 дней
          <Tip text="«Дно» — самая низкая цена за 3 месяца. Если сейчас рядом с дном — момент хороший, можно не ждать." />
        </p>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${good ? "bg-pine/12 text-pine" : "bg-warn/12 text-warn"}`}>
          {good ? "Хороший момент" : "Можно подождать"}
        </span>
      </div>
      <Sparkline history={product.priceHistory} />
      <p className="mt-1 text-[11.5px] text-faint">Наведите на график, чтобы увидеть цену в конкретный день</p>
    </motion.div>
  );
}

/* ─────────── Цена относительно средней ─────────── */
export function GaugeTile({ product }: { product: Product }) {
  const pct = ((product.marketAverage - product.price) / product.marketAverage) * 100;
  const cheaper = pct >= 0;
  return (
    <motion.div variants={fadeUp} className="tile tile-static flex flex-col p-5">
      <p className="label-caps mb-3">Средняя цена по рынку</p>
      <p className={`font-display text-[19px] font-bold ${cheaper ? "text-pine" : "text-warn"}`}>
        {cheaper ? "Ниже" : "Выше"} средней на {Math.abs(pct).toFixed(0)}%
      </p>
      <p className="mb-2 text-[12.5px] text-soft">
        Средняя за 90 дней — <span className="font-mono">{fmtMoney(product.marketAverage)}</span>
      </p>
      <PriceGauge price={product.price} avg={product.marketAverage} />
    </motion.div>
  );
}

/* ─────────── Что говорят покупатели ─────────── */
export function SentimentTile({ product }: { product: Product }) {
  const rows = [
    { label: "Положительные", v: product.sentiment.pos, color: "var(--pine)" },
    { label: "Нейтральные", v: product.sentiment.neu, color: "color-mix(in srgb, var(--faint) 60%, transparent)" },
    { label: "Отрицательные", v: product.sentiment.neg, color: "var(--warn)" },
  ];
  return (
    <motion.div variants={fadeUp} className="tile tile-static flex flex-col p-5">
      <p className="label-caps mb-3">Что говорят покупатели</p>
      <div className="flex items-center gap-2 text-[13px]">
        <ThumbsUp size={15} className="text-pine" />
        <span className="font-semibold">{product.sentiment.pos}% рекомендуют</span>
        <span className="text-faint">· {fmtNum(product.reviewsCount)} отзывов</span>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-0.5 flex justify-between text-[11.5px] text-soft">
              <span>{r.label}</span>
              <span className="font-mono font-semibold">{r.v}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line/50">
              <motion.div
                className="h-full rounded-full"
                style={{ background: r.color }}
                initial={{ width: 0 }}
                animate={{ width: `${r.v}%` }}
                transition={{ type: "spring", stiffness: 70, damping: 17, delay: 0.25 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────── Почему мы это выбрали ─────────── */
export function WhyTile({ product }: { product: Product }) {
  return (
    <motion.div variants={fadeUp} className="tile tile-static flex flex-col p-5 md:col-span-2">
      <p className="label-caps mb-3">Почему мы это выбрали</p>
      <motion.ul variants={stagger} initial="hidden" animate="show" className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {product.whySelected.map((w) => (
          <motion.li key={w} variants={fadeUp} className="flex items-start gap-2 text-[13.5px]">
            <BadgeCheck size={15} className="mt-0.5 shrink-0 text-pine" />
            {w}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

/* ─────────── Полное сравнение: плитка-превью + модалка ─────────── */
export function CompareTile({ all, onOpen }: { all: Product[]; onOpen: () => void }) {
  const top = [...all].sort((a, b) => a.price - b.price).slice(0, 3);
  return (
    <motion.div variants={fadeUp} className="tile tile-static flex flex-col p-5">
      <p className="label-caps mb-3">Полное сравнение</p>
      <ul className="space-y-1.5">
        {top.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 text-[12.5px]">
            <span className="truncate text-soft">{p.title}</span>
            <span className="shrink-0 font-mono font-semibold">{fmtMoney(p.price)}</span>
          </li>
        ))}
      </ul>
      <button className="btn btn-ghost mt-auto pt-2 text-[13px]" onClick={onOpen}>
        <Table2 size={15} />
        Сравнить все {all.length}
      </button>
    </motion.div>
  );
}

export function CompareModal({ all, open, onClose }: { all: Product[]; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} width={780}>
      <div className="p-5 sm:p-6">
        <h3 className="mb-4 font-display text-[18px] font-semibold">Полное сравнение вариантов</h3>
        <div className="nice-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13.5px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-faint">
                <th className="pb-2 pr-4 font-semibold">Вариант</th>
                <th className="pb-2 pr-4 font-semibold">Магазин</th>
                <th className="pb-2 pr-4 font-semibold">Цена</th>
                <th className="pb-2 pr-4 font-semibold">Баллы (бонус)</th>
                <th className="pb-2 pr-4 font-semibold">Рейтинг</th>
                <th className="pb-2 font-semibold">Гарантия</th>
              </tr>
            </thead>
            <tbody>
              {all.map((p) => (
                <tr key={p.id} className={`border-t border-line align-top ${p.isAuraChoice ? "bg-pine/6" : ""}`}>
                  <td className="py-2.5 pr-4 font-medium">
                    {p.title}
                    {p.isAuraChoice && (
                      <span className="ml-2 rounded-full bg-pine px-2 py-0.5 text-[10px] font-bold text-pine-fg">Выбор Aura</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-soft">{p.seller}</td>
                  <td className="whitespace-nowrap py-2.5 pr-4 font-mono font-semibold">{fmtMoney(p.price)}</td>
                  <td className="whitespace-nowrap py-2.5 pr-4 font-mono text-amber">+{fmtNum(p.points)}</td>
                  <td className="whitespace-nowrap py-2.5 pr-4">★ {p.rating.toFixed(1)}</td>
                  <td className="py-2.5">{p.warranty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-faint">Баллы — бесплатный бонус за покупку, они не вычитаются из цены.</p>
      </div>
    </Modal>
  );
}

/* ─────────── Компактная карточка варианта ─────────── */
export function ProductCard({ product, onBuy }: { product: Product; onBuy: (p: Product) => void }) {
  return (
    <motion.article variants={fadeUp} whileHover={{ y: -4 }} transition={spring} className="tile group flex flex-col overflow-hidden">
      <ProductArt art={product.art} seedText={product.id} className="h-32 shrink-0" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Stars rating={product.rating} />
          <span className="text-[11.5px] text-faint">{product.seller}</span>
        </div>
        <h3 className="text-[15px] font-semibold leading-snug">{product.title}</h3>
        <p className="line-clamp-2 text-[12.5px] leading-snug text-soft">{product.features.slice(0, 3).join(" · ")}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="font-display text-[17px] font-bold">{fmtMoney(product.price)}</p>
            <p className="text-[11.5px] font-semibold text-amber">+{fmtNum(product.points)} баллов бонусом</p>
          </div>
          <button
            className="btn btn-ghost !px-4 !py-2 text-[13.5px] group-hover:border-pine/50 group-hover:text-pine"
            onClick={() => onBuy(product)}
          >
            Купить
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* ─────────── Модалка покупки (демо, баллы не вычитаются) ─────────── */
export function BuyModal({
  product,
  mode,
  open,
  onClose,
}: {
  product: Product | null;
  mode: "points" | "plain";
  open: boolean;
  onClose: () => void;
}) {
  const addPoints = useWalletStore((s) => s.addPoints);
  if (!product) return <Modal open={false} onClose={onClose}><span /></Modal>;

  const confirm = () => {
    toast.success("Демо-режим: здесь будет переход к покупке");
    if (mode === "points") {
      addPoints(product.points, `Демо-бонус · ${product.title}`);
      toast(`+${fmtNum(product.points)} баллов начислено (демо) — цена не изменилась`);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width={470}>
      <div className="p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-4">
          <ProductArt art={product.art} seedText={product.id} className="h-16 w-16 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{product.title}</p>
            <p className="text-[13px] text-soft">
              {product.seller} · {fmtMoney(product.price)}
            </p>
          </div>
        </div>

        {mode === "points" ? (
          <div className="mb-4 rounded-xl bg-amber-soft px-4 py-3 text-[13.5px] text-amber">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <ShoppingBag size={14} /> Покупка с баллами Aura
            </span>
            <p className="mt-1 text-[12.5px] leading-relaxed opacity-95">
              Вы платите обычные {fmtMoney(product.price)}. После покупки начислим{" "}
              <b>+{fmtNum(product.points)} баллов</b> — это бесплатный бонус, цена от него не меняется.
            </p>
          </div>
        ) : (
          <p className="mb-4 rounded-xl bg-bg2 px-4 py-3 text-[12.5px] leading-relaxed text-soft">
            Обычная покупка за {fmtMoney(product.price)} — без начисления баллов. Баллы можно включить на шаге оплаты в
            полной версии.
          </p>
        )}

        <p className="mb-5 text-[13px] leading-relaxed text-faint">
          Это демо-прототип: настоящей покупки не происходит, деньги не списываются, данные никуда не передаются.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Вернуться
          </button>
          <button className="btn btn-primary flex-1" onClick={confirm}>
            Понятно, к покупке
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
