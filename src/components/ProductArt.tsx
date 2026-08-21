import type { ArtKind } from "../types";
import { hashStr } from "../lib/utils";

/** Абстрактные фирменные иллюстрации товаров — без чужих логотипов и фото */
function Glyph({ art }: { art: ArtKind }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (art) {
    case "phone":
      return (
        <g {...common}>
          <rect x="42" y="16" width="36" height="88" rx="11" />
          <line x1="54" y1="92" x2="66" y2="92" />
          <circle cx="60" cy="27" r="2.4" fill="currentColor" stroke="none" />
          <rect x="48" y="36" width="24" height="40" rx="4" opacity="0.35" />
        </g>
      );
    case "earbuds":
      return (
        <g {...common}>
          <rect x="34" y="56" width="52" height="36" rx="17" />
          <circle cx="47" cy="34" r="10" />
          <circle cx="73" cy="34" r="10" />
          <path d="M47 44v12M73 44v12" />
          <circle cx="60" cy="74" r="3" fill="currentColor" stroke="none" opacity="0.5" />
        </g>
      );
    case "headphones":
      return (
        <g {...common}>
          <path d="M26 82V62a34 34 0 0 1 68 0v20" />
          <rect x="18" y="74" width="17" height="27" rx="8.5" />
          <rect x="85" y="74" width="17" height="27" rx="8.5" />
        </g>
      );
    case "laptop":
      return (
        <g {...common}>
          <rect x="29" y="26" width="62" height="42" rx="7" />
          <path d="M20 76h80l-9 13H29z" />
          <line x1="52" y1="82" x2="68" y2="82" opacity="0.5" />
        </g>
      );
    case "watch":
      return (
        <g {...common}>
          <circle cx="60" cy="58" r="23" />
          <path d="M49 37V22h22v15M49 79v15h22V79" />
          <path d="M60 46v12l8 6" />
        </g>
      );
    case "speaker":
      return (
        <g {...common}>
          <rect x="40" y="22" width="40" height="76" rx="20" />
          <circle cx="60" cy="44" r="8" />
          <circle cx="60" cy="70" r="13" />
        </g>
      );
    case "vacuum":
      return (
        <g {...common}>
          <circle cx="60" cy="60" r="35" />
          <circle cx="60" cy="52" r="11" />
          <path d="M34 78a35 35 0 0 0 52 0" opacity="0.5" />
          <circle cx="60" cy="52" r="3.5" fill="currentColor" stroke="none" opacity="0.6" />
        </g>
      );
    case "gift":
      return (
        <g {...common}>
          <rect x="29" y="48" width="62" height="44" rx="7" />
          <rect x="24" y="35" width="72" height="15" rx="5" />
          <line x1="60" y1="35" x2="60" y2="92" />
          <path d="M60 35c-8-16-26-12-22 0 3 9 16 4 22 0zm0 0c8-16 26-12 22 0-3 9-16 4-22 0z" />
        </g>
      );
    case "console":
      return (
        <g {...common}>
          <path d="M40 38h40a22 22 0 0 1 21 29l-4 13a9 9 0 0 1-16 2l-8-11H47l-8 11a9 9 0 0 1-16-2l-4-13A22 22 0 0 1 40 38z" />
          <path d="M36 56h12M42 50v12" />
          <circle cx="76" cy="52" r="2.6" fill="currentColor" stroke="none" />
          <circle cx="84" cy="60" r="2.6" fill="currentColor" stroke="none" />
        </g>
      );
    case "camera":
      return (
        <g {...common}>
          <rect x="24" y="40" width="72" height="48" rx="11" />
          <circle cx="60" cy="64" r="15" />
          <circle cx="60" cy="64" r="6" opacity="0.5" />
          <path d="M46 40l6-11h16l6 11" />
          <circle cx="86" cy="50" r="2.5" fill="currentColor" stroke="none" opacity="0.6" />
        </g>
      );
    case "home":
      return (
        <g {...common}>
          <path d="M28 58 60 30l32 28v34H28z" />
          <rect x="50" y="68" width="20" height="24" rx="3" />
          <circle cx="60" cy="52" r="7" opacity="0.55" />
        </g>
      );
    case "appliance":
      return (
        <g {...common}>
          <rect x="32" y="24" width="56" height="64" rx="11" />
          <circle cx="60" cy="44" r="9" />
          <rect x="46" y="62" width="28" height="14" rx="5" />
          <path d="M60 88v6" />
        </g>
      );
    case "tool":
      return (
        <g {...common}>
          <path d="M26 44h52v24H56l-7 16H36l6-16H26z" />
          <path d="M78 50h18v12H78" />
          <circle cx="44" cy="56" r="4" opacity="0.55" />
        </g>
      );
    default:
      return (
        <g {...common}>
          <rect x="36" y="36" width="48" height="48" rx="15" />
          <circle cx="60" cy="60" r="12" />
          <circle cx="60" cy="60" r="3.5" fill="currentColor" stroke="none" opacity="0.6" />
        </g>
      );
  }
}

const TONES = ["var(--teal)", "var(--amber)", "var(--pine)", "var(--teal)"];

export function ProductArt({
  art,
  seedText,
  className = "",
}: {
  art: ArtKind;
  seedText: string;
  className?: string;
}) {
  const tone = TONES[hashStr(seedText) % TONES.length];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(145deg, color-mix(in srgb, ${tone} 26%, var(--card)) 0%, color-mix(in srgb, ${tone} 8%, var(--card)) 60%, color-mix(in srgb, ${tone} 16%, var(--bg2)) 100%)`,
      }}
    >
      <span
        className="absolute -right-8 -top-10 h-36 w-36 rounded-full opacity-50 blur-2xl"
        style={{ background: `color-mix(in srgb, ${tone} 34%, transparent)` }}
      />
      <svg viewBox="0 0 120 120" className="relative h-[62%] w-[62%] text-ink/75 drop-shadow-sm">
        <Glyph art={art} />
      </svg>
      <span
        className="absolute bottom-[10%] h-[6%] w-[46%] rounded-[100%] opacity-25 blur-md"
        style={{ background: "var(--ink)" }}
      />
    </div>
  );
}
