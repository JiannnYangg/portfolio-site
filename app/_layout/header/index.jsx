'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

import { PAPER_RGB } from '@/components';
import { introDelay } from '@/data';
import { scrollToId, useLoopDelay, useScrollFade } from '@/hooks';

import { HeroLogos } from './hero-logos';
import { slideUp } from './variants';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const IOS_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
const CALLOUT_ITEMS = ['Copy', 'Look Up', 'Translate'];

/**
 * Timeline (seconds). The header itself slides in at 2.4s (see variants.js,
 * right as the 2.0s preloader leaves), so everything inside it is sequenced
 * from there:
 * words rise in -> CTA rises in -> selection highlight -> handles -> callout
 * -> light sweeps.
 */
const HERO_START = 2.4;
const WORD_DELAY = HERO_START + 0.15;
const WORD_STAGGER = 0.07; // seconds between consecutive words
const WORD_DURATION = 0.8;
const HIGHLIGHT_DELAY = 3.3;
const HANDLES_DELAY = 3.8;
const CALLOUT_DELAY = 4.1;
const MARKER_DELAY = 4.0; // marker bar behind "seen." sweeps in once the last word has settled
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

/**
 * Brand colours, taken from the brand reference: a soft grey-beige paper
 * (#e5e3dd) and a vermilion orange (#e24a28). The accent runs from a light
 * coral-orange (#f59a6c) to that vermilion.
 *
 * RULE: the hero never goes brown. Brown is what you get when orange is made
 * darker (dark stops, multiply blends, dark overlays). So every orange here
 * stays a bright, saturated orange from end to end, no stop darker than
 * #d63f20, no mix-blend-mode, and all dark text is a pure neutral charcoal
 * (#1f1b18), never a tinted brown or maroon.
 */

/**
 * "seen." marker: a highlighter swipe. Light coral-orange melts into the
 * brand vermilion. Plain opaque colour, no multiply blend (multiply darkens
 * orange into brown). Dark letters sit on top and stay crisp.
 */
const MARKER_GRADIENT =
  'linear-gradient(95deg, rgba(250,160,110,0.92) 0%, rgba(243,112,60,0.94) 45%, rgba(226,74,40,0.96) 100%)';
/** a thinner streak under the main swipe: a second marker pass, in a lighter
 *  coral so it brightens the edge instead of darkening it */
const MARKER_STREAK_GRADIENT =
  'linear-gradient(95deg, rgba(250,140,90,0.0) 0%, rgba(244,106,58,0.85) 40%, rgba(240,96,50,0.95) 100%)';
const MARKER_GLOW = 'drop-shadow(0 4px 10px rgba(226,74,40,0.3))';

/**
 * "design" selection: a light, soft selection fill only. Warm coral on the
 * left, a touch deeper vermilion on the right. No outline, no glow, so there
 * are no lines along the top and bottom of the word.
 */
const SELECTION_GRADIENT =
  'linear-gradient(100deg, rgba(250,160,110,0.22) 0%, rgba(240,106,58,0.26) 50%, rgba(226,74,40,0.30) 100%)';
const HANDLE_TOP = '#e24a28';
const HANDLE_BOTTOM = '#e24a28';
/** selection text: the same neutral charcoal as the other words, so the
 *  selected word reads like normal selected text and never turns brown */
const SELECTION_INK = '#1f1b18';

/**
 * Headline accent: the word "build" is filled with a vermilion gradient
 * that slowly flows through the letters: vermilion -> bright orange glint ->
 * vermilion. The gradient is twice as wide as the word and its stops repeat
 * every half, so sliding it by one half loops forever without a visible
 * seam. Every stop is a bright orange (none darker than #d63f20), so it never
 * turns brown.
 *
 * BUILD_SOLID is the fallback: it is the text colour, so a browser that can't
 * clip a gradient to text still shows the word in solid orange.
 */
