import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Coins,
  LineChart,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Table2,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { stagger, fadeUp, spring } from "../lib/motion";
import { fmtMoney, fmtNum, useCountUp } from "../lib/utils";
import { useWalletStore } from "../features/wallet/walletStore";
import type { Product } from "../types";
import { AuraBadge, Collapsible, Modal, PointsChip, Stars } from "./ui";
import { ProductArt } from "./ProductArt";

/* ─────────── Главный блок «Выбор Aura» ─────────── */
export function AuraChoiceBlock({
  product,
  onBuy,
}: {
  product: Product;
  onBuy: (mode: "points" | "plain") => void;
}) {
  const realPrice = product.price - product.points;
  const animatedReal = useCountUp(realPrice, 1000, 350);

  return (
    <motion.article
      variants={fadeUp}
      className="card relative overflow-hidden shadow-xl shadow-black/5"
      aria-label="Выбор Aura"
    >
      <span
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "color-mix(in srgb, var(--pine) 40%, transparent)" }}
      />
      <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[300px_1fr]">
        <ProductArt art={product.art} seedText={product.id} className="h-52 rounded-2xl md:h-full md:min-h-[320px]" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <AuraBadge big />
            <PointsChip points={product.points} big />
            <span className="text-[13px] font-semibold uppercase tracking-wider text-faint">{product.brand}</span>
          </div>

          <h2 className="font-display text-[22px] font-semibold leading-snug sm:text-[26px]">
            <span className="line-mask">
              <motion.span initial={{ y: "112%" }} animate={{ y: "0%" }} transition={{ type: "spring", stiffness: 90, damping: 17, delay: 0.08 }}>
                {product.title}
              </motion.span>
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] text-soft">
            <Stars rating={product.rating} count={product.reviewsCount} />
            <span className="inline-flex items-center gap-1.5">
              <Truck size={14} className="text-pine" /> {product.delivery}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-pine" /> {product.warranty}
            </span>
          </div>

          <ul className="flex flex-wrap gap-1.5">
            {product.features.map((f) => (
              <li key={f} className="rounded-full bg-bg2 px-3 py-1 text-[12.5px] font-medium text-soft">
                {f}
              </li>
            ))}
          </ul>

          {/* Честный расчёт */}
          <div className="rounded-2xl border border-line bg-bg2/60 p-4">
            <p className="label-caps mb-2.5">Честный расчёт</p>
            <dl className="space-y-1.5 text-[14.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-soft">Цена</dt>
                <dd className="font-semibold">{fmtMoney(product.price)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-soft">
                  <Coins size={13} className="text-amber" /> Баллы Aura
                </dt>
                <dd className="font-semibold text-amber">−{fmtNum(product.points)} ₽</dd>
              </div>
              <div className="my-1.5 border-t border-dashed border-line" />
              <div className="flex justify-between gap-3 text-[16px]">
                <dt className="font-semibold">Твоя реальная цена</dt>
                <dd className="font-display font-bold text-pine">{fmtMoney(animatedReal)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-auto flex flex-col gap-2.5 sm:flex-row">
            <button className="btn btn-primary flex-1" onClick={() => onBuy("points")}>
              <Coins size={17} />
              Купить с баллами
            </button>
            <button className="btn btn-ghost flex-1" onClick={() => onBuy("plain")}>
              Купить без баллов
            </button>
          </div>
        </div>
      </div>

      {/* Почему мы это выбрали */}
      <div className="border-t border-line bg-bg2/40 px-5 py-4 sm:px-7">
        <p className="label-caps mb-2.5">Почему мы это выбрали</p>
        <motion.ul variants={stagger} initial="hidden" animate="show" className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {product.whySelected.map((w) => (
            <motion.li key={w} variants={fadeUp} className="flex items-start gap-2 text-[13.5px] text-ink">
              <BadgeCheck size={15} className="mt-0.5 shrink-0 text-pine" />
              {w}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.article>
  );
}

/* ─────────── Компактная карточка варианта ─────────── */
export function ProductCard({ product, onBuy }: { product: Product; onBuy: (p: Product) => void }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={spring}
      className="card group flex flex-col overflow-hidden"
    >
      <ProductArt art={product.art} seedText={product.id} className="h-32 shrink-0" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Stars rating={product.rating} />
          <PointsChip points={product.points} />
        </div>
        <h3 className="text-[15px] font-semibold leading-snug">{product.title}</h3>
        <p className="line-clamp-2 text-[12.5px] leading-snug text-soft">
          {product.features.slice(0, 3).join(" · ")}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="font-display text-[17px] font-bold">{fmtMoney(product.price)}</p>
            {product.oldPrice && <p className="text-[12px] text-faint line-through">{fmtMoney(product.oldPrice)}</p>}
          </div>
          <button className="btn btn-ghost !px-4 !py-2 text-[13.5px] group-hover:border-pine/50 group-hover:text-pine" onClick={() => onBuy(product)}>
            Купить
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* ─────────── Спарклайн «Динамика цены» ─────────── */
function Sparkline({ history }: { history: number[] }) {
  const W = 560;
  const H = 150;
  const pad = 16;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const x = (i: number) => pad + (i / (history.length - 1)) * (W - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2);
  const path = history.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(history.length - 1)},${H - 4} L${x(0)},${H - 4} Z`;
  const minIdx = history.indexOf(min);
  const last = history.length - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--pine)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--pine)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={pad} x2={W - pad} y1={pad + t * (H - pad * 2)} y2={pad + t * (H - pad * 2)} stroke="var(--line)" strokeDasharray="3 6" />
      ))}
      <path d={area} fill="url(#spark-fill)" />
      <path d={path} fill="none" stroke="var(--pine)" strokeWidth="2.6" strokeLinecap="round" />
      {/* дно */}
      <circle cx={x(minIdx)} cy={y(min)} r="5" fill="var(--amber)" stroke="var(--card)" strokeWidth="2.5" />
      <text x={x(minIdx)} y={y(min) + 18} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--warn)">
        дно · {fmtMoney(min)}
      </text>
      {/* сегодня */}
      <circle cx={x(last)} cy={y(history[last])} r="5" fill="var(--pine)" stroke="var(--card)" strokeWidth="2.5" />
      <text x={x(last) - 8} y={y(history[last]) - 10} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--pine)">
        сегодня
      </text>
      <text x={pad} y={H - 2} fontSize="10" fill="var(--faint)">90 дней назад</text>
      <text x={W - pad} y={H - 2} textAnchor="end" fontSize="10" fill="var(--faint)">сегодня</text>
    </svg>
  );
}

/* ─────────── Сравнение со средней ценой ─────────── */
function MarketBar({ price, avg }: { price: number; avg: number }) {
  const cheaper = price <= avg;
  const pct = Math.abs(((avg - price) / avg) * 100);
  const pos = Math.min(88, Math.max(12, 50 - (price - avg) / avg * 160));
  return (
    <div>
      <p className={`mb-1 font-display text-[17px] font-bold ${cheaper ? "text-pine" : "text-warn"}`}>
        Сейчас {cheaper ? "дешевле" : "дороже"} средней на {pct.toFixed(0)}%
      </p>
      <p className="mb-4 text-[13px] text-soft">
        Средняя цена за 90 дней — {fmtMoney(avg)}. Нынешняя — {fmtMoney(price)}.
      </p>
      <div className="relative h-2.5 rounded-full bg-bg2">
        <span className="absolute left-1/2 top-[-6px] h-5 w-0.5 -translate-x-1/2 rounded bg-faint/70" />
        <motion.span
          className="absolute top-1/2 h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow"
          style={{ background: cheaper ? "var(--pine)" : "var(--warn)", left: `${pos}%`, width: 18, height: 18 }}
          initial={{ left: "50%" }}
          animate={{ left: `${pos}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 16 }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11.5px] text-faint">
        <span>дешевле</span>
        <span>средняя</span>
        <span>дороже</span>
      </div>
    </div>
  );
}

