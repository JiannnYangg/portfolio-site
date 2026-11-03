'use client';

import { createContext, useCallback, useContext, useState } from 'react';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

import { PAPER_RGB } from '@/components';
import { scrollToId, useScrollFade } from '@/hooks';

import { HeroLogos } from './hero-logos';
import { slideUp } from './variants';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const IOS_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const CALLOUT_ITEMS = ['Copy', 'Look Up', 'Translate'];

/**
 * Timeline (seconds). The header itself slides in at 2.5s (see variants.js),
 * so everything inside it is sequenced from there:
 * words rise in -> CTA rises in -> selection highlight -> handles -> callout
 * -> light sweeps.
 */
const HERO_START = 2.5;
const WORD_DELAY = HERO_START + 0.15;
const WORD_STAGGER = 0.07; // seconds between consecutive words
const WORD_DURATION = 0.8;
const HIGHLIGHT_DELAY = 3.4;
const HANDLES_DELAY = 3.9;
const CALLOUT_DELAY = 4.2;
const MARKER_DELAY = 4.1; // marker bar behind "seen." sweeps in once the last word has settled
const SHINE_FIRST_DELAY = CALLOUT_DELAY + 0.5; // first pass 0.5s after the bubble appears
const SHINE_DURATION = 2.2; // slow sweep
const SHINE_REPEAT_DELAY = 0.5; // 0.5s pause between passes

/**
 * The CTA is the "11th word" of the hero: it rises right after the headline
 * and joins the same scroll fade, one step after the last word (index 9).
 */
const CTA_INDEX = 10;
const CTA_DELAY = WORD_DELAY + CTA_INDEX * WORD_STAGGER;
/** Clips only the bottom edge, so the pill rises out of a mask */
const CTA_CLIP = 'inset(-48px -48px 0px -48px)';

/** iOS-style dark translucent material with a light frosted blur */
const MENU_BG = 'rgba(40, 40, 44, 0.82)';
const MENU_FILTER = 'blur(20px) saturate(180%)';

/**
 * "Calm zones": the site backdrop (paper folds, grid, blooms, lime glows) is
 * washed back toward the paper colour behind the headline and behind the
 * CTA, and nowhere else. The backdrop itself is now one fixed layer shared by
 * every page, so the calm zones are a soft paper-coloured wash that belongs
 * to the hero and scrolls away with it (a mask on the shared layer would
 * stay stuck mid-screen on every other section).
 *
 * Same look as the previous mask: CALM_OPACITY 0.55 left the background at
 * 55%, i.e. a 45% wash of paper on top, flat to 65% of the ellipse and
 * fading to nothing at its edge.
 *
 * The CTA zone is the exception: the pill is now a near-white, so a paper
 * (near-white) wash behind it made it vanish. Its wash uses a slightly darker
 * cool grey, and a bit stronger, so the pill reads clearly while the area
 * still looks calm.
 *
 * The zones follow the content: the headline + CTA are one block centered in
 * the hero, so the zone centers are offsets from the vertical middle
 * (--head-y / --cta-y, set per breakpoint on the wrapper below).
 */
const CALM_OPACITY = 0.55;
const CALM_WASH = 1 - CALM_OPACITY;
const CTA_WASH_RGB = '222,224,229';
const CTA_WASH = 0.75;
const calmZone = (size, centerY, rgb = PAPER_RGB, wash = CALM_WASH) =>
  `radial-gradient(ellipse ${size} at 50% ${centerY}, rgba(${rgb},${wash}) 0%, rgba(${rgb},${wash}) 65%, rgba(${rgb},0) 100%)`;
