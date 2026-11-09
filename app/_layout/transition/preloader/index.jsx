'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Dot } from 'lucide-react';

import { Center } from '@/components';
import { PRELOADER_GREETING_MS, preloaderGreetings } from '@/data';
import { useDimensions, useTimeOut } from '@/hooks';

import { fade, slideUp } from './variants';

const MotionComponent = motion(Center);

/**
 * Deep burnt orange (#9a3412). The flat bright orange (#ec6426) was too loud
 * for a full screen: it fought the greeting and felt like a warning banner.
 * A deeper, richer burnt orange keeps the brand hue but is calm enough to
 * read as a premium opening, and it makes the light text pop.
 *
 * Keep the container background and the curve fill on the SAME value, the
 * curved bottom edge is drawn in the fill colour. The browser theme colour
 * (app/layout.jsx) uses the same value.
 */
const BG = 'bg-[#9a3412]';
const CURVE_FILL = 'fill-[#9a3412]';

/**
 * Greeting colour: a light peach-orange (#ffd9b3), the pale end of the brand
 * orange, about 5.7:1 on the burnt orange background. One flat colour, no
 * gradient.
 */
const TEXT_COLOR = 'text-[#ffd9b3]';

/**
 * The dot before each greeting: a brighter, more saturated orange (#ff9a52)
 * than the text, as a small accent so the greeting reads in two tones.
 * Decorative only (aria-hidden by the icon), so contrast does not apply.
 */
const DOT_COLOR = 'text-[#ff9a52]';

/**
 * Timing: every greeting gets PRELOADER_GREETING_MS (0.4 s), including the
 * first one. The total (greetings * 0.4 s) is PRELOADER_DURATION_MS, which the
 * Transition timer reads too, so the last greeting always gets its full time
 * and the screen slides away straight after it.
 */
export function Preloader() {
  const [index, setIndex] = useState(0);
  const { width, height } = useDimensions();

  const lastIndex = preloaderGreetings.length - 1;
  const greeting = preloaderGreetings[Math.min(index, lastIndex)];

  useTimeOut({
    callback: () => {
      setIndex(prevIndex => Math.min(prevIndex + 1, lastIndex));
    },
    duration: PRELOADER_GREETING_MS,
    deps: [index],
  });

  const initialPath = `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${
    height + 300
  } 0 ${height}  L0 0`;
  const targetPath = `M0 0 L${width} 0 L${width} ${height} Q${
    width / 2
  } ${height} 0 ${height}  L0 0`;

  /** @type {import('framer-motion').Variants} */
  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
    },
  };

  return (
    <MotionComponent
      data-preloader=''
      className={`fixed z-50 h-screen w-screen cursor-wait ${BG}`}
      variants={slideUp}
      initial='initial'
      exit='exit'
    >
      {width > 0 ? (
        <>
          {/* A little larger than before (2xl -> 4xl on desktop) with a touch
              of letter-spacing: the greeting is the only thing on the screen,
              so it can carry more presence. */}
          <MotionComponent
            className={`relative text-xl font-medium tracking-wide md:text-4xl ${TEXT_COLOR}`}
            variants={fade}
            initial='initial'
            animate='enter'
          >
            <Dot
              size={32}
              className={`me-1 ${DOT_COLOR}`}
              strokeWidth={3.5}
              aria-hidden='true'
            />
            <p
              lang={greeting.lang}
              className='inline-block py-1 leading-[1.6]'
            >
              {greeting.text}
            </p>
          </MotionComponent>
          <motion.svg className='absolute top-0 -z-10 h-[calc(100%+300px)] w-full'>
            <motion.path
              className={CURVE_FILL}
              variants={curve}
              initial='initial'
              exit='exit'
            />
          </motion.svg>
        </>
      ) : null}
    </MotionComponent>
  );
}