/* ─────────── Четыре раскрывающихся дашборда ─────────── */
export function Dashboards({ product, all }: { product: Product; all: Product[] }) {
  const okCount = product.reliabilityChecks.filter((c) => c.status === "ok").length;
  return (
    <div className="grid gap-3">
      <Collapsible icon={LineChart} title="Динамика цены" hint="За 90 дней, с отметками «дно» и «сегодня»">
        <Sparkline history={product.priceHistory} />
      </Collapsible>

      <Collapsible icon={Scale} title="Средняя цена по рынку" hint="Сравнение нынешней цены со средней за 90 дней">
        <MarketBar price={product.price} avg={product.marketAverage} />
      </Collapsible>

      <Collapsible
        icon={ShieldCheck}
        title="Проверка надёжности"
        hint={`Пройдено проверок: ${okCount} из ${product.reliabilityChecks.length}`}
      >
        <ul className="space-y-2">
          {product.reliabilityChecks.map((c) => (
            <li key={c.label} className="flex items-start gap-2.5 text-[14px]">
              {c.status === "ok" ? (
                <Check size={16} className="mt-0.5 shrink-0 text-pine" />
              ) : (
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn" />
              )}
              <span className={c.status === "ok" ? "text-ink" : "text-warn"}>{c.label}</span>
            </li>
          ))}
        </ul>
      </Collapsible>

      <Collapsible icon={Table2} title="Полное сравнение" hint={`Все ${all.length} вариантов рядом`}>
        <div className="nice-scroll -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[600px] border-collapse text-[13.5px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-faint">
                <th className="pb-2 pr-4 font-semibold">Вариант</th>
                <th className="pb-2 pr-4 font-semibold">Цена</th>
                <th className="pb-2 pr-4 font-semibold">Баллы</th>
                <th className="pb-2 pr-4 font-semibold">Рейтинг</th>
                <th className="pb-2 pr-4 font-semibold">Доставка</th>
                <th className="pb-2 font-semibold">Гарантия</th>
              </tr>
            </thead>
            <tbody>
              {all.map((p) => (
                <tr key={p.id} className={`border-t border-line align-top ${p.isAuraChoice ? "bg-pine/6" : ""}`}>
                  <td className="py-2.5 pr-4 font-medium">
                    {p.title}
                    {p.isAuraChoice && <span className="ml-2 rounded-full bg-pine px-2 py-0.5 text-[10.5px] font-bold text-pine-fg">Выбор Aura</span>}
                  </td>
                  <td className="py-2.5 pr-4 font-semibold whitespace-nowrap">{fmtMoney(p.price)}</td>
                  <td className="py-2.5 pr-4 text-amber whitespace-nowrap">+{fmtNum(p.points)}</td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">★ {p.rating.toFixed(1)}</td>
                  <td className="py-2.5 pr-4">{p.delivery}</td>
                  <td className="py-2.5">{p.warranty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Collapsible>
    </div>
  );
}

/* ─────────── Модалка покупки (демо) ─────────── */
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
      toast(`+${fmtNum(product.points)} баллов появятся в кошельке после заказа`);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width={460}>
      <div className="p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-4">
          <ProductArt art={product.art} seedText={product.id} className="h-16 w-16 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{product.title}</p>
            <p className="text-[13px] text-soft">{fmtMoney(product.price)} · {product.delivery.toLowerCase()}</p>
          </div>
        </div>

        {mode === "points" && (
          <div className="mb-4 rounded-xl bg-amber-soft px-4 py-3 text-[13.5px] text-amber">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <ShoppingBag size={14} /> Покупка с баллами: −{fmtNum(product.points)} ₽ к цене
            </span>
            <p className="mt-0.5 text-[12.5px] opacity-90">Баллы — бесплатный бонус Aura, они уже на вашем счёте.</p>
          </div>
        )}

        <p className="mb-5 text-[13.5px] leading-relaxed text-soft">
          Это демо-прототип: настоящей покупки не происходит, деньги не списываются. В полной версии здесь откроется
          оформление заказа.
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
