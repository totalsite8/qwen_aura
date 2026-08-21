import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ExternalLink, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { computeStats } from "../data/scenarios";
import { spring } from "../lib/motion";
import { fmtNum, speed, useCountUp, useTyped } from "../lib/utils";
import type { FeedItem, Lane, ProcessPlan } from "../types";

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
      {done ? (
        <Check size={11} className="text-pine" />
      ) : (
        <Loader2 size={11} className="animate-spin text-faint" style={{ animationDuration: "1.1s" }} />
      )}
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

function StatRow({ item }: { item: FeedItem }) {
  const n = useCountUp(item.count ?? 0, 650);
  return (
    <div className="flex items-baseline gap-2">
      {item.count !== undefined && (
        <span className="font-mono text-[19px] font-bold leading-none text-pine">{n ? fmtNum(n) : "—"}</span>
      )}
      <span className="text-[13px] font-medium text-ink">{item.text}</span>
    </div>
  );
}

function CompareList({ items }: { items: FeedItem[] }) {
  const max = Math.max(...items.map((i) => i.count ?? 1), 1);
  const best = items.find((i) => i.best) ?? items.reduce((a, b) => ((b.count ?? 0) > (a.count ?? 0) ? b : a), items[0]);
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
                {isBest && (
                  <span className="ml-1.5 rounded bg-pine px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-pine-fg">лучший</span>
                )}
              </span>
              <span className="shrink-0 truncate font-mono text-[11px] text-soft">{it.detail}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ─────────── Дорожка одного специалиста ─────────── */

function LaneCard({ lane, elapsed }: { lane: Lane; elapsed: number }) {
  const laneElapsed = Math.max(0, Math.min(lane.duration, elapsed - lane.offset));
  const started = laneElapsed > 0;
  const done = laneElapsed >= lane.duration;
  const live = started && !done;

  const slot = lane.duration / (lane.feeds.length + 1);
  const shown = done ? lane.feeds.length : Math.min(lane.feeds.length, Math.floor(laneElapsed / slot));
  const items = lane.feeds.slice(0, shown);
  const compareItems = items.filter((f) => f.kind === "compare");
  const simple = items.filter((f) => f.kind !== "compare");
  const markets = simple.filter((f) => f.kind === "market");
  const firstMarketIdx = simple.findIndex((f) => f.kind === "market");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: started ? 1 : 0.45, y: 0 }}
      transition={spring}
      className={`flex flex-col rounded-2xl border bg-card/60 p-3 transition-colors duration-500 ${
        live ? "border-pine/40" : done ? "border-line" : "border-line/60"
      }`}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors ${
            done ? "bg-pine/14 text-pine" : "bg-amber-soft text-amber"
          }`}
        >
          {done ? <Check size={15} /> : <lane.icon size={15} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold leading-tight">{lane.role}</p>
          <p className={`truncate text-[11.5px] ${done ? "text-pine" : "text-faint"}`}>
            {done ? lane.result : started ? "работает…" : "подключается…"}
          </p>
        </div>
        <span className={`h-2 w-2 shrink-0 rounded-full ${done ? "bg-pine" : "bg-amber"}`}
          style={done ? undefined : { animation: "aura-pulse 1.3s ease-out infinite" }}
        />
      </div>

      <div className="bg-grid relative min-h-[74px] flex-1 overflow-hidden rounded-xl border border-line/70 bg-bg2/50 p-2.5">
        {live && <span className="scanline" />}
        <div className="relative space-y-2">
          <AnimatePresence initial={false}>
            {simple.map((f, i) => (
              <motion.div
                key={`${f.kind}-${f.text}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 18 }}
              >
                {f.kind === "query" && <QueryLine item={f} live={live} />}
                {f.kind === "market" &&
                  (i === firstMarketIdx ? (
                    <span className="flex flex-wrap gap-1.5">
                      {markets.map((m) => (
                        <MarketPill key={m.text} item={m} live={live} />
                      ))}
                    </span>
                  ) : null)}
                {f.kind === "link" && <LinkTicker item={f} live={live} />}
                {f.kind === "check" && (
                  <p className="flex items-start gap-1.5 text-[12px] leading-snug text-ink">
                    <Check size={12.5} className="mt-0.5 shrink-0 text-pine" />
                    {f.text}
                  </p>
                )}
                {f.kind === "stat" && <StatRow item={f} />}
              </motion.div>
            ))}
          </AnimatePresence>
          {compareItems.length > 0 && <CompareList items={compareItems} />}
          {!started && <p className="font-mono text-[11px] text-faint">ожидание…</p>}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────── Панель «Что я сейчас делаю» ─────────── */

export function ProcessPanel({
  plan,
  elapsed,
  collapsed,
  onToggle,
}: {
  plan: ProcessPlan;
  elapsed: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const finished = elapsed >= plan.total;
  const stats = computeStats(plan);
  const doneLanes = plan.lanes.filter((l) => elapsed - l.offset >= l.duration).length;
  const progress = Math.min(100, (elapsed / plan.total) * 100);

  return (
    <div className="glass sticky top-[70px] z-30 overflow-hidden rounded-3xl shadow-lg shadow-black/5 sm:top-[76px]">
      <button onClick={onToggle} aria-expanded={!collapsed} className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5">
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pine/12 text-pine">
          {finished ? <Check size={17} /> : (
            <>
              <Loader2 size={17} className="animate-spin" style={{ animationDuration: "1.4s" }} />
              <span className="event-pulse absolute inset-0 rounded-full" />
            </>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="label-caps block">{finished ? "Что сделала команда" : "Что я сейчас делаю"}</span>
          {finished ? (
            <span className="block truncate text-[13px] font-medium text-soft">
              {plan.lanes.length} специалиста ·{" "}
              {stats.offers > 0 ? `${fmtNum(stats.offers)} предложений` : `${stats.responses} ответов`} ·{" "}
              {stats.pages} страниц · ~{stats.sec} с
            </span>
          ) : (
            <span className="block truncate text-[14px] font-medium text-ink">
              {plan.lanes.length} специалиста работают параллельно · готово {doneLanes} из {plan.lanes.length}
            </span>
          )}
        </span>
        {!finished && (
          <span className="hidden shrink-0 font-mono text-[12px] font-semibold text-soft sm:block">
            {Math.round(progress)}%
          </span>
        )}
        <motion.span animate={{ rotate: collapsed ? -90 : 0 }} transition={spring} className="shrink-0 text-faint">
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <div className="h-[3px] w-full bg-line/60">
        <motion.div
          className="h-full rounded-r-full bg-pine"
          animate={{ width: `${progress}%` }}
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
            <div className="grid gap-2.5 p-4 sm:p-5 md:grid-cols-2">
              {plan.lanes.map((lane) => (
                <LaneCard key={lane.id} lane={lane} elapsed={elapsed} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
