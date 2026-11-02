'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

import { scrollToId } from '@/hooks';

import { HeroLogos } from './hero-logos';
import { slideUp } from './variants';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const IOS_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const CALLOUT_ITEMS = ['Copy', 'Look Up', 'Translate'];

/**
 * Timeline (seconds). The header itself slides in at 2.5s (see variants.js),
 * so everything inside it is sequenced from there:
 * words rise in -> selection highlight -> handles -> callout -> light sweeps.
 */
const HERO_START = 2.5;
const WORD_DELAY = HERO_START + 0.15;
const WORD_STAGGER = 0.07; // seconds between consecutive words
const WORD_DURATION = 0.8;
const HIGHLIGHT_DELAY = 3.4;
const HANDLES_DELAY = 3.9;
const CALLOUT_DELAY = 4.2;
const MARKER_DELAY = 4.1; // marker bar behind "seen." sweeps in once the last word has settled
const SHINE_FIRST_DELAY = CALLOUT_DELAY + 1; // first pass 1s after the bubble appears
const SHINE_DURATION = 2.2; // slow sweep
const SHINE_REPEAT_DELAY = 1; // 1s pause between passes

/** Scroll fade: every word fades + lifts, one after another in reading order */
const SCROLL_FADE_START = 20; // px scrolled before the first word starts to fade
const SCROLL_FADE_STAGGER = 14; // extra px per word
const SCROLL_FADE_DISTANCE = 260; // px over which a word fades out completely (was 320: stronger, quicker fade)
const SCROLL_LIFT = -64; // px a word drifts up while fading (was -40)

/** iOS-style dark translucent material with a light frosted blur */
const MENU_BG = 'rgba(40, 40, 44, 0.82)';
const MENU_FILTER = 'blur(20px) saturate(180%)';

/**
 * "Calm zones": the background (paper folds, grid, blooms, lime glows) is
 * faded down to CALM_OPACITY behind the headline and behind the CTA, and
 * nowhere else. Two soft elliptical masks are intersected, so each one only
 * dims its own area.
 *
 * The zones follow the content: the headline + CTA are one block centered in
 * the hero, so the zone centers are offsets from the vertical middle
 * (--head-y / --cta-y, set per breakpoint on the wrapper below).
 *
 * CALM_OPACITY 0.55 = half the wash of the previous 0.1 (90% dimmed -> 45%).
 */
const CALM_OPACITY = 0.55;
const calmZone = (size, centerY) =>
  `radial-gradient(ellipse ${size} at 50% ${centerY}, rgba(0,0,0,${CALM_OPACITY}) 0%, rgba(0,0,0,${CALM_OPACITY}) 65%, #000 100%)`;
const CALM_MASK = [
  calmZone('40% 26%', 'calc(50% + var(--head-y))'), // headline block
  calmZone('200px 80px', 'calc(50% + var(--cta-y))'), // CTA pill
].join(', ');

/**
 * Graph-paper grid. It is drawn on TOP of the blooms and glows (so they can't
 * wash it out) in a deeper lime than the glows, so the lines stay readable on
 * both the off-white and the lime areas.
 * 0.2 -> 0.133 = one third less visible.
 */
const GRID_COLOR = '140,190,0';
const GRID_ALPHA = 0.133;

/** Clips only the bottom edge of a line, so text rises out of a mask
 *  while the callout above the word stays visible. */
const LINE_CLIP = 'inset(-300px -100px -0.12em -100px)';

/** Lets the last word of a line tell its line that the intro is finished */
const LineContext = createContext(() => {});

/**
 * A line is the mask the words rise out of. Once the last word has settled
 * the mask is dropped, so the callout's backdrop blur can see the page behind
 * it.
 */
function Line({ className = '', children }) {
  const reduceMotion = useReducedMotion();
  const [settled, setSettled] = useState(false);
  const settle = useCallback(() => setSettled(true), []);

  return (
    <LineContext.Provider value={settle}>
      <span
        className={`block ${className}`}
        style={settled || reduceMotion ? undefined : { clipPath: LINE_CLIP }}
      >
        {children}
      </span>
    </LineContext.Provider>
  );
}

/**
 * Same effect as the "Testing the boundaries..." paragraph (ParallaxReveal):
 * every word slides up out of a mask, staggered one after another.
 * After the intro it is scroll-linked: scrolling down fades and lifts the
 * words one by one (first word first), scrolling back up brings them back.
 */
