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
 * Deep midnight indigo: the dark partner of the site's blue-violet theme.
 * Keep the container background and the curve fill on the SAME value, the
 * curved bottom edge is drawn in the fill colour.
 */
const BG = 'bg-[#0b0f2e]';
const CURVE_FILL = 'fill-[#0b0f2e]';

/**
 * Greeting colour: ONE flat, light lilac (the same as the text selection in
 * the hero), no gradient. It reads softly on the deep indigo.
 */
const TEXT_COLOR = 'text-[#e4defc]';

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
          <MotionComponent
            className={`relative text-lg font-medium md:text-2xl ${TEXT_COLOR}`}
            variants={fade}
            initial='initial'
            animate='enter'
          >
            <Dot size={28} className='me-1' strokeWidth={3.5} />
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
