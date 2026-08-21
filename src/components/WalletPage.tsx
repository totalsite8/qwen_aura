import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, BadgeCheck, Coins, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useWalletStore } from "../features/wallet/walletStore";
import { fadeUp, spring, stagger } from "../lib/motion";
import { copyText, fmtNum, plural, useCountUp } from "../lib/utils";

export function WalletPage() {
  const points = useWalletStore((s) => s.points);
  const history = useWalletStore((s) => s.history);
  const animated = useCountUp(points, 900);

  const share = async () => {
    const ok = await copyText("https://aura.app/invite?code=AURA1000");
    if (ok) toast.success("Ссылка скопирована — отправьте другу");
    else toast("Не удалось скопировать. Ссылка: aura.app/invite?code=AURA1000");
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <motion.header variants={stagger} initial="hidden" animate="show" className="mb-6">
        <motion.p variants={fadeUp} className="label-caps">
          Кошелёк
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-display text-[26px] font-bold sm:text-[30px]">
          Баллы Aura
        </motion.h1>
      </motion.header>

      <motion.section variants={stagger} initial="hidden" animate="show" className="space-y-5">
        {/* Баланс */}
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl p-7 text-white shadow-xl"
          style={{ background: "linear-gradient(135deg, #0d5546 0%, #0f7a63 45%, #128a6e 100%)" }}
        >
          <span
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #f0b45c, transparent 65%)" }}
          />
          <span
            className="pointer-events-none absolute -bottom-24 -left-10 h-52 w-52 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #7fe0c2, transparent 65%)" }}
          />
          <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-widest text-white/70">
            <Coins size={15} className="text-amber" />
            На счёте
          </p>
          <p className="mt-2 font-display text-[44px] font-bold leading-none sm:text-[54px]">
            {fmtNum(animated)}
            <span className="ml-3 text-[18px] font-medium text-white/75">{plural(animated, "балл", "балла", "баллов")}</span>
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3.5 py-1.5 text-[12.5px] font-semibold">
            <BadgeCheck size={14} />
            Баллы бесплатны и не сгорают
          </p>
        </motion.div>

        {/* Объяснение */}
        <motion.div variants={fadeUp} className="card p-6">
          <p className="text-[15px] leading-relaxed">
            В связи с большим количеством пользователей мы ввели систему баллов.{" "}
            <strong className="text-pine">Они бесплатны.</strong>
          </p>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {[
              { icon: Sparkles, text: "Начисляются как бонус за покупки через Aura" },
              { icon: Coins, text: "Начисляются сверх цены после покупки — это бонус, а не скидка" },
              { icon: BadgeCheck, text: "Поиск при этом всегда остаётся бесплатным" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 rounded-2xl bg-bg2/60 p-3.5 text-[13px] leading-snug text-soft">
                <Icon size={16} className="mt-0.5 shrink-0 text-pine" />
                {text}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Реферальный блок */}
        <motion.div variants={fadeUp} className="card flex flex-col items-start gap-4 border-amber/40 p-6 sm:flex-row sm:items-center">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-soft text-amber">
            <Share2 size={20} />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-[17px] font-semibold">Порекомендуй другу — получи 1000 баллов</h2>
            <p className="mt-1 text-[13.5px] text-soft">
              Другу тоже начислим приветственные баллы. Бесплатно для обоих, без условий.
            </p>
          </div>
          <button className="btn btn-primary w-full sm:w-auto" onClick={share}>
            Поделиться
          </button>
        </motion.div>

        {/* История */}
        <motion.div variants={fadeUp} className="card p-6">
          <h2 className="label-caps mb-3">Последние начисления</h2>
          <ul className="divide-y divide-line">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-3 py-2.5">
                <span className={`grid h-8 w-8 place-items-center rounded-full ${h.amount >= 0 ? "bg-pine/10 text-pine" : "bg-warn/10 text-warn"}`}>
                  {h.amount >= 0 ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium">{h.label}</p>
                  <p className="text-[12px] text-faint">{h.date}</p>
                </div>
                <span className={`font-display text-[15px] font-bold ${h.amount >= 0 ? "text-pine" : "text-warn"}`}>
                  {h.amount >= 0 ? "+" : "−"}
                  {fmtNum(Math.abs(h.amount))}
                </span>
              </li>
            ))}
          </ul>
          {history.length === 0 && <p className="py-4 text-center text-[13px] text-faint">Пока пусто — баллы появятся после первой покупки</p>}
        </motion.div>

        <motion.p variants={fadeUp} className="pb-4 text-center text-[12px] text-faint">
          Демо-данные · баллы — бесплатный бонус, а не способ оплаты поиска
        </motion.p>
      </motion.section>
    </main>
  );
}