function Word({ index, last = false, children }) {
  const reduceMotion = useReducedMotion();
  const settleLine = useContext(LineContext);

  const { scrollY } = useScroll();
  const start = SCROLL_FADE_START + index * SCROLL_FADE_STAGGER;
  const range = [start, start + SCROLL_FADE_DISTANCE];
  const scrollOpacity = useTransform(scrollY, range, [1, 0]);
  const scrollLift = useTransform(scrollY, range, [0, SCROLL_LIFT]);

  return (
    <motion.span
      className='inline-block'
      // scroll-linked fade + lift
      style={
        reduceMotion ? undefined : { opacity: scrollOpacity, y: scrollLift }
      }
    >
      {/* intro: rise out of the line mask while fading in */}
      <motion.span
        className='inline-block'
        initial={reduceMotion ? false : { y: '105%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{
          duration: WORD_DURATION,
          delay: WORD_DELAY + index * WORD_STAGGER,
          ease: EASE_OUT_EXPO,
        }}
        onAnimationComplete={last ? settleLine : undefined}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/** Key word inside the headline: ExtraBold Italic, same weight as the reference */
function Emphasis({ children }) {
  return <em className='font-extrabold italic'>{children}</em>;
}

/**
 * Asymmetric marker highlight behind a word. Nothing about it is symmetric:
 * - it starts right at the first letter but trails far past the last one
 * - the whole bar is tilted up to the right, like a quick marker swipe
 * - the shape is cut as an uneven quadrilateral (left edge short and
 *   slanted, right edge tall, indented bottom-right corner)
 * - it sits low, under the lower half of the letters
 * Theme lime at 50%, text stays dark and crisp on top. It sweeps in from the
 * left after the line settles.
 */
function Marker({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <span className='relative inline-block'>
      <motion.span
        aria-hidden='true'
        className='absolute -left-[0.04em] -right-[0.3em] bottom-[0.02em] h-[0.5em] origin-left bg-[#b6f500]/50'
        style={{
          rotate: -1.8,
          clipPath: 'polygon(0% 22%, 100% 0%, 94% 100%, 4% 82%)',
        }}
        initial={reduceMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          delay: MARKER_DELAY,
          duration: 0.7,
          ease: EASE_OUT_EXPO,
        }}
      />
      <em className='relative font-extrabold italic'>{children}</em>
    </span>
  );
}

/**
 * iOS edit menu (the bubble shown when text is selected on iPhone):
 * flat dark translucent material with a soft blur, small radius,
 * hairline dividers, a trailing chevron and a pointer arrow.
 * A slim, soft sheen sweeps slowly across it, like light catching glass.
 */
function IosCallout() {
  const reduceMotion = useReducedMotion();

  return (
    <span
      aria-hidden='true'
      className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-[16px] -translate-x-1/2'
    >
      <motion.span
        className='relative flex select-none items-stretch whitespace-nowrap rounded-[9px] text-[12px] font-medium not-italic leading-none tracking-normal text-white shadow-[0_4px_16px_rgba(0,0,0,0.25),0_0_0_0.5px_rgba(255,255,255,0.08)]'
        style={{
          fontFamily: IOS_FONT,
          background: MENU_BG,
          backdropFilter: MENU_FILTER,
          WebkitBackdropFilter: MENU_FILTER,
          transformOrigin: '50% 100%',
        }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          delay: CALLOUT_DELAY,
          duration: 0.22,
          ease: EASE_OUT_EXPO,
        }}
      >
        {CALLOUT_ITEMS.map((item, index) => (
          <span
            key={item}
            className={`flex items-center px-[10px] py-[9px] ${index > 0 ? 'border-l-[0.5px] border-white/20' : ''}`}
          >
            {item}
          </span>
        ))}
        <span className='flex items-center border-l-[0.5px] border-white/20 px-[6px]'>
          <ChevronRight size={12} strokeWidth={2.5} />
        </span>

        {/* light sweep: a slim diagonal sheen that slowly passes over the bubble */}
        {!reduceMotion && (
          <span className='pointer-events-none absolute inset-0 overflow-hidden rounded-[9px]'>
            <motion.span
              className='absolute inset-y-0 left-0 w-[24%]'
              style={{
                background:
                  'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)',
                transform: 'skewX(-18deg)',
              }}
              initial={{ x: '-160%' }}
              animate={{ x: '480%' }}
              transition={{
                delay: SHINE_FIRST_DELAY,
                duration: SHINE_DURATION,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: SHINE_REPEAT_DELAY,
              }}
            />
          </span>
        )}

        {/* pointer arrow */}
        <span
          className='absolute left-1/2 top-full h-[6px] w-[12px] -translate-x-1/2'
          style={{
            background: MENU_BG,
            backdropFilter: MENU_FILTER,
            WebkitBackdropFilter: MENU_FILTER,
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
        transition={{
          delay: HIGHLIGHT_DELAY,
          duration: 0.7,
          ease: EASE_OUT_EXPO,
        }}
      />

      {/* handles */}
      <motion.span
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: HANDLES_DELAY,
          duration: 0.4,
          ease: EASE_OUT_EXPO,
        }}
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
      {/* background: paper + soft blooms + lime corner glows + grid on top.
          The mask dims it behind the headline and the CTA only; the two
          zone centers (offsets from the vertical middle) differ per
          breakpoint because the headline scales with the viewport. */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 [--cta-y:77px] [--head-y:-59px] md:[--cta-y:140px] md:[--head-y:-74px]'
        style={{
          maskImage: CALM_MASK,
          WebkitMaskImage: CALM_MASK,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      >
        {/* crumpled paper: soft grey folds on an off-white sheet */}
        <div
          className='absolute inset-0'
          style={{
            opacity: 0.6,
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

        {/* soft blooms spread across the hero (pale lime, yellow-green,
            chartreuse, mint, aqua-green, soft yellow). Layer opacity 0.7. */}
        <div
          className='absolute inset-0'
          style={{
            opacity: 0.7,
            backgroundImage: [
              'radial-gradient(34% 30% at 14% 18%, rgba(214,248,140,0.55) 0%, rgba(214,248,140,0) 100%)',
              'radial-gradient(30% 28% at 52% 8%, rgba(232,250,160,0.50) 0%, rgba(232,250,160,0) 100%)',
              'radial-gradient(32% 30% at 84% 40%, rgba(176,238,200,0.50) 0%, rgba(176,238,200,0) 100%)',
              'radial-gradient(30% 28% at 40% 62%, rgba(200,245,110,0.45) 0%, rgba(200,245,110,0) 100%)',
              'radial-gradient(34% 30% at 70% 90%, rgba(170,236,214,0.50) 0%, rgba(170,236,214,0) 100%)',
              'radial-gradient(28% 26% at 6% 66%, rgba(247,250,170,0.50) 0%, rgba(247,250,170,0) 100%)',
            ].join(', '),
          }}
        />

        {/* lime corner glows */}
        <div
          className='absolute inset-0'
          style={{
            backgroundImage:
              'radial-gradient(55% 42% at 100% 0%, rgba(182,245,0,0.8) 0%, rgba(182,245,0,0) 70%), radial-gradient(50% 38% at 0% 100%, rgba(182,245,0,0.75) 0%, rgba(182,245,0,0) 70%)',
          }}
        />

        {/* graph-paper grid: 62px x 57px cells, 2px lines, on top of everything above */}
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `linear-gradient(to right, rgba(${GRID_COLOR},${GRID_ALPHA}) 2px, transparent 2px), linear-gradient(to bottom, rgba(${GRID_COLOR},${GRID_ALPHA}) 2px, transparent 2px)`,
            backgroundSize: '62px 57px',
          }}
        />
      </div>

      {/* floating 3D logos: asymmetric scatter around the headline, lit from
          the top-left, sequenced right after the headline words */}
      <HeroLogos />

      {/* headline + CTA as ONE block centered in the hero, so the gap between
          them is constant on every screen (it can't drift apart on tall
          viewports like it did with the CTA pinned to the bottom).
          The headline is a shrink-to-fit block so the staggered lines sit
          optically centered. Padding is slightly bottom-heavy, which keeps
          the whole block a touch above true center. */}
      <div className='relative flex min-h-[100svh] items-center'>
        <div className='mx-auto w-full max-w-5xl px-6 pb-28 pt-24 md:px-10 md:pb-36 md:pt-28'>
          <h1 className='mx-auto w-fit font-[family-name:var(--font-montserrat)] text-[clamp(2.5rem,6.4vw,5.5rem)] font-medium leading-[1.08] tracking-[-0.03em]'>
            <Line>
              <Word index={0}>We</Word>{' '}
              <Word index={1}>
                <Selection>design</Selection>
              </Word>{' '}
              <Word index={2} last>
                it.
              </Word>
            </Line>
            <Line className='md:pl-[1em]'>
              <Word index={3}>We</Word>{' '}
              <Word index={4}>
                <Emphasis>build</Emphasis>
              </Word>{' '}
              <Word index={5} last>
                it.
              </Word>
            </Line>
            <Line className='md:pl-[2em]'>
              <Word index={6}>We</Word> <Word index={7}>get</Word>{' '}
              <Word index={8}>it</Word>{' '}
              <Word index={9} last>
                <Marker>seen.</Marker>
              </Word>
            </Line>
          </h1>

          {/* CTA: exactly the reference design (no border, no shadow).
              Light grey outer pill 225 x 62, 6px ring, 6px gap, 50px inner
              buttons. Only the colours are themed: dark label with lime
              text, lime circle with a dark arrow; the two swap on hover.
              Sits a deliberate, modest gap under the headline. */}
          <div className='mt-10 flex justify-center md:mt-14'>
            <button
              type='button'
              onClick={() => scrollToId('contact-footer')}
              aria-label="Let's talk, go to contact"
              className='group flex items-center gap-[6px] rounded-full bg-[#d9d9d9] p-[6px] font-[family-name:var(--font-montserrat)] transition-transform duration-300 ease-in-expo hover:scale-[1.03]'
            >
              <span className='flex h-[50px] w-[156px] items-center justify-center whitespace-nowrap rounded-full bg-[#1f2024] text-[20px] font-normal leading-none tracking-[0.01em] text-[#b6f500] transition-colors duration-300 group-hover:bg-[#b6f500] group-hover:text-[#1f2024]'>
                Let&apos;s talk
              </span>
              <span className='flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#b6f500] transition-colors duration-300 group-hover:bg-[#1f2024]'>
                <ArrowUpRight
                  size={20}
                  strokeWidth={2.25}
                  className='text-[#1f2024] transition-all duration-300 ease-in-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#b6f500]'
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