const BUILD_SOLID = '#e24a28';
const BUILD_GRADIENT =
  'linear-gradient(100deg, #d63f20 0%, #e24a28 18%, #f57c3c 25%, #e24a28 32%, #d63f20 50%, #e24a28 68%, #f57c3c 75%, #e24a28 82%, #d63f20 100%)';
const BUILD_GLOW = 'drop-shadow(0 6px 14px rgba(226,74,40,0.22))';

/**
 * CTA colours: a diagonal blue gradient sampled from the reference button,
 * from a bright periwinkle blue (#4d65ee) at the top-left to a deeper
 * royal blue (#2f40c1) at the bottom-right. White text stays well above 4:1
 * on every stop.
 *
 * CTA_SOLID is the fallback: it paints first, so a browser that can't draw
 * the gradient still shows a solid blue pill with white text.
 */
const CTA_SOLID = '#4359e8';
const CTA_GRADIENT =
  'linear-gradient(135deg, #4d65ee 0%, #4359e8 50%, #2f40c1 100%)';
const CTA_DARK = '#1f1b18';

/**
 * The iOS edit menu is a neutral dark bubble, here a charcoal so it belongs
 * to the palette: (rgb 31,27,24) at 94% opacity, with the same frosted blur
 * behind it. White on it is well above 12:1. Because it is nearly opaque, it
 * still reads as a solid bubble in a browser without backdrop-filter support.
 */
const MENU_BG = 'rgba(31, 27, 24, 0.94)';
const MENU_FILTER = 'blur(20px) saturate(180%)';

/**
 * "Calm zones": the site backdrop (paper folds, grid, blooms, orange glows) is
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
 * The CTA zone is the exception: the pill is a near-white, so a paper
 * wash behind it made it vanish. Its wash uses a slightly darker stone grey,
 * and a bit stronger, so the pill reads clearly while the area still looks
 * calm.
 *
 * The zones follow the content: the headline + CTA are one block centered in
 * the hero, so the zone centers are offsets from the vertical middle
 * (--head-y / --cta-y, set per breakpoint on the wrapper below).
 */
const CALM_OPACITY = 0.55;
const CALM_WASH = 1 - CALM_OPACITY;
const CTA_WASH_RGB = '212,208,200';
const CTA_WASH = 0.75;
const calmZone = (size, centerY, rgb = PAPER_RGB, wash = CALM_WASH) =>
  `radial-gradient(ellipse ${size} at 50% ${centerY}, rgba(${rgb},${wash}) 0%, rgba(${rgb},${wash}) 65%, rgba(${rgb},0) 100%)`;
