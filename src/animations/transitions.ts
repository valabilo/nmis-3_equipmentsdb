export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.055,
    },
  },
};

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};
