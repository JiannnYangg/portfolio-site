//? The hero starts HERO_GAP seconds after the preloader's last greeting
//? begins to leave. The preloader is now 2.5 s (5 greetings * 0.5 s), so the
//? header lands at 2.9 s (it used to be 2.5 s behind a 2.1 s preloader).
//? Keep this in step with HERO_START in index.jsx.
/** @type {import('framer-motion').Variants} */
export const slideUp = {
  initial: {
    y: 300,
  },
  enter: {
    y: 0,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1], delay: 2.9 },
  },
};