const CALM_BACKGROUND = [
  calmZone('40% 26%', 'calc(50% + var(--head-y))'), // headline block
  calmZone('200px 80px', 'calc(50% + var(--cta-y))', CTA_WASH_RGB, CTA_WASH), // CTA pill
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
          delay: introDelay(WORD_DELAY + index * WORD_STAGGER),
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
            delay: introDelay(CTA_DELAY),
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

/**
 * Key word inside the headline: ExtraBold Italic, filled with the vermilion
 * gradient (text-clip, solid orange fallback). The gradient flows
 * slowly through the letters; with reduced motion it stays still.
 * The italic glyphs lean past their box on the right, so a small padding
 * (cancelled by an equal negative margin, so the layout does not move) keeps
 * the last letter from being clipped by the gradient box.
 */
function Emphasis({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.em
      className='font-extrabold italic'
      style={{
        color: BUILD_SOLID,
        backgroundImage: BUILD_GRADIENT,
        backgroundSize: '200% 100%',
        backgroundPosition: '0% 50%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: BUILD_GLOW,
        paddingRight: '0.12em',
        marginRight: '-0.12em',
      }}
      animate={reduceMotion ? undefined : { backgroundPosition: '100% 50%' }}
      transition={{
        delay: introDelay(HERO_START + 1.2),
        duration: 6,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      {children}
    </motion.em>
  );
}

/**
 * Highlighter marker behind a word, built from two passes like a real pen:
 * 1. the main swipe: tilted up to the right, an uneven quadrilateral that
 *    starts at the first letter and trails past the last one, filled with the
 *    coral -> orange -> vermilion gradient, with a soft orange glow
 * 2. a thin, bright streak along the bottom edge (the pen's second pass)
 * Both are plain colour (no blend mode), so they stay a clean orange and
 * never muddy into brown. Text stays dark and crisp on top. The swipe sweeps
 * in from the left after the line settles, and the streak follows it.
 */
function Marker({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <span className='relative inline-block'>
      <span
        aria-hidden='true'
        className='absolute inset-0'
        style={{ filter: MARKER_GLOW }}
      >
        {/* main swipe */}
        <motion.span
          className='absolute -left-[0.06em] -right-[0.32em] bottom-[0.0em] h-[0.56em] origin-left'
          style={{
            backgroundImage: MARKER_GRADIENT,
            rotate: -1.8,
            clipPath: 'polygon(0% 20%, 100% 0%, 94% 100%, 3% 84%)',
          }}
          initial={reduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            delay: introDelay(MARKER_DELAY),
            duration: 0.7,
            ease: EASE_OUT_EXPO,
          }}
        />
        {/* second pass: thin bright streak */}
        <motion.span
          className='absolute -left-[0.02em] -right-[0.22em] -bottom-[0.04em] h-[0.14em] origin-left'
          style={{
            backgroundImage: MARKER_STREAK_GRADIENT,
            rotate: -1.8,
            clipPath: 'polygon(0% 40%, 100% 0%, 96% 100%, 6% 90%)',
          }}
          initial={reduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            delay: introDelay(MARKER_DELAY + 0.25),
            duration: 0.6,
            ease: EASE_OUT_EXPO,
          }}
        />
      </span>
      <em className='relative font-extrabold italic'>{children}</em>
    </span>
  );
}

/**
 * iOS edit menu (the bubble shown when text is selected on iPhone):
 * frosted charcoal glass (see MENU_BG) with a soft blur, small radius,
 * hairline dividers, a trailing chevron and a pointer arrow.
 * A slim, soft sheen sweeps slowly across it, like light catching glass.
 *
 * On phones it is a size smaller (10px text, tighter padding, 12px of air
 * under it) so it stays a small detail on a narrow screen; from `wide:` up it
 * keeps its original size.
 */
function IosCallout() {
  const reduceMotion = useReducedMotion();
  //? the sheen repeats forever: it only runs while the bubble is near the
  //? screen, so it costs nothing once the visitor has scrolled past the hero
  const sheenRef = useRef(null);
  const onScreen = useInView(sheenRef, { margin: '200px 0px 200px 0px' });
  const sheenDelay = useLoopDelay(onScreen, introDelay(SHINE_FIRST_DELAY));

  return (
    <span
      aria-hidden='true'
      className='pointer-events-none absolute bottom-full left-1/2 z-10 mb-[12px] -translate-x-1/2 wide:mb-[16px]'
    >
      <motion.span
        className='relative flex select-none items-stretch whitespace-nowrap rounded-[7px] text-[10px] font-medium not-italic leading-none tracking-normal text-white shadow-[0_6px_20px_rgba(0,0,0,0.28),0_0_0_0.5px_rgba(255,255,255,0.12)] wide:rounded-[9px] wide:text-[12px]'
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
          delay: introDelay(CALLOUT_DELAY),
          duration: 0.22,
          ease: EASE_OUT_EXPO,
        }}
      >
        {CALLOUT_ITEMS.map((item, index) => (
          <span
            key={item}
            className={`flex items-center px-[7px] py-[6px] wide:px-[10px] wide:py-[9px] ${index > 0 ? 'border-l-[0.5px] border-white/20' : ''}`}
          >
            {item}
          </span>
        ))}
        <span className='flex items-center border-l-[0.5px] border-white/20 px-[5px] wide:px-[6px]'>
          <ChevronRight
            size={12}
            strokeWidth={2.5}
            className='h-[9px] w-[9px] wide:h-3 wide:w-3'
          />
        </span>

        {/* light sweep: a slim diagonal sheen that slowly passes over the bubble */}
        {!reduceMotion && (
          <span
            ref={sheenRef}
            className='pointer-events-none absolute inset-0 overflow-hidden rounded-[7px] wide:rounded-[9px]'
          >
            <motion.span
              className='absolute inset-y-0 left-0 w-[24%]'
              style={{
                background:
                  'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 100%)',
                transform: 'skewX(-18deg)',
              }}
              initial={{ x: '-160%' }}
              animate={{ x: onScreen ? '480%' : '-160%' }}
              transition={
                onScreen
                  ? {
                      delay: sheenDelay,
                      duration: SHINE_DURATION,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatDelay: SHINE_REPEAT_DELAY,
                    }
                  : { duration: 0 }
              }
            />
          </span>
        )}

        {/* pointer arrow */}
        <span
          className='absolute left-1/2 top-full h-[5px] w-[10px] -translate-x-1/2 wide:h-[6px] wide:w-[12px]'
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
 * a light coral-to-vermilion selection fill (no outline, no glow), charcoal
 * ExtraBold Italic text, the two selection handles (a thin line with an
 * arrow: top-left ▼ / bottom-right ▲, both in the brand orange) and the
 * iPhone-style callout menu above it.
 */
function Selection({ children }) {
  const reduceMotion = useReducedMotion();

  return (
    <span className='relative inline-block px-[0.14em]'>
      {/* highlight box: light colour fill only */}
      <motion.span
        aria-hidden='true'
        className='absolute inset-x-0 inset-y-[0.06em] origin-left rounded-[3px]'
        style={{ backgroundImage: SELECTION_GRADIENT }}
        initial={reduceMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          delay: introDelay(HIGHLIGHT_DELAY),
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
          delay: introDelay(HANDLES_DELAY),
          duration: 0.4,
          ease: EASE_OUT_EXPO,
        }}
      >
        <span
          className='absolute inset-y-[0.06em] left-0 w-[0.035em]'
          style={{ backgroundColor: HANDLE_TOP }}
        />
        <span
          className='absolute -left-[0.135em] -top-[0.1em] h-[0.26em] w-[0.3em] [clip-path:polygon(0_0,100%_0,50%_100%)]'
          style={{ backgroundColor: HANDLE_TOP }}
        />
        <span
          className='absolute inset-y-[0.06em] right-0 w-[0.035em]'
          style={{ backgroundColor: HANDLE_BOTTOM }}
        />
        <span
          className='absolute -bottom-[0.1em] -right-[0.135em] h-[0.26em] w-[0.3em] [clip-path:polygon(50%_0,100%_100%,0_100%)]'
          style={{ backgroundColor: HANDLE_BOTTOM }}
        />
      </motion.span>

      <IosCallout />

      <em
        className='relative font-extrabold italic'
        style={{ color: SELECTION_INK }}
      >
        {children}
      </em>
    </span>
  );
}

