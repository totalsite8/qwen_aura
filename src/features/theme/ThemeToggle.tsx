import { motion } from "framer-motion";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { springTight } from "../../lib/motion";
import { useThemeStore, type ThemeMode } from "./themeStore";

const OPTIONS: { mode: ThemeMode; icon: LucideIcon; label: string }[] = [
  { mode: "light", icon: Sun, label: "Светлая тема" },
  { mode: "system", icon: Monitor, label: "Системная тема" },
  { mode: "dark", icon: Moon, label: "Тёмная тема" },
];

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-line bg-card/80 p-1 backdrop-blur"
      role="radiogroup"
      aria-label="Тема оформления"
    >
      {OPTIONS.map(({ mode: m, icon: Icon, label }) => {
        const active = m === mode;
        return (
          <button
            key={m}
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setMode(m)}
            className={`relative rounded-full p-2 transition-colors ${active ? "text-pine" : "text-faint hover:text-ink"}`}
          >
            {active && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-full bg-pine/12"
                transition={springTight}
              />
            )}
            <Icon size={15} className="relative" />
          </button>
        );
      })}
    </div>
  );
}