const CALM_BACKGROUND = [
  calmZone('40% 26%', 'calc(50% + var(--head-y))'), // headline block
  calmZone(
    '200px 80px',
    'calc(50% + var(--cta-y))',
    CTA_WASH_RGB,
    CTA_WASH
  ), // CTA pill
].join(', ');

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
  const { opacity, y } = useScrollFade(index);

  return (
    <motion.span
      className='inline-block'
      // scroll-linked fade + lift
      style={reduceMotion ? undefined : { opacity, y }}
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

/**
 * The CTA gets the very same two effects as the headline words:
 * 1. intro: it rises out of a mask, right after the last word
 * 2. scroll: it fades and lifts as the page scrolls (and returns when
 *    scrolling back up), and stops taking clicks once it is invisible
 * The mask is dropped when the intro ends so the hover scale isn't clipped.
 */
function CtaReveal({ children }) {
  const reduceMotion = useReducedMotion();
  const [settled, setSettled] = useState(false);
  const { opacity, y, pointerEvents } = useScrollFade(CTA_INDEX);

  return (
    <motion.div
      style={reduceMotion ? undefined : { opacity, y, pointerEvents }}
    >
      <div style={settled || reduceMotion ? undefined : { clipPath: CTA_CLIP }}>
        <motion.div
          initial={reduceMotion ? false : { y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{
            duration: WORD_DURATION,
            delay: CTA_DELAY,
            ease: EASE_OUT_EXPO,
          }}
          onAnimationComplete={() => setSettled(true)}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
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
      className='relative min-h-[100svh] overflow-hidden text-black selection:bg-[#d8f6a2] selection:text-[#3d5a0e]'
      variants={slideUp}
      initial='initial'
      animate='enter'
    >
      {/* The paper, blooms, glows and grid now come from the site-wide
          <SiteBackdrop /> (root layout), so the hero is transparent and shares
          the exact same background as every other page. Only the two calm
          zones live here: a soft paper wash behind the headline and a slightly
          darker, cooler wash behind the CTA (so the near-white pill stands
          out).
          The zone centers (offsets from the vertical middle) differ per
          breakpoint because the headline scales with the viewport.
          The offsets follow the block's bottom padding: when it was cut
          (pb-28 -> pb-20 mobile, pb-36 -> pb-24 desktop) the block moved
          down by half of that cut relative to the hero's middle, so
          --head-y / --cta-y grew by the same half (+16px mobile, +24px
          desktop) and the calm light zones stay behind the text and the pill. */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 [--cta-y:113px] [--head-y:-43px] md:[--cta-y:196px] md:[--head-y:-50px]'
        style={{ backgroundImage: CALM_BACKGROUND }}
      />

      {/* floating 3D logos: asymmetric scatter around the headline, lit from
          the top-left, sequenced right after the headline words */}
      <HeroLogos />

      {/* headline + CTA as ONE block centered in the hero, so the gap between
          them is constant on every screen (it can't drift apart on tall
          viewports like it did with the CTA pinned to the bottom).
          The headline is a shrink-to-fit block so the staggered lines sit
          optically centered. The padding is bottom-light on purpose: the
          space under the CTA used to be 112/144px and made the page feel
          empty right after the hero. It is now 80/96px. The hero is still
          at least one full screen tall (min-h-[100svh]), so the dashed
          "About" line below it never starts above the fold: on landing it
          stays hidden and it shows up after a small scroll. */}
      <div className='relative flex min-h-[100svh] items-center'>
        <div className='mx-auto w-full max-w-5xl px-6 pb-20 pt-[116px] md:px-10 md:pb-24 md:pt-36'>
          <h1 className='mx-auto w-fit font-[family-name:var(--font-inter-tight)] text-[clamp(2.5rem,6.4vw,5.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]'>
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
              Near-white outer pill 225 x 62, 6px ring, 6px gap, 50px inner
              buttons. Only the colours are themed. Resting state: lime label
              with dark text, dark circle with a lime arrow. On hover the two
              swap (dark label with lime text, lime circle with a dark arrow).
              Sits a deliberate, modest gap under the headline. It shares the
              headline's rise-from-mask intro and scroll fade (CtaReveal). */}
          <div className='mt-[60px] flex justify-center md:mt-[88px]'>
            <CtaReveal>
              <button
                type='button'
                onClick={() => scrollToId('contact-footer')}
                aria-label="Let's talk, go to contact"
                className='group flex items-center gap-[6px] rounded-full bg-[#f4f4f5] p-[6px] font-[family-name:var(--font-inter-tight)] transition-transform duration-300 ease-in-expo hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f2024]'
              >
                <span className='flex h-[50px] w-[156px] items-center justify-center whitespace-nowrap rounded-full bg-[#b6f500] text-[20px] font-semibold leading-none tracking-[0.01em] text-[#1f2024] transition-colors duration-300 group-hover:bg-[#1f2024] group-hover:text-[#b6f500]'>
                  Let&apos;s talk
                </span>
                <span className='flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#1f2024] transition-colors duration-300 group-hover:bg-[#b6f500]'>
                  <ArrowUpRight
                    size={20}
                    strokeWidth={2.25}
                    className='text-[#b6f500] transition-all duration-300 ease-in-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1f2024]'
                  />
                </span>
              </button>
            </CtaReveal>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
