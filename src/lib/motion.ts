import type { Transition, Variants } from "framer-motion";

/** Фирменная пружина Aura: stiffness ~100, damping ~15 */
export const spring: Transition = { type: "spring", stiffness: 100, damping: 15 };
export const springSoft: Transition = { type: "spring", stiffness: 120, damping: 18 };
export const springTight: Transition = { type: "spring", stiffness: 160, damping: 20 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: spring },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

export const staggerSlow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.08 } },
};

/** Line-mask reveal: строка выезжает из-под маски */
export const maskReveal: Variants = {
  hidden: { y: "112%" },
  show: { y: "0%", transition: { type: "spring", stiffness: 90, damping: 17 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring },
};
