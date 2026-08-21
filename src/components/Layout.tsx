import { Coins } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ThemeToggle } from "../features/theme/ThemeToggle";
import { useWalletStore } from "../features/wallet/walletStore";
import { fmtNum, plural } from "../lib/utils";

function Background() {
  return (
    <>
      <div className="aura-env" aria-hidden>
        <span
          className="halo"
          style={{ top: "-14%", left: "-10%", width: "46vw", height: "46vw", background: "color-mix(in srgb, var(--teal) 34%, transparent)" }}
        />
        <span
          className="halo"
          style={{ bottom: "-18%", right: "-12%", width: "42vw", height: "42vw", background: "color-mix(in srgb, var(--amber) 26%, transparent)" }}
        />
        <span
          className="halo anim-float"
          style={{ top: "34%", right: "16%", width: "22vw", height: "22vw", background: "color-mix(in srgb, var(--pine) 22%, transparent)" }}
        />
      </div>
      <div className="noise-overlay" aria-hidden />
    </>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const points = useWalletStore((s) => s.points);
  return (
    <div className="relative flex min-h-dvh flex-col">
      <Background />
      <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="Aura — на главную">
            <img src="icon.svg" alt="" className="h-8 w-8 rounded-[10px] shadow-md transition-transform duration-300 group-hover:scale-105" />
            <span className="font-display text-[19px] font-bold tracking-tight">Aura</span>
            <span className="label-caps mt-1 hidden !text-[10px] sm:block">умный поиск</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <nav className="hidden items-center gap-1 rounded-full border border-line bg-card/70 p-1 md:flex" aria-label="Основная навигация">
              {[
                { to: "/", label: "Поиск" },
                { to: "/wallet", label: "Баллы" },
              ].map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                      isActive ? "bg-pine/12 text-pine" : "text-soft hover:text-ink"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <ThemeToggle />
            <Link
              to="/wallet"
              className="chip !py-2"
              title="Баллы Aura"
              aria-label={`Баллы Aura: ${fmtNum(points)}`}
            >
              <Coins size={15} className="text-amber" />
              <span className="font-bold">{fmtNum(points)}</span>
              <span className="hidden text-soft md:inline">{plural(points, "балл", "балла", "баллов")}</span>
            </Link>
          </div>
        </div>
      </header>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
