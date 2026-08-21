import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { spring } from "../lib/motion";
import type { ProcessStep } from "../types";

/**
 * Живая лента «Что я сейчас делаю»: события появляются постепенно,
 * активное пульсирует, выполненные гаснут с галочкой.
 */
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
  const running = activeIndex < steps.length;
  const doneCount = Math.min(activeIndex, steps.length);
  const current = running ? steps[activeIndex] : null;

  return (
    <div className="glass sticky top-3 z-30 overflow-hidden rounded-3xl shadow-lg shadow-black/5">
      <button
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5"
      >
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
          <span className="label-caps block">Что я сейчас делаю</span>
          <span className="block truncate text-[14px] font-medium text-ink">
            {running && current ? `${current.text}…` : "Готово — можно смотреть результат"}
          </span>
        </span>
        <span className="hidden shrink-0 text-[13px] font-semibold text-soft sm:block">
          {doneCount} из {steps.length}
        </span>
        <motion.span animate={{ rotate: collapsed ? -90 : 0 }} transition={spring} className="shrink-0 text-faint">
          <ChevronDown size={18} />
        </motion.span>
      </button>

      {/* прогресс-нитка */}
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
            key="list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 18 }}
            className="overflow-hidden"
          >
            <ul className="space-y-1 px-4 pb-4 pt-2 sm:px-5">
              <AnimatePresence initial={false}>
                {steps.slice(0, activeIndex + 1).map((step, i) => {
                  const done = i < activeIndex;
                  const active = i === activeIndex && running;
                  return (
                    <motion.li
                      key={step.id}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={spring}
                      className={`flex items-center gap-3 rounded-xl px-2 py-1.5 text-[14px] ${
                        active ? "event-pulse bg-pine/8 font-semibold text-ink" : ""
                      } ${done ? "text-soft" : ""} ${!done && !active ? "text-faint" : ""}`}
                    >
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                          done ? "bg-pine/14 text-pine" : active ? "bg-amber-soft text-amber" : "bg-line/50 text-faint"
                        }`}
                      >
                        {done ? <Check size={13} /> : <step.icon size={13} />}
                      </span>
                      <span className="flex-1">{step.text}</span>
                      {active && (
                        <span className="flex gap-1">
                          {[0, 1, 2].map((d) => (
                            <motion.span
                              key={d}
                              className="h-1 w-1 rounded-full bg-amber"
                              animate={{ opacity: [0.25, 1, 0.25] }}
                              transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }}
                            />
                          ))}
                        </span>
                      )}
                      {done && <span className="text-[12px] text-faint">готово</span>}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
