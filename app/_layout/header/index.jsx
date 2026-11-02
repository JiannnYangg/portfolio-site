'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MoveDownRight } from 'lucide-react';

import { scrollToId } from '@/hooks';

import { slideUp } from './variants';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/** Key word inside the headline: ExtraBold Italic, same weight as the reference */
function Emphasis({ children }) {
  return <em className='font-extrabold italic'>{children}</em>;
}

/**
 * The "text selection" effect from the reference:
 * lime highlight box, dark-green ExtraBold Italic text,
 * and the two selection handles (top-left ▼ / bottom-right ▲).
 */
function Selection({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <span className='relative inline-block px-[0.14em]'>
      {/* highlight box */}
      <motion.span
        aria-hidden='true'
        className='absolute inset-x-0 inset-y-[0.06em] origin-left rounded-[3px] border border-[#b6f500]/60 bg-[#d8f6a2]'
        initial={reduceMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 0.7, ease: EASE_OUT_EXPO }}
      />

      {/* handles */}
      <motion.span
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.55, duration: 0.4, ease: EASE_OUT_EXPO }}
      >
        <span className='absolute inset-y-[0.06em] left-0 w-[0.035em] bg-[#b6f500]' />
        <span className='absolute -left-[0.135em] -top-[0.1em] h-[0.26em] w-[0.3em] bg-[#b6f500] [clip-path:polygon(0_0,100%_0,50%_100%)]' />
        <span className='absolute inset-y-[0.06em] right-0 w-[0.035em] bg-[#b6f500]' />
        <span className='absolute -bottom-[0.1em] -right-[0.135em] h-[0.26em] w-[0.3em] bg-[#b6f500] [clip-path:polygon(50%_0,100%_100%,0_100%)]' />
      </motion.span>

      <em className='relative font-extrabold italic text-[#3d5a0e]'>
        {children}
      </em>
    </span>
  );
}

export function Header() {
  return (
    <motion.header
      className='relative min-h-[100svh] overflow-hidden bg-white text-black selection:bg-[#d8f6a2] selection:text-[#3d5a0e]'
      variants={slideUp}
      initial='initial'
      animate='enter'
    >
      {/* lime corner glows */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage:
            'radial-gradient(55% 42% at 100% 0%, rgba(182,245,0,0.8) 0%, rgba(182,245,0,0) 70%), radial-gradient(50% 38% at 0% 100%, rgba(182,245,0,0.75) 0%, rgba(182,245,0,0) 70%)',
        }}
      />

      {/* subtle grid */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-70'
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* headline */}
      <div className='relative flex min-h-[100svh] items-center'>
        <div className='mx-auto w-full max-w-7xl px-6 pb-32 pt-28 md:px-12'>
          <h1 className='font-[family-name:var(--font-montserrat)] text-[clamp(2.6rem,8.4vw,7.75rem)] font-medium leading-[1.1] tracking-[-0.03em]'>
            <span className='block'>
              We <Emphasis>design</Emphasis> it.
            </span>
            <span className='block'>
              We <Emphasis>build</Emphasis> it.
            </span>
            <span className='block'>
              We get it <Selection>seen.</Selection>
            </span>
          </h1>
        </div>
      </div>

      {/* bottom pill */}
      <div className='absolute inset-x-0 bottom-6 flex justify-center px-4 md:bottom-10'>
        <div className='flex w-full max-w-[34rem] items-center justify-between gap-2 rounded-full border-2 border-black bg-white p-1.5 font-[family-name:var(--font-montserrat)]'>
          <span className='rounded-full bg-black px-5 py-3 text-sm font-medium text-white'>
            Hey, I&apos;m Satyam
          </span>

          <button
            type='button'
            onClick={() => scrollToId('contact-footer')}
            className='group inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-transform duration-300 ease-in-expo hover:scale-[1.03]'
          >
            Let&apos;s talk
            <MoveDownRight
              size={18}
              strokeWidth={2}
              className='text-[#b6f500] transition-transform duration-300 ease-in-expo group-hover:translate-x-0.5 group-hover:translate-y-0.5'
            />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
