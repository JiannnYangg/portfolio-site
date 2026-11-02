'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, MoveDownRight } from 'lucide-react';

import { scrollToId } from '@/hooks';

import { slideUp } from './variants';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const IOS_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const CALLOUT_ITEMS = ['Copy', 'Look Up', 'Translate'];
const MENU_BG = 'rgba(44, 44, 46, 0.94)';

/** Key word inside the headline: ExtraBold Italic, same weight as the reference */
function Emphasis({ children }) {
  return <em className='font-extrabold italic'>{children}</em>;
}

/**
 * iOS edit menu (the black bubble shown when text is selected on iPhone):
 * dark translucent material, small radius, hairline dividers,
 * a trailing chevron for the overflow page and a pointer arrow.
 */
function IosCallout() {
  const reduceMotion = useReducedMotion();

  return (
    <span
      aria-hidden='true'
      className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-[16px] -translate-x-1/2'
    >
      <motion.span
        className='relative flex select-none items-stretch whitespace-nowrap rounded-[9px] text-[12px] font-medium not-italic leading-none tracking-normal text-white shadow-[0_6px_18px_rgba(0,0,0,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)] backdrop-blur-xl backdrop-saturate-150'
        style={{
          fontFamily: IOS_FONT,
          background: MENU_BG,
          transformOrigin: '50% 100%',
        }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.22, ease: EASE_OUT_EXPO }}
      >
        {CALLOUT_ITEMS.map((item, index) => (
          <span
            key={item}
            className={`flex items-center px-[10px] py-[9px] ${index > 0 ? 'border-l-[0.5px] border-white/25' : ''}`}
          >
            {item}
          </span>
        ))}
        <span className='flex items-center border-l-[0.5px] border-white/25 px-[6px]'>
          <ChevronRight size={12} strokeWidth={2.5} />
        </span>

        {/* pointer arrow */}
        <span
          className='absolute left-1/2 top-full h-[6px] w-[12px] -translate-x-1/2'
          style={{
            background: MENU_BG,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          }}
        />
      </motion.span>
    </span>
  );
}

/**
 * The "text selection" effect from the reference:
 * lime highlight box, dark-green ExtraBold Italic text,
 * the two selection handles (top-left ▼ / bottom-right ▲)
 * and the iPhone-style callout menu above it.
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

      <IosCallout />

      <em className='relative font-extrabold italic text-[#3d5a0e]'>
        {children}
      </em>
    </span>
  );
}

export function Header() {
  return (
    <motion.header
      className='relative min-h-[100svh] overflow-hidden bg-[#f3f3f5] text-black selection:bg-[#d8f6a2] selection:text-[#3d5a0e]'
      variants={slideUp}
      initial='initial'
      animate='enter'
    >
      {/* crumpled paper: soft grey folds on an off-white sheet */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage: [
            'linear-gradient(118deg, rgba(0,0,0,0) 14%, rgba(70,70,80,0.07) 24%, rgba(255,255,255,0) 36%)',
            'linear-gradient(62deg, rgba(0,0,0,0) 38%, rgba(70,70,80,0.06) 48%, rgba(255,255,255,0) 60%)',
            'linear-gradient(155deg, rgba(255,255,255,0) 52%, rgba(70,70,80,0.05) 64%, rgba(255,255,255,0) 78%)',
            'radial-gradient(38% 26% at 30% 22%, rgba(80,80,90,0.09) 0%, rgba(80,80,90,0) 100%)',
            'radial-gradient(34% 24% at 78% 58%, rgba(80,80,90,0.07) 0%, rgba(80,80,90,0) 100%)',
            'radial-gradient(40% 22% at 22% 84%, rgba(80,80,90,0.08) 0%, rgba(80,80,90,0) 100%)',
            'radial-gradient(60% 40% at 85% 12%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
          ].join(', '),
        }}
      />

      {/* graph-paper grid */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(40,44,56,0.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(40,44,56,0.55) 1px, transparent 1px)',
          backgroundSize: '33px 33px',
        }}
      />

      {/* lime corner glows: sit on top of the paper + grid */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage:
            'radial-gradient(55% 42% at 100% 0%, rgba(182,245,0,0.8) 0%, rgba(182,245,0,0) 70%), radial-gradient(50% 38% at 0% 100%, rgba(182,245,0,0.75) 0%, rgba(182,245,0,0) 70%)',
        }}
      />

      {/* headline: compact, centered column, staggered lines on desktop */}
      <div className='relative flex min-h-[100svh] items-center'>
        <div className='mx-auto w-full max-w-4xl px-6 pb-32 pt-32 md:px-10'>
          <h1 className='font-[family-name:var(--font-montserrat)] text-[clamp(2rem,5.2vw,4.25rem)] font-medium leading-[1.12] tracking-[-0.03em]'>
            <span className='block'>
              We <Selection>design</Selection> it.
            </span>
            <span className='block md:pl-[1em]'>
              We <Emphasis>build</Emphasis> it.
            </span>
            <span className='block md:pl-[2em]'>
              We get it <Emphasis>seen.</Emphasis>
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
