export const DURATION = {
  instant: 0.08,
  fast: 0.15,
  base: 0.22,
  slow: 0.3,
  stamp: 0.32,

  // Legacy aliases — used by existing components, kept for backward compat
  micro: 0.08,
  hoverIn: 0.15,
  hoverOut: 0.22,
  transition: 0.3,
  moderate: 0.3,
  page: 0.3,
  reveal: 0.3,
  revealStagger: 0.08,
  ceremonyBeat: 0.3,
  ceremony: 0.3,
  ceremonyFull: 0.3,
  reveal700: 0.3,
  skeletonCycle: 1.4,
  modalIn: 0.22,
  modalOut: 0.15,
} as const;

export const EASE = {
  out: "power2.out",
  inOut: "power2.inOut",
  in: "power2.in",
  stamp: "back.out(2.2)",

  // Legacy aliases — used by existing components, kept for backward compat
  standard: "power2.out",
  enter: "power3.out",
  emphasized: "power3.out",
  exit: "power2.in",
  ceremony: "power4.out",
  micro: "power1.inOut",
  spring: "elastic.out(1, 0.5)",
  count: "power2.out",
  linear: "none",
} as const;
