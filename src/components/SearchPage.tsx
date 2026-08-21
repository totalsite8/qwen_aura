import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Gift,
  Info,
  Link2,
  ListChecks,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Timer,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { computeStats, FALLBACK_EXAMPLES, resolveScenario } from "../data/scenarios";
import { fadeUp, spring, stagger } from "../lib/motion";
import { fmtMoney, parsePrice, speed, usePrefersReducedMotion } from "../lib/utils";
import type { CompanyOffer, Product, Scenario } from "../types";
import {
  BuyModal,
  ChoiceTile,
  CompareModal,
  CompareTile,
  GaugeTile,
  HistoryTile,
  HonestTile,
  ProductCard,
  ReliabilityTile,
  SentimentTile,
  WhyTile,
} from "./ProductBits";
import { ProcessPanel } from "./ProcessPanel";
import { ProductArt } from "./ProductArt";
import { Collapsible, MaskTitle, Modal, Stars, TypeBadge } from "./ui";

type Phase = "clarify" | "working" | "done";

export function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  if (!q) return <Navigate to="/" replace />;
  return <SearchFlow key={q} query={q} />;
}

/* ─────────── Реплика Aura ─────────── */
function AuraSays({ text }: { text: string }) {
  return (
    <motion.div variants={fadeUp} className="flex items-start gap-3">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full shadow-md"
        style={{ background: "radial-gradient(circle at 32% 27%, #b8f4de, #128571 62%, #07332b)" }}
      >
        <Sparkles size={16} className="text-white/90" />
      </span>
      <div className="glass rounded-2xl rounded-tl-md px-4 py-3 text-[14.5px] leading-relaxed">{text}</div>
    </motion.div>
  );
}

