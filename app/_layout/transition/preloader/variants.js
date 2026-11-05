/** @type {import('framer-motion').Variants} */
export const slideUp = {
  initial: {
    top: 0,
  },
  exit: {
    top: '-100vh',
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
};

//? Quick fade: the first greeting only gets 0.5 s on screen, so it has to be
//? fully visible almost at once (it used to take 0.7 s, longer than its slot).
/** @type {import('framer-motion').Variants} */
export const fade = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
};
