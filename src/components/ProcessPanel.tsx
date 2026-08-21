import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ExternalLink, Loader2, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { computeStats } from "../data/scenarios";
import { spring } from "../lib/motion";
import { fmtNum, isFastMode, speed, useCountUp, useTyped } from "../lib/utils";
import type { FeedItem, ProcessStep } from "../types";

/* ─────────── Элементы живой ленты ─────────── */

function QueryLine({ item, live }: { item: FeedItem; live: boolean }) {
  const typed = useTyped(item.text, live);
  const typing = live && typed.length < item.text.length;
  return (
    <div className="flex items-center gap-2 font-mono text-[12.5px] text-ink">
      <Search size={12} className="shrink-0 text-pine" />
      <span className="truncate">
        {typed}
        {typing && <span className="caret" />}
      </span>
    </div>
  );
}

function MarketPill({ item, live }: { item: FeedItem; live: boolean }) {
  const [done, setDone] = useState(!live);
  useEffect(() => {
    if (!live) return;
    const t = window.setTimeout(() => setDone(true), speed(430 + Math.random() * 470));
    return () => window.clearTimeout(t);
  }, [live]);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors duration-300 ${
        done ? "border-pine/40 bg-pine/10 text-ink" : "border-line bg-card text-soft"
      }`}
    >
      {done ? <Check size={11} className="text-pine" /> : <Loader2 size={11} className="animate-spin text-faint" style={{ animationDuration: "1.1s" }} />}
      {item.text}
      {done && item.count !== undefined && (
        <b className="text-pine">{item.detail === "ответ" ? `${item.count} мин` : fmtNum(item.count)}</b>
      )}
    </span>
  );
}

function LinkTicker({ item, live }: { item: FeedItem; live: boolean }) {
  const urls = item.urls ?? [];
  const [i, setI] = useState(urls.length - 1);
  useEffect(() => {
    if (!live || urls.length < 2) return;
    setI(0);
    const iv = window.setInterval(() => setI((x) => (x + 1) % urls.length), speed(400));
    return () => window.clearInterval(iv);
  }, [live, urls.length]);
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{item.text}</p>
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.16 }}
          className="flex items-center gap-1.5 truncate font-mono text-[11.5px] text-teal"
        >
          <ExternalLink size={11} className="shrink-0" />
          <span className="truncate">{urls[i]}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function StatRow({ item, live }: { item: FeedItem; live: boolean }) {
  const n = useCountUp(item.count ?? 0, 650);
  return (
    <div className="flex items-baseline gap-2">
      {item.count !== undefined && (
        <span className="font-mono text-[19px] font-bold leading-none text-pine">{live || n ? fmtNum(n) : "—"}</span>
      )}
      <span className="text-[13px] font-medium text-ink">{item.text}</span>
    </div>
  );
}

function CompareList({ items, live }: { items: FeedItem[]; live: boolean }) {
  const max = Math.max(...items.map((i) => i.count ?? 1), 1);
  const best = items.reduce((a, b) => ((b.count ?? 0) > (a.count ?? 0) ? b : a), items[0]);
  return (
    <ul className="space-y-1.5">
      {items.map((it) => {
        const isBest = it === best;
        return (
          <li key={it.text} className="relative overflow-hidden rounded-lg border border-line/70 bg-card px-2.5 py-1.5">
            <span
              className={`absolute inset-y-0 left-0 ${isBest ? "bg-pine/14" : "bg-line/40"}`}
              style={{ width: `${Math.max(12, ((it.count ?? 0) / max) * 100)}%` }}
            />
            <div className="relative flex items-center justify-between gap-2">
              <span className="truncate text-[12.5px] font-semibold">
                {it.text}
                {isBest && <span className="ml-1.5 rounded bg-pine px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-pine-fg">лучший</span>}
              </span>
              <span className="shrink-0 truncate font-mono text-[11px] text-soft">{it.detail}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function FeedArea({ feeds, shown, live }: { feeds: FeedItem[]; shown: number; live: boolean }) {
  const items = feeds.slice(0, shown);
  const compareItems = items.filter((f) => f.kind === "compare");
  // маркетплейсы группируются в одну строку пилюль на месте первого вхождения
  const simple: FeedItem[] = [];
  let marketsIn = false;
  for (const f of items) {
    if (f.kind === "compare") continue;
    if (f.kind === "market") {
      if (marketsIn) continue;
      marketsIn = true;
    }
    simple.push(f);
  }
  return (
    <div className="bg-grid relative overflow-hidden rounded-xl border border-line/70 bg-bg2/50 p-3">
      {live && <span className="scanline" />}
      <div className="relative space-y-2.5">
        <AnimatePresence initial={false}>
          {simple.map((f, i) => (
            <motion.div
              key={`${f.kind}-${f.text}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
            >
              {f.kind === "query" && <QueryLine item={f} live={live} />}
              {f.kind === "market" && <MarketPills items={items.filter((x) => x.kind === "market")} live={live} />}
              {f.kind === "link" && <LinkTicker item={f} live={live} />}
              {f.kind === "check" && (
                <p className="flex items-start gap-1.5 text-[12.5px] text-ink">
                  <Check size={13} className="mt-0.5 shrink-0 text-pine" />
                  {f.text}
                </p>
              )}
              {f.kind === "stat" && <StatRow item={f} live={live} />}
            </motion.div>
          ))}
        </AnimatePresence>
        {compareItems.length > 0 && <CompareList items={compareItems} live={live} />}
      </div>
    </div>
  );
}

