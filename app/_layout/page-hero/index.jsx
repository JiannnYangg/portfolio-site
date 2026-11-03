'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MoveDownRight } from 'lucide-react';

import { useScrollFade } from '@/hooks';

import { slideUp } from '../header/variants';

/**
 * One title word: rises out of a mask on load (same as the home headline),
 * then fades and lifts with scroll, word by word. The scroll motion is on the
 * outer element so the mask travels with the word instead of clipping it.
 */
function HeroWord({ index, children }) {
  const reduceMotion = useReducedMotion();
  const { opacity, y } = useScrollFade(index);

  return (
    <motion.span
      className='me-[0.25em] inline-flex overflow-hidden pb-[0.08em]'
      style={reduceMotion ? undefined : { opacity, y }}
    >
      <motion.span
        initial={reduceMotion ? false : { y: '110%' }}
        animate={{ y: '0%' }}
        transition={{
          duration: 0.8,
          ease: [0.33, 1, 0.68, 1],
          delay: 2.9 + index * 0.1,
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/**
 * Hero shared by inner pages (About, Research Papers). It is transparent:
 * the paper / blooms / grid backdrop is the same site-wide layer the home
 * page uses, so every page reads as one surface.
 * @param {{ label: string, title: string }} props
 */
export function PageHero({ label, title }) {
  const words = title.split(' ');

  return (
    <motion.header
      className='relative flex min-h-[88vh] items-end overflow-hidden text-foreground'
      variants={slideUp}
      initial='initial'
      animate='enter'
    >
      <div className='container relative pb-[clamp(3em,9vh,7em)] pt-40'>
        <div className='mb-6 flex items-center gap-4 md:mb-10'>
          <MoveDownRight size={28} strokeWidth={1.25} />
          <span className='text-sm uppercase tracking-wide opacity-80'>
            {label}
          </span>
        </div>

        <h1
          className='leading-[1.02]'
          style={{ fontSize: 'clamp(3.25em, 10vw, 11em)' }}
        >
          {words.map((word, index) => (
            <HeroWord key={`${word}-${index}`} index={index}>
              {word}
            </HeroWord>
          ))}
        </h1>
      </div>
    </motion.header>
  );
}
