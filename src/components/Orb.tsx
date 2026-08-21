import { motion } from "framer-motion";

/**
 * Фирменная сфера Aura: неоднородное «стеклянное» ядро с ореолом,
 * янтарным кольцом и орбитальными искрами. Дышит и парит.
 */
export function Orb({ size = 176, onClick }: { size?: number; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Добавить Aura на главный экран"
      className="group relative block shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-4 focus-visible:ring-pine/40"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      {/* мягкий ореол */}
      <span
        className="absolute -inset-[28%] rounded-full opacity-45 blur-3xl transition-opacity duration-500 group-hover:opacity-65"
        style={{ background: "radial-gradient(circle at 40% 35%, var(--teal), transparent 62%)" }}
      />
      {/* ядро с «дыханием» */}
      <span
        className="anim-breathe absolute inset-0 block rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 27%, #b8f4de 0%, #53cdb4 26%, #128571 55%, #0b4a3e 78%, #07332b 100%)",
          boxShadow:
            "inset -16px -20px 52px rgba(3,18,15,.55), inset 12px 14px 34px rgba(255,255,255,.22), 0 26px 70px -18px rgba(15,110,96,.6)",
        }}
      >
        {/* блики */}
        <span
          className="absolute rounded-full"
          style={{
            left: "16%",
            top: "12%",
            width: "38%",
            height: "26%",
            background: "radial-gradient(ellipse at center, rgba(255,255,255,.85), rgba(255,255,255,0) 70%)",
            transform: "rotate(-18deg)",
          }}
        />
        <span
          className="absolute rounded-full opacity-60"
          style={{
            right: "14%",
            bottom: "16%",
            width: "20%",
            height: "12%",
            background: "radial-gradient(ellipse at center, rgba(240,180,92,.75), rgba(240,180,92,0) 70%)",
          }}
        />
      </span>

      {/* янтарное кольцо */}
      <span className="anim-spin-slow pointer-events-none absolute -inset-[9%] block">
        <svg viewBox="0 0 200 200" className="h-full w-full" style={{ transform: "rotate(-18deg)" }}>
          <defs>
            <linearGradient id="aura-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0b45c" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#f0b45c" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f0b45c" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke="url(#aura-ring)" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </span>

      {/* орбитальные искры */}
      <span className="anim-spin-rev pointer-events-none absolute inset-0 block" style={{ animationDuration: "14s" }}>
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber shadow-[0_0_12px_2px_rgba(240,180,92,.7)]" />
      </span>
      <span className="anim-spin-slow pointer-events-none absolute inset-0 block" style={{ animationDuration: "18s" }}>
        <span className="absolute top-1/2 -right-1 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#a9f0d9] shadow-[0_0_10px_2px_rgba(63,196,176,.6)]" />
      </span>
      <span className="anim-spin-slow pointer-events-none absolute -inset-[9%] block" style={{ animationDuration: "26s" }}>
        <span className="absolute bottom-2 left-[18%] h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_8px_2px_rgba(255,255,255,.45)]" />
      </span>
    </motion.button>
  );
}