function MarketPills({ items, live }: { items: FeedItem[]; live: boolean }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <MarketPill key={it.text} item={it} live={live} />
      ))}
    </span>
  );
}

/* ─────────── Панель «Что я сейчас делаю» ─────────── */

export function ProcessPanel({
  steps,
  activeIndex,
  collapsed,
  onToggle,
}: {
  steps: ProcessStep[];
  activeIndex: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const finished = activeIndex >= steps.length;
  const running = !finished;
  const current = running ? steps[activeIndex] : null;
  const stats = computeStats(steps);

  // постепенное появление фидов активного шага
  const [revealed, setRevealed] = useState<Record<number, number>>({});
  useEffect(() => {
    setRevealed((prev) => {
      const next = { ...prev };
      for (let i = 0; i < activeIndex && i < steps.length; i++) next[i] = steps[i].feeds.length;
      return next;
    });
    if (activeIndex >= steps.length) return;
    const step = steps[activeIndex];
    const iv = window.setInterval(() => {
      setRevealed((prev) => {
        const cur = prev[activeIndex] ?? 0;
        if (cur >= step.feeds.length) {
          window.clearInterval(iv);
          return prev;
        }
        return { ...prev, [activeIndex]: cur + 1 };
      });
    }, speed(Math.max(170, step.duration / (step.feeds.length + 1))));
    return () => window.clearInterval(iv);
  }, [activeIndex, steps]);

  const doneCount = Math.min(activeIndex, steps.length);

  return (
    <div className="glass sticky top-[70px] z-30 overflow-hidden rounded-3xl shadow-lg shadow-black/5 sm:top-[76px]">
      <button onClick={onToggle} aria-expanded={!collapsed} className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5">
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pine/12 text-pine">
          {running ? (
            <>
              <Loader2 size={17} className="animate-spin" style={{ animationDuration: "1.4s" }} />
              <span className="event-pulse absolute inset-0 rounded-full" />
            </>
          ) : (
            <Check size={17} />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="label-caps block">{running ? "Что я сейчас делаю" : "Что я сделала"}</span>
          {running && current ? (
            <span className="block truncate text-[14px] font-medium text-ink">{current.text}…</span>
          ) : (
            <span className="block truncate text-[13px] font-medium text-soft">
              {stats.offers > 0 ? `${fmtNum(stats.offers)} предложений` : `${stats.responses} ответов`} ·{" "}
              {stats.markets} площадок · {stats.pages} страниц · ~{stats.sec} с
            </span>
          )}
        </span>
        {running && (
          <span className="hidden shrink-0 font-mono text-[12px] font-semibold text-soft sm:block">
            {doneCount}/{steps.length}
          </span>
        )}
        <motion.span animate={{ rotate: collapsed ? -90 : 0 }} transition={spring} className="shrink-0 text-faint">
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <div className="h-[3px] w-full bg-line/60">
        <motion.div
          className="h-full rounded-r-full bg-pine"
          animate={{ width: `${(doneCount / steps.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        />
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 18 }}
            className="overflow-hidden"
          >
            <ul className="nice-scroll max-h-[430px] space-y-2 overflow-y-auto px-4 pb-4 pt-2.5 sm:px-5">
              {steps.map((step, i) => {
                const done = i < activeIndex || finished;
                const active = i === activeIndex && running;
                if (i > activeIndex && running) return null; // будущие шаги не показываем
                const shown = done || active ? (revealed[i] ?? 0) : 0;
                return (
                  <motion.li
                    key={step.id}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={spring}
                    className="space-y-2"
                  >
                    <div
                      className={`flex items-center gap-3 rounded-xl px-2 py-1.5 text-[14px] ${
                        active ? "event-pulse bg-pine/8 font-semibold text-ink" : ""
                      } ${done ? "text-ink" : "text-faint"}`}
                    >
                      <span
                        className={`grid h-6.5 w-6.5 shrink-0 place-items-center rounded-full ${
                          done ? "bg-pine/14 text-pine" : active ? "bg-amber-soft text-amber" : "bg-line/50 text-faint"
                        }`}
                        style={{ width: 26, height: 26 }}
                      >
                        {done ? <Check size={13} /> : <step.icon size={13} />}
                      </span>
                      <span className="flex-1">{step.text}</span>
                      {done && !isFastMode() && (
                        <span className="font-mono text-[11px] text-faint">{(step.duration / 1000).toFixed(1).replace(".", ",")} с</span>
                      )}
                      {active && <Zap size={13} className="text-amber" />}
                    </div>
                    {step.feeds.length > 0 && shown > 0 && (
                      <div className="pl-10">
                        <FeedArea feeds={step.feeds} shown={shown} live={active} />
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
