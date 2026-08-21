import { Download, Share } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../../components/ui";
import { isIOS, promptInstall, usePwaStore } from "./pwaStore";

/** Предложение добавить Aura на главный экран — аккуратно, без «ошибки», если установка недоступна */
export function InstallModal() {
  const modalOpen = usePwaStore((s) => s.modalOpen);
  const closeModal = usePwaStore((s) => s.closeModal);
  const canInstall = usePwaStore((s) => s.canInstall);

  const install = async () => {
    const res = await promptInstall();
    if (res === "accepted") {
      toast.success("Aura установлена — ищите её на главном экране");
      closeModal();
    } else {
      toast("Хорошо! Установить можно в любой момент");
    }
  };

  const ios = isIOS();
  const steps = ios
    ? ["Нажмите «Поделиться» под экраном", "Выберите «На экран “Домой”»", "Готово — Aura появится рядом с приложениями"]
    : [
        "Откройте меню браузера (⋮ или ⌘)",
        "Выберите «Установить приложение» или «Добавить на главный экран»",
        "Готово — Aura будет открываться как приложение",
      ];

  return (
    <Modal open={modalOpen} onClose={closeModal} width={430}>
      <div className="p-7">
        <div className="mb-4 flex items-center gap-4">
          <img src="icon.svg" alt="" className="h-14 w-14 rounded-2xl border border-line shadow-md" />
          <div>
            <h2 className="font-display text-lg font-semibold">Aura всегда под рукой</h2>
            <p className="text-[13.5px] text-soft">Добавьте на главный экран — поиск откроется мгновенно</p>
          </div>
        </div>

        {canInstall ? (
          <button onClick={install} className="btn btn-primary mt-2 w-full">
            <Download size={17} />
            Установить приложение
          </button>
        ) : (
          <ol className="mt-1 space-y-2.5">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-3 text-[14px]">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pine/12 text-[12px] font-bold text-pine">
                  {i + 1}
                </span>
                <span className="leading-snug text-ink">{s}</span>
              </li>
            ))}
          </ol>
        )}

        {ios && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-bg2 px-3 py-2.5 text-[13px] text-soft">
            <Share size={14} className="shrink-0" />
            На iPhone кнопка «Поделиться» — квадрат со стрелкой вверх
          </p>
        )}

        <p className="mt-4 text-center text-[12px] text-faint">
          Демо-прототип · установка работает в поддерживаемых браузерах
        </p>
      </div>
    </Modal>
  );
}
