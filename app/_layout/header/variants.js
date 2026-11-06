import { introDelay } from '@/data';

//? The hero starts HERO_GAP seconds after the preloader's last greeting
//? begins to leave. The preloader is 2.0 s (5 greetings * 0.4 s), so the
//? header lands at 2.4 s on the first visit. When the intro is skipped the
//? whole hero timeline moves earlier by the same amount (see introDelay in
//? app/_data/intro.js). `enter` is a function so the delay is read when the
//? animation starts, after the Transition wrapper has decided.
//? Keep this in step with HERO_START in index.jsx.
/** @type {import('framer-motion').Variants} */
export const slideUp = {
  initial: {
    y: 300,
  },
  enter: () => ({
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.33, 1, 0.68, 1],
      delay: introDelay(2.4),
    },
  }),
};
