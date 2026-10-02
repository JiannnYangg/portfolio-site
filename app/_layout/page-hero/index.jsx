'use client';

import { motion } from 'framer-motion';
import { MoveDownRight } from 'lucide-react';

import { slideUp } from '../header/variants';

/**
 * Dark hero shared by inner pages (About, Research Papers).
 * @param {{ label: string, title: string }} props
 */
export function PageHero({ label, title }) {
  const words = title.split(' ');

  return (
    <motion.header
      className='relative flex min-h-[88vh] items-end overflow-hidden bg-foreground text-background'
      variants={slideUp}
      initial='initial'
      animate='enter'
    >
      {/* Soft, blurred echo of the home hero so pages feel related */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/images/hero-bg.webp'
        alt=''
        aria-hidden='true'
        className='absolute inset-0 h-full w-full scale-110 object-cover object-center blur-2xl'
      />
      <div className='absolute inset-0 bg-black/45' />

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
            <span
              key={`${word}-${index}`}
              className='me-[0.25em] inline-flex overflow-hidden pb-[0.08em]'
            >
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{
                  duration: 0.8,
                  ease: [0.33, 1, 0.68, 1],
                  delay: 2.9 + index * 0.1,
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>
      </div>
    </motion.header>
  );
}
