// Shared animation tokens — keep every motion effect on the site consistent.
// GPU-friendly only: transform (x/y/scale) + opacity, never layout-affecting props.

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const TRANSITION_FAST = { duration: 0.2, ease: EASE_OUT };
export const TRANSITION_BASE = { duration: 0.3, ease: EASE_OUT };

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransition = { duration: 0.25, ease: EASE_OUT };

// Small per-item entrance used by feed/card lists — cap the delay so long
// lists don't take forever to finish appearing.
export function staggerDelay(index: number, step = 0.05, max = 0.3) {
  return Math.min(index * step, max);
}

export const cardHover = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.98 },
  transition: TRANSITION_FAST,
};