/* ─────────── Навигация по секциям выдачи ─────────── */
function SectionNav({ ids }: { ids: { id: string; label: string }[] }) {
  const [active, setActive] = useState(ids[0]?.id ?? "");
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-25% 0px -55% 0px" }
    );
    ids.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return (
    <nav
      className="nice-scroll sticky top-[136px] z-20 -mx-4 flex gap-1.5 overflow-x-auto border-y border-line/70 bg-bg/85 px-4 py-2 backdrop-blur-md sm:top-[140px]"
      aria-label="Разделы результата"
    >
      {ids.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            active === id ? "bg-pine text-pine-fg" : "bg-card text-soft hover:text-ink border border-line"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

/* ─────────── Итог поиска: что сделала команда ─────────── */
function SummaryStrip({ scenario, onShowProcess }: { scenario: Scenario; onShowProcess: () => void }) {
  const s = computeStats(scenario.plan);
  const isService = scenario.type === "service_search";
  const cells = [
    { icon: Store, v: s.markets, label: isService ? "компаний" : "магазинов" },
    { icon: Package, v: isService ? s.responses : s.offers, label: isService ? "ответов" : "предложений" },
    { icon: Link2, v: s.pages, label: "страниц открыто" },
    { icon: ShieldCheck, v: s.checks, label: "проверок" },
    { icon: Timer, v: s.sec, label: "секунд", text: `~${s.sec}` },
  ];
  return (
    <motion.section variants={fadeUp} id="itog" className="tile tile-static scroll-mt-44 overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <p className="label-caps">Что сделала команда</p>
        <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2">
          {cells.map((c) => (
            <span key={c.label} className="inline-flex items-center gap-2">
              <c.icon size={15} className="text-pine" />
              <b className="font-mono text-[15px]">{c.text ?? c.v}</b>
              <span className="text-[12.5px] text-soft">{c.label}</span>
            </span>
          ))}
        </div>
        <button className="btn btn-ghost !px-3.5 !py-1.5 text-[12.5px]" onClick={onShowProcess}>
          Как мы это сделали
        </button>
      </div>
      <div className="nice-scroll flex gap-2 overflow-x-auto border-t border-line px-5 py-3">
        {scenario.plan.lanes.map((l) => (
          <span
            key={l.id}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-bg2/60 px-3 py-1.5 text-[12px] font-medium text-soft"
            title={l.result}
          >
            <l.icon size={13} className="text-pine" />
            {l.role}
            <span className="text-faint">·</span>
            <span className="max-w-[240px] truncate text-ink">{l.result}</span>
          </span>
        ))}
      </div>
    </motion.section>
  );
}

/* ─────────── Сводка «Поняла задачу» ─────────── */
function TaskSummary({ scenario, answers }: { scenario: Scenario; answers: Record<string, string> }) {
  const rows: { label: string; value: string }[] = [
    { label: "Услуга", value: scenario.label },
    ...scenario.questions
      .filter((q) => q.summaryLabel && answers[q.id])
      .map((q) => ({
        label: q.summaryLabel as string,
        value: q.options.find((o) => o.id === answers[q.id])?.label ?? "—",
      })),
    { label: "Город", value: "Ваш город" },
  ];
  return (
    <motion.div variants={fadeUp} className="tile tile-static p-5 xl:col-span-2">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-pine/10 text-pine">
          <ListChecks size={17} />
        </span>
        <div>
          <p className="font-semibold">Поняла задачу</p>
          <p className="text-[12.5px] text-soft">Отправила её в проверенные компании — регистрация не нужна</p>
        </div>
      </div>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 border-b border-dashed border-line pb-1.5 text-[14px]">
            <dt className="text-soft">{r.label}</dt>
            <dd className="text-right font-semibold">{r.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}

/* ─────────── Сравнение цен компаний (бары) ─────────── */
function PriceBarsTile({ companies }: { companies: CompanyOffer[] }) {
  const vals = companies.map((c) => parsePrice(c.estimatedPrice));
  const max = Math.max(...vals, 1);
  return (
    <motion.div variants={fadeUp} className="tile tile-static flex flex-col p-5">
      <p className="label-caps mb-3">Предварительные цены</p>
      <ul className="space-y-2.5">
        {companies.map((c, i) => (
          <li key={c.id}>
            <div className="mb-1 flex justify-between gap-2 text-[12px]">
              <span className={`truncate font-semibold ${c.recommended ? "text-pine" : ""}`}>{c.companyName}</span>
              <span className="shrink-0 font-mono text-soft">{c.estimatedPrice}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-line/50">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: c.hiddenFeesWarning
                    ? "var(--warn)"
                    : c.recommended
                      ? "var(--pine)"
                      : "color-mix(in srgb, var(--faint) 55%, transparent)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(vals[i] / max) * 100}%` }}
                transition={{ type: "spring", stiffness: 70, damping: 17, delay: 0.15 + i * 0.07 }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-auto pt-3 text-[11.5px] leading-snug text-faint">
        Жёлтым — компании, где вероятны доплаты сверх названной цены
      </p>
    </motion.div>
  );
}

/* ─────────── Карточка компании ─────────── */
function CompanyCard({ c, wide = false, onSelect }: { c: CompanyOffer; wide?: boolean; onSelect: () => void }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={spring}
      className={`tile relative flex flex-col p-5 ${wide ? "md:col-span-2 !border-pine/50 shadow-lg shadow-pine/10" : ""}`}
    >
      {c.recommended && (
        <span className="absolute -top-3 left-5 inline-flex items-center gap-1.5 rounded-full bg-pine px-3 py-1 text-[11.5px] font-bold text-pine-fg shadow">
          <Sparkles size={12} />
          Рекомендация Aura
        </span>
      )}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[16px] font-bold">{c.companyName}</h3>
        <Stars rating={c.rating} count={c.reviewsCount} />
      </div>
      <p className="font-display text-[21px] font-bold">
        {c.estimatedPrice}
        <span className="ml-2 align-middle text-[11.5px] font-medium text-faint">предварительно</span>
      </p>
      <div className="mt-2 space-y-1 text-[13px] text-soft">
        <p className="flex items-center gap-1.5">
          <Clock size={13} className="text-pine" /> Ответ {c.responseTime}
        </p>
        <p className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-pine" /> Гарантия: {c.warranty}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.tags.map((t) => (
          <span
            key={t}
            className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
              t.includes("скрытые") ? "bg-warn/12 text-warn" : "bg-bg2 text-soft"
            }`}
          >
            {t}
          </span>
        ))}
      </div>
      <ul className="mt-3 space-y-1">
        {c.notes.map((n) => (
          <li key={n} className="flex items-start gap-2 text-[12.5px] leading-snug text-soft">
            <Info size={13} className={`mt-0.5 shrink-0 ${c.hiddenFeesWarning && n === c.notes[0] ? "text-warn" : "text-faint"}`} />
            {n}
          </li>
        ))}
      </ul>
      <button className={`btn mt-4 ${c.recommended ? "btn-primary" : "btn-ghost"}`} onClick={onSelect}>
        Выбрать
      </button>
    </motion.article>
  );
}

/* ─────────── Основной поток ─────────── */
function SearchFlow({ query }: { query: string }) {
  const scenario = useMemo(() => resolveScenario(query), [query]);

  const [phase, setPhase] = useState<Phase>(() =>
    scenario && scenario.questions.length > 0 ? "clarify" : "working"
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsed, setElapsed] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [buy, setBuy] = useState<{ p: Product; mode: "points" | "plain" } | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [chosenCompany, setChosenCompany] = useState<CompanyOffer | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const timers = useRef<number[]>([]);
  const started = useRef(false);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // масштабированный план: ?fast=1 ускоряет команду
  const scaledPlan = useMemo(
    () =>
      scenario
        ? {
            lanes: scenario.plan.lanes.map((l) => ({
              ...l,
              offset: speed(l.offset),
              duration: speed(l.duration),
            })),
            total: speed(scenario.plan.total),
          }
        : { lanes: [], total: 0 },
    [scenario]
  );

  const startProcess = useCallback(() => {
    if (!scenario || started.current) return;
    started.current = true;
    setPhase("working");
    setCollapsed(false);
    setElapsed(0);
  }, [scenario]);

  // тик времени, пока команда работает
  useEffect(() => {
    if (phase !== "working") return;
    const t0 = performance.now();
    const iv = window.setInterval(() => setElapsed(performance.now() - t0), 100);
    return () => window.clearInterval(iv);
  }, [phase]);

  // команда закончила — схлопываем процесс к итогу
  useEffect(() => {
    if (phase === "working" && scaledPlan.total > 0 && elapsed >= scaledPlan.total + 500) {
      setPhase("done");
      setCollapsed(true);
    }
  }, [phase, elapsed, scaledPlan.total]);

  useEffect(() => {
    if (scenario && scenario.questions.length === 0) startProcess();
  }, [scenario, startProcess]);

  const answer = (qid: string, oid: string) => {
    if (!scenario) return;
    setAnswers((a) => {
      const na = { ...a, [qid]: oid };
      if (scenario.questions.every((q) => na[q.id]) && !started.current) {
        timers.current.push(window.setTimeout(() => startProcess(), speed(650)));
      }
      return na;
    });
  };

  /* ── fallback ── */
  if (!scenario) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="tile tile-static p-7 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-pine/10 text-pine">
            <MessageSquare size={22} />
          </span>
          <h1 className="font-display text-[20px] font-semibold">Пока не поняла, что именно ищем</h1>
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-soft">
            Попробуйте чуть конкретнее: название товара, направление с бюджетом, кому подарок или какую услугу нужно сделать.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {FALLBACK_EXAMPLES.map((e) => (
              <Link key={e} to={`/search?q=${encodeURIComponent(e)}`} className="chip">
                {e}
              </Link>
            ))}
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[13px] text-faint">
            <Check size={14} className="text-pine" /> Поиск бесплатный
          </p>
        </motion.div>
      </main>
    );
  }

  const chosenProduct = scenario.products.find((p) => p.isAuraChoice) ?? scenario.products[0];
  const otherProducts = scenario.products.filter((p) => !p.isAuraChoice);
  const minOther = otherProducts.length ? Math.min(...otherProducts.map((p) => p.price)) : undefined;
  const firstUnanswered = scenario.questions.findIndex((q) => !answers[q.id]);

  const navIds =
    scenario.type === "service_search"
      ? [
          { id: "itog", label: "Итог" },
          { id: "task", label: "Задача" },
          { id: "offers", label: "Предложения" },
          { id: "attention", label: "Советы" },
        ]
      : [
          { id: "itog", label: "Итог" },
          { id: "choice", label: "Выбор Aura" },
          { id: "options", label: "Варианты" },
          { id: "analytics", label: "Аналитика" },
        ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <Link to="/" className="btn btn-ghost !p-2.5" aria-label="Вернуться на главную">
          <ArrowLeft size={17} />
        </Link>
        <TypeBadge type={scenario.type} />
        <h1 className="min-w-0 font-display text-[18px] font-semibold sm:text-[22px]">
          <MaskTitle text={query} />
        </h1>
      </header>

      <AnimatePresence mode="wait">
        {/* ── УТОЧНЕНИЕ ── */}
        {phase === "clarify" && (
          <motion.section key="clarify" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0, y: -12 }} className="mx-auto max-w-3xl space-y-4">
            <AuraSays text={scenario.intro} />
            {scenario.questions.map((q, qi) => {
              const done = !!answers[q.id];
              const active = qi === firstUnanswered;
              return (
                <motion.div
                  key={q.id}
                  variants={fadeUp}
                  className={`tile tile-static p-5 transition-all duration-300 ${!active && !done ? "opacity-45" : ""} ${active ? "!border-pine/40 shadow-md shadow-pine/5" : ""}`}
                >
                  <p className="label-caps mb-1">
                    Вопрос {qi + 1} из {scenario.questions.length}
                    {done && <span className="ml-2 !text-pine">· ответ есть</span>}
                  </p>
                  <p className="mb-3 text-[16px] font-semibold">{q.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((o) => {
                      const on = answers[q.id] === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          disabled={!active && !done}
                          onClick={() => answer(q.id, o.id)}
                          className={`chip ${on ? "chip-on" : ""} disabled:cursor-not-allowed`}
                        >
                          {on && <Check size={14} className="text-pine" />}
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
            <motion.p variants={fadeUp} className="flex items-center gap-1.5 pt-1 text-[13px] text-faint">
              <Check size={14} className="text-pine" />
              Ответьте на все — и Aura сразу начнёт искать. Поиск бесплатный.
            </motion.p>
          </motion.section>
        )}

        {/* ── РАБОТА ── */}
        {phase === "working" && (
          <motion.section key="working" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0, y: -12 }} className="mx-auto max-w-5xl space-y-5">
            <AuraSays text={scenario.intro} />
            {scenario.type === "service_search" && <div className="mx-auto max-w-3xl"><TaskSummary scenario={scenario} answers={answers} /></div>}
            <ProcessPanel plan={scaledPlan} elapsed={elapsed} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
            <div className="space-y-3" aria-hidden>
              <div className="tile shimmer h-32" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="tile shimmer h-24" />
                <div className="tile shimmer h-24" />
              </div>
            </div>
          </motion.section>
        )}

        {/* ── РЕЗУЛЬТАТ ── */}
        {phase === "done" && (
          <motion.section key="done" variants={stagger} initial="hidden" animate="show" className="space-y-6">
            <ProcessPanel plan={scaledPlan} elapsed={elapsed} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
            <SectionNav ids={navIds} />

            <SummaryStrip scenario={scenario} onShowProcess={() => { setCollapsed(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} />

            <motion.div variants={fadeUp} className="flex justify-end">
              <button
                className="btn btn-ghost !px-3.5 !py-2 text-[13px]"
                onClick={() => {
                  started.current = false;
                  setAnswers({});
                  setChosenCompany(null);
                  setContactSent(false);
                  setElapsed(0);
                  if (scenario.questions.length) {
                    setPhase("clarify");
                    setCollapsed(false);
                  } else {
                    startProcess();
                  }
                }}
              >
                <RotateCcw size={14} />
                Искать заново
              </button>
            </motion.div>

            {/* ═══ ТОВАРЫ / КАТЕГОРИЯ / ПОДАРОК ═══ */}
            {scenario.type !== "service_search" && chosenProduct && (
              <>
                {scenario.type === "gift_search" && (
                  <AuraSays text="Вот что я подобрала: главное направление — и ещё несколько идей рядом, чтобы точно попасть в настроение." />
                )}

                <section id="choice" className="scroll-mt-44 space-y-3">
                  <h2 className="label-caps !text-[12px]">Главный результат</h2>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <ChoiceTile product={chosenProduct} onBuy={(mode: "points" | "plain") => setBuy({ p: chosenProduct, mode })} />
                    <HonestTile product={chosenProduct} minOther={minOther} />
                    <ReliabilityTile product={chosenProduct} />
                  </div>
                </section>

                {scenario.type === "gift_search" && (
                  <section className="space-y-3">
                    <h2 className="flex items-center gap-2 font-display text-[17px] font-semibold">
                      <Gift size={17} className="text-pine" />
                      Ещё направления подарков
                    </h2>
                    <div className="grid gap-4 lg:grid-cols-3">
                      {scenario.giftDirections.map((d) => (
                        <motion.article key={d.title} variants={fadeUp} whileHover={{ y: -4 }} transition={spring} className="tile flex flex-col p-5">
                          <span className="mb-2 inline-flex items-center gap-1.5 text-pine">
                            <Gift size={14} />
                            <span className="label-caps !text-pine">Направление</span>
                          </span>
                          <h3 className="font-display text-[16px] font-semibold leading-snug">{d.title}</h3>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-soft">{d.subtitle}</p>
                          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-bg2/50 p-3">
                            <ProductArt art={d.main.art} seedText={d.main.id} className="h-16 w-16 shrink-0 rounded-xl" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13.5px] font-semibold">{d.main.title}</p>
                              <p className="font-display text-[15px] font-bold text-pine">{fmtMoney(d.main.price)}</p>
                              <Stars rating={d.main.rating} />
                            </div>
                            <button className="btn btn-ghost !px-3 !py-1.5 text-[12.5px]" onClick={() => setBuy({ p: d.main, mode: "plain" })}>
                              Купить
                            </button>
                          </div>
                          <ul className="mt-3 space-y-2">
                            {d.alternatives.map((a) => (
                              <li key={a.id} className="flex items-center justify-between gap-2 text-[13px]">
                                <span className="truncate text-soft">{a.title}</span>
                                <button className="shrink-0 font-mono font-semibold text-pine hover:underline" onClick={() => setBuy({ p: a, mode: "plain" })}>
                                  {fmtMoney(a.price)}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </motion.article>
                      ))}
                    </div>
                  </section>
                )}

                {otherProducts.length > 0 && (
                  <section id="options" className="scroll-mt-44 space-y-3">
                    <h2 className="flex items-baseline gap-2 font-display text-[17px] font-semibold">
                      Ещё варианты
                      <span className="text-[13px] font-medium text-faint">{otherProducts.length}</span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {otherProducts.map((p) => (
                        <ProductCard key={p.id} product={p} onBuy={(prod) => setBuy({ p: prod, mode: "plain" })} />
                      ))}
                    </div>
                  </section>
                )}

                <section id="analytics" className="scroll-mt-44 space-y-3">
                  <h2 className="label-caps !text-[12px]">Аналитика — всё под рукой</h2>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <GaugeTile product={chosenProduct} />
                    <HistoryTile product={chosenProduct} />
                    <SentimentTile product={chosenProduct} />
                    <WhyTile product={chosenProduct} />
                    <CompareTile all={scenario.products} onOpen={() => setCompareOpen(true)} />
                  </div>
                </section>
              </>
            )}

            {/* ═══ УСЛУГА ═══ */}
            {scenario.type === "service_search" && (
              <>
                <section id="task" className="scroll-mt-44 grid gap-4 xl:grid-cols-3">
                  <TaskSummary scenario={scenario} answers={answers} />
                  <PriceBarsTile companies={scenario.companies} />
                </section>

                <section id="offers" className="scroll-mt-44 space-y-3">
                  <h2 className="flex items-baseline gap-2 font-display text-[17px] font-semibold">
                    Ответы компаний
                    <span className="text-[13px] font-medium text-faint">{scenario.companies.length}</span>
                  </h2>
                  <div className="grid gap-4 pt-2 md:grid-cols-2 xl:grid-cols-3">
                    {scenario.companies.map((c) => (
                      <CompanyCard key={c.id} c={c} wide={c.recommended} onSelect={() => setChosenCompany(c)} />
                    ))}
                  </div>
                </section>

                <section id="attention" className="scroll-mt-44 mx-auto max-w-3xl">
                  <Collapsible icon={ShieldCheck} title="На что обратить внимание" hint="Честные мелочи, о которых часто забывают">
                    <ul className="space-y-2">
                      {scenario.attentionNotes.map((n) => (
                        <li key={n} className="flex items-start gap-2.5 text-[14px]">
                          <Info size={15} className="mt-0.5 shrink-0 text-pine" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  </Collapsible>
                </section>

                <AnimatePresence>
                  {chosenCompany && (
                    <motion.div
                      key="chosen"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={spring}
                      className="mx-auto max-w-2xl"
                    >
                      <div className="tile !border-pine/50 p-6 text-center shadow-lg shadow-pine/10">
                        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-pine/12 text-pine">
                          <CheckCircle2 size={22} />
                        </span>
                        <h3 className="font-display text-[19px] font-semibold">Вы выбрали «{chosenCompany.companyName}»</h3>
                        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-soft">
                          Контакты откроются после подтверждения заявки. Это бесплатно: вы просто соглашаетесь на звонок
                          или сообщение от исполнителя.
                        </p>
                        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                          <button className="btn btn-primary" onClick={() => setContactOpen(true)}>
                            <Phone size={16} />
                            Открыть контакт
                          </button>
                          <button className="btn btn-ghost" onClick={() => setChosenCompany(null)}>
                            Выбрать другую
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            <motion.p variants={fadeUp} className="pb-4 text-center text-[12px] text-faint">
              Демо-данные: цены, магазины и баллы иллюстративные · баллы — бесплатный бонус, они не меняют цену
            </motion.p>
          </motion.section>
        )}
      </AnimatePresence>

      <BuyModal product={buy?.p ?? null} mode={buy?.mode ?? "plain"} open={!!buy} onClose={() => setBuy(null)} />
      <CompareModal all={scenario.products} open={compareOpen} onClose={() => setCompareOpen(false)} />

      {/* контакт (услуги, демо) */}
      <Modal open={contactOpen} onClose={() => setContactOpen(false)} width={440}>
        <div className="p-6 sm:p-7">
          {contactSent ? (
            <div className="py-4 text-center">
              <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-pine/12 text-pine">
                <CheckCircle2 size={24} />
              </span>
              <h3 className="font-display text-[18px] font-semibold">Заявка отправлена (демо)</h3>
              <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-soft">
                В полной версии «{chosenCompany?.companyName}» свяжется с вами в рабочее время. А пока это демонстрация —
                никто никуда не звонит.
              </p>
              <button className="btn btn-primary mx-auto mt-5" onClick={() => { setContactOpen(false); setContactSent(false); }}>
                Понятно
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2 text-warn">
                <AlertTriangle size={16} />
                <span className="text-[13px] font-semibold">Демо-режим</span>
              </div>
              <h3 className="font-display text-[18px] font-semibold">Контакт «{chosenCompany?.companyName}»</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-soft">
                В демо-режиме контакт открывается условно: без реальных звонков и без передачи ваших данных.
              </p>
              <p className="mt-4 rounded-2xl bg-bg2 px-4 py-3 text-center font-mono text-[19px] font-bold tracking-wide">
                +7 900 000-00-00
              </p>
              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSent(true);
                  toast.success("Заявка отправлена (демо)");
                }}
              >
                <input
                  placeholder="Ваше имя"
                  aria-label="Ваше имя"
                  className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-[14px] outline-none transition focus:border-pine/50"
                />
                <textarea
                  placeholder="Комментарий (необязательно)"
                  aria-label="Комментарий"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-line bg-card px-4 py-2.5 text-[14px] outline-none transition focus:border-pine/50"
                />
                <div className="flex gap-2">
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setContactOpen(false)}>
                    Закрыть
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Отправить заявку
                  </button>
                </div>
              </form>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-faint">
                <MapPin size={12} /> Данные никуда не отправляются и не сохраняются
              </p>
            </>
          )}
        </div>
      </Modal>
    </main>
  );
}