export function Header() {
  return (
    <motion.header
      className='hero-scope relative min-h-[100svh] overflow-hidden text-[#1f1b18] selection:bg-[#f7c9b8] selection:text-[#1f1b18]'
      variants={slideUp}
      initial='initial'
      animate='enter'
    >
      {/* The paper, blooms, glows and grid now come from the site-wide
          <SiteBackdrop /> (root layout), so the hero is transparent and shares
          the exact same background as every other page. Only the two calm
          zones live here: a soft paper wash behind the headline and a slightly
          darker wash behind the CTA (so the near-white pill stands out).
          The zone centers (offsets from the vertical middle, --head-y and
          --cta-y) are worked out in globals.css (.hero-scope) from the same
          numbers the block below uses (headline size, gap, padding), so the
          calm zones stay behind the text and the pill at every phone size. */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0'
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
        {/* Phones: the side padding is the guide inset plus the section inset,
            the same edge every other section's text starts at, so a headline
            line can never touch a dashed guide. The headline size and the
            padding above / below come from the .hero-scope tokens (globals.css)
            because the hero logos are placed against this block's edges. */}
        <div className='mx-auto w-full max-w-5xl px-[calc(var(--guide-inset)+var(--section-inset))] pb-[var(--hero-pb)] pt-[var(--hero-pt)] md:px-10'>
          <h1 className='mx-auto w-fit font-[family-name:var(--font-inter-tight)] text-[length:var(--hero-fs)] font-semibold leading-[1.08] tracking-[-0.03em]'>
            <Line>
              <Word index={0}>We</Word>{' '}
              <Word index={1}>
                <Selection>design</Selection>
              </Word>{' '}
              <Word index={2} last>
                it.
              </Word>
            </Line>
            <Line className='wide:pl-[1em]'>
              <Word index={3}>We</Word>{' '}
              <Word index={4}>
                <Emphasis>build</Emphasis>
              </Word>{' '}
              <Word index={5} last>
                it.
              </Word>
            </Line>
            <Line className='wide:pl-[2em]'>
              <Word index={6}>We</Word> <Word index={7}>get</Word>{' '}
              <Word index={8}>it</Word>{' '}
              <Word index={9} last>
                <Marker>seen.</Marker>
              </Word>
            </Line>
          </h1>

          {/* CTA: same shape and sizing as the reference (no border, no
              outer shadow). Near-white outer pill, 6px ring, 6px gap, 50px
              inner buttons. Only the colours are themed.
              On phones it is one size smaller (5px ring, 42px buttons, 17px
              label: 52px tall in all, which is the --hero-cta token in
              globals.css) and sits closer under the headline; from `wide:`
              up it keeps the original 62px size.
              Resting state: a blue gradient label with white text, and a
              dark circle with a white arrow. On hover the two swap (dark
              label, gradient circle). A CSS gradient can't be transitioned,
              so each button has its resting fill as the background and the
              other fill as an overlay that fades in on hover / keyboard
              focus. The overlay sits behind the text (-z-10 inside an
              `isolate` stacking context), so the label and arrow never
              flicker. The solid theme blue is the fallback colour under the
              gradient. A subtle top highlight gives the label some depth.
              Sits a deliberate, modest gap under the headline. It shares the
              headline's rise-from-mask intro and scroll fade (CtaReveal). */}
          <div className='mt-[var(--hero-gap)] flex justify-center'>
            <CtaReveal>
              <button
                type='button'
                onClick={() => scrollToId('contact-footer')}
                aria-label="Let's talk, go to contact"
                className='group flex items-center gap-[5px] rounded-full bg-[#f6f4f0] p-[5px] font-[family-name:var(--font-inter-tight)] wide:gap-[6px] wide:p-[6px] transition-transform duration-300 ease-in-expo hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f1b18] motion-reduce:transition-none motion-reduce:hover:scale-100'
              >
                <span
                  className='relative isolate flex h-[42px] w-[128px] items-center justify-center overflow-hidden whitespace-nowrap rounded-full text-[17px] font-semibold leading-none tracking-[0.01em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] wide:h-[50px] wide:w-[156px] wide:text-[20px]'
                  style={{
                    backgroundColor: CTA_SOLID,
                    backgroundImage: CTA_GRADIENT,
                  }}
                >
                  {/* hover / focus: dark fill fades in behind the text */}
                  <span
                    aria-hidden='true'
                    className='absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none'
                    style={{ backgroundColor: CTA_DARK }}
                  />
                  Let&apos;s talk
                </span>
                <span
                  className='relative isolate flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full wide:h-[50px] wide:w-[50px]'
                  style={{ backgroundColor: CTA_DARK }}
                >
                  {/* hover / focus: the blue gradient fades in behind the arrow */}
                  <span
                    aria-hidden='true'
                    className='absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none'
                    style={{
                      backgroundColor: CTA_SOLID,
                      backgroundImage: CTA_GRADIENT,
                    }}
                  />
                  <ArrowUpRight
                    size={20}
                    strokeWidth={2.25}
                    className='h-[17px] w-[17px] text-white transition-transform duration-300 ease-in-expo wide:h-5 wide:w-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0'
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
