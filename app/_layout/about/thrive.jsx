'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { introDelay } from '@/data';
import { useScrollFade } from '@/hooks';

/**
 * The word "thrive." in the About hero ("We help brands thrive."), drawn so
 * the word does what it says.
 *
 * The idea: "brands" is the plain, flat starting point, in the page's ink. Then
 * "thrive" grows:
 *   1. its letters are not the same size. They climb from small to large, each
 *      one a little taller than the one before, like a seedling getting
 *      bigger. They pop up one after another with a springy overshoot (they
 *      grow in, they don't slide in).
 *   2. the colour warms with the growth, from a pale apricot on the "t" to the
 *      brand vermilion on the last "e" (the same orange as the page labels and
 *      the footer), as if the word is catching the sun.
 *   3. a growth line is drawn underneath, starting flat on the left, then
 *      curving upward as it goes (the "up and to the right" curve every brand
 *      wants), and it ends in a small two-leaf sprout, which pops open and
 *      then sways a little.
 *   4. the full stop is the seed: a vermilion dot that lands last.
 *
 * Layout: scaling does not change the space a letter takes, so the word keeps
 * exactly the width of the plain text and the headline never re-wraps. The
 * letters scale from their bottom edge, so they all stay on the baseline and
 * only grow upwards.
 *
 * It plugs into PageHero as one of its words (renderWord), so it shares the
 * rise-in timing and the scroll fade with the rest of the headline. With
 * reduced motion everything is simply there, already grown.
 *
 * Screen readers get the plain word (the drawn letters and the line are
 * hidden from them).
 */
const LETTERS = [...'thrive'];

/** Letter size: small to large, a straight staircase (1 = normal size) */
const GROWTH = [0.84, 0.89, 0.94, 1, 1.07, 1.14];

/** Pale apricot to vermilion, one colour per letter */
const INK = ['#f6ad63', '#f4985a', '#f28552', '#ee7048', '#e95c3c', '#e24a28'];
const SEED = '#e24a28';
const LEAF_LIGHT = '#f28552';

/** Seconds between two letters popping up */
const STEP = 0.08;

/** The growth line: flat at first, then curling up into the sprout */
const LINE = 'M2 32 C 80 34 170 30 230 22 C 262 17 284 14 296 6';
const LEAF_LEFT = 'M296 6 C 288 -6 274 -8 266 -4 C 270 6 284 12 296 6 Z';
const LEAF_RIGHT = 'M296 6 C 298 -8 310 -16 324 -14 C 324 -2 312 8 296 6 Z';

export function Thrive({ index }) {
  const reduceMotion = useReducedMotion();
  const { opacity, y } = useScrollFade(index);

  // starts right after the words before it have risen (same clock as HeroWord)
  const start = introDelay(2.4) + index * 0.1 + 0.1;
  const lettersDone = start + LETTERS.length * STEP;
  const lineAt = lettersDone + 0.1;
  const sproutAt = lineAt + 0.9;

  return (
    <motion.span
      className='relative me-[0.25em] inline-block'
      style={reduceMotion ? undefined : { opacity, y }}
    >
      <span className='sr-only'>thrive.</span>

      <span
        aria-hidden='true'
        className='relative inline-flex items-end whitespace-nowrap'
      >
        {LETTERS.map((letter, i) => (
          <motion.span
            // eslint-disable-next-line react/no-array-index-key
            key={`${letter}-${i}`}
            className='inline-block origin-bottom'
            style={{ color: INK[i], scale: GROWTH[i] }}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: '0.45em', scale: GROWTH[i] * 0.6 }
            }
            animate={{ opacity: 1, y: 0, scale: GROWTH[i] }}
            transition={{
              type: 'spring',
              stiffness: 160,
              damping: 13,
              delay: start + i * STEP,
              opacity: { duration: 0.3, delay: start + i * STEP },
            }}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: '-0.05em',
                    transition: { type: 'spring', stiffness: 300, damping: 12 },
                  }
            }
          >
            {letter}
          </motion.span>
        ))}

        {/* the seed: the full stop lands last */}
        <motion.span
          className='inline-block origin-bottom-left'
          style={{ color: SEED }}
          initial={reduceMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 11,
            delay: lettersDone,
          }}
        >
          .
        </motion.span>
      </span>

      {/* the growth line and the sprout */}
      <svg
        aria-hidden='true'
        viewBox='0 -20 330 56'
        fill='none'
        className='pointer-events-none absolute left-[-1%] top-[calc(100%-0.16em)] w-[106%] overflow-visible'
      >
        <defs>
          <linearGradient id='thrive-growth' x1='0' y1='0' x2='1' y2='0'>
            <stop offset='0%' stopColor='#f6ad63' />
            <stop offset='100%' stopColor='#e24a28' />
          </linearGradient>
        </defs>

        <motion.path
          d={LINE}
          stroke='url(#thrive-growth)'
          strokeWidth='5'
          strokeLinecap='round'
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1.1,
            ease: [0.33, 1, 0.68, 1],
            delay: lineAt,
          }}
        />

        {/* two leaves: they open from the end of the line, then sway */}
        <motion.g
          style={{ originX: 0.52, originY: 0.79 }}
          initial={reduceMotion ? false : { scale: 0, rotate: 0 }}
          animate={
            reduceMotion ? undefined : { scale: 1, rotate: [0, 5, -3, 0] }
          }
          transition={{
            scale: {
              type: 'spring',
              stiffness: 200,
              damping: 11,
              delay: sproutAt,
            },
            rotate: {
              duration: 5,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: sproutAt + 1.2,
            },
          }}
        >
          <path d={LEAF_LEFT} fill={LEAF_LIGHT} />
          <path d={LEAF_RIGHT} fill={SEED} />
        </motion.g>
      </svg>
    </motion.span>
  );
}
