import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, Clock, MapPin, MessageSquare, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { fadeUp, spring, stagger } from "../lib/motion";
import { fmtNum } from "../lib/utils";

const TASK = [
  { icon: Wrench, label: "Услуга", value: "Остекление балкона, 3 метра" },
  { icon: MapPin, label: "Район", value: "Академический, ваш город" },
  { icon: Clock, label: "Желаемый срок", value: "В течение месяца" },
  { icon: MessageSquare, label: "Комментарий клиента", value: "«Нужно тёплое остекление, 4 этаж, хочется гарантию»" },
];

/** Страница для исполнителя: ноль трения — без регистрации и кабинета */
export function SmartLinkPage() {
  const [price, setPrice] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    const num = parseInt(price.replace(/\D/g, ""), 10);
    if (!num || num <= 0) {
      toast("Укажите цену цифрами — например, 75 000");
      return;
    }
    setSent(true);
    toast.success(`Цена ${fmtNum(num)} ₽ отправлена (демо)`);
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10">
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={fadeUp} className="flex items-center gap-2">
          <span className="rounded-full bg-teal/12 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-teal">
            Демо для исполнителей
          </span>
          <span className="text-[12px] text-faint">так выглядит заказ изнутри</span>
        </motion.div>

        <motion.h1 variants={fadeUp} className="font-display text-[26px] font-bold leading-tight sm:text-[32px]">
          Новый заказ <span className="text-pine">в вашем районе</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="max-w-lg text-[14.5px] leading-relaxed text-soft">
          Ноль трения: без регистрации, без личного кабинета, без анкет. Просто посмотрите задачу и ответьте своей
          ценой — клиент увидит её в общем списке предложений.
        </motion.p>

        <motion.div variants={fadeUp} className="card space-y-3.5 p-6">
          {TASK.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pine/10 text-pine">
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="label-caps !text-[10.5px]">{label}</p>
                <p className="text-[14.5px] font-medium leading-snug">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {!sent ? (
          <motion.div variants={fadeUp} className="card p-6">
            <label htmlFor="price" className="label-caps mb-2 block">
              Ваша цена
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="price"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Например, 75 000"
                  className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 pr-10 font-display text-[18px] font-semibold outline-none transition focus:border-pine/60"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-display text-[16px] font-bold text-faint">₽</span>
              </div>
            </div>
            <button className="btn btn-primary mt-4 w-full" onClick={submit}>
              Отправить цену
            </button>
            <p className="mt-3 text-center text-[12px] text-faint">
              Отправка бесплатная · цена видна только клиенту и Aura
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="card border-pine/50 p-8 text-center shadow-lg shadow-pine/10"
          >
            <motion.span
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 12 }}
              className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-pine/12 text-pine"
            >
              <CheckCircle2 size={30} />
            </motion.span>
            <h2 className="font-display text-[20px] font-semibold">Цена отправлена</h2>
            <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-soft">
              Клиент увидит ваше предложение вместе с другими и сможет выбрать его. Никаких регистраций — мы просто
              свяжем вас, когда будет нужно.
            </p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-pine">
              <BadgeCheck size={14} />
              Демо-режим: на самом деле ничего не отправлено
            </div>
            <button
              className="btn btn-ghost mx-auto mt-5"
              onClick={() => {
                setSent(false);
                setPrice("");
              }}
            >
              Посмотреть ещё заказ (демо)
            </button>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
