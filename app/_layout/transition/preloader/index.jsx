'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Dot } from 'lucide-react';

import { Center } from '@/components';
import { preloaderGreetings } from '@/data';
import { useDimensions, useTimeOut } from '@/hooks';

import { fade, slideUp } from './variants';

const MotionComponent = motion(Center);

/**
 * Deep forest green: the dark partner of the site's lime theme.
 * Keep the container background and the curve fill on the SAME value, the
 * curved bottom edge is drawn in the fill colour.
 */
const BG = 'bg-[#0b1f14]';
const CURVE_FILL = 'fill-[#0b1f14]';

/**
 * Greeting text colour: only the site's main theme colour (lime), taken from
 * the backdrop palette: lime -> chartreuse -> pale lime.
 */
const TEXT_GRADIENT =
  'linear-gradient(100deg, #b6f500 0%, #c8f56e 50%, #d6f88c 100%)';

/**
 * Timing (ms). The whole intro is FIRST + (greetings - 1) * EACH, and the
 * Transition timer must match it so the last greeting gets its full time and
 * the screen slides away straight after it, with no extra pause.
 */
const FIRST_MS = 600;
const EACH_MS = 300;

export function Preloader() {
  const [index, setIndex] = useState(0);
  const { width, height } = useDimensions();

  const lastIndex = preloaderGreetings.length - 1;
  const greeting = preloaderGreetings[Math.min(index, lastIndex)];

  useTimeOut({
    callback: () => {
      setIndex(prevIndex => Math.min(prevIndex + 1, lastIndex));
    },
    duration: index === 0 ? FIRST_MS : EACH_MS,
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
      className={`fixed z-50 h-screen w-screen cursor-wait ${BG}`}
      variants={slideUp}
      initial='initial'
      exit='exit'
    >
      {width > 0 ? (
        <>
          <MotionComponent
            className='relative text-2xl font-medium md:text-4xl'
            variants={fade}
            initial='initial'
            animate='enter'
          >
            <Dot size={40} className='me-1 text-[#b6f500]' strokeWidth={4} />
            <p
              lang={greeting.lang}
              className='inline-block bg-clip-text py-1 leading-[1.6] text-transparent'
              style={{
                backgroundImage: TEXT_GRADIENT,
                WebkitBackgroundClip: 'text',
              }}
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
