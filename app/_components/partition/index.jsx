'use client';

import { useEffect, useRef, useState } from 'react';

import { motion, useInView, useReducedMotion } from 'framer-motion';

/*
 * Page partitions: a dashed line used as a layout system.
 *
 * - <SiteGuides />  two vertical dashed guides, running the whole page, at the
 *   left and right edge of the content column.
 * - <Partition />   a full-width horizontal dashed line that marks where one
 *   section ends and the next begins. It crosses the guides, and a small lime
 *   label sits on each crossing: the section name on the left, its number on
 *   the right, like a drawing sheet.
 *
 * Both are decorative (aria-hidden, no pointer events).
 */
/** Bright lime: the labels */
const LIME = '#b6f500';
/** Deeper lime (darker, not black): the dashed lines */
const LINE = '#6f9c00';
/** Deep forest green, the same dark as the intro screen: the label text */
const INK = '#0b1f14';

/**
 * x of a guide, measured from the page edge. Mirrors the Tailwind `container`
 * (max 1400px, centred, 2rem side padding) so guides line up with content.
 * Exported so the navbar can align the logo and the links to the same guides.
 */
export const GUIDE_X = 'calc((100% - min(100%, 1400px)) / 2 + 2rem)';

const dashes = direction =>
  `repeating-linear-gradient(${direction}, ${LINE} 0 7px, transparent 7px 13px)`;

/** Vertical guides, painted on the page behind the content (like the backdrop) */
export function SiteGuides() {
  return (
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 -z-10'
    >
      {['left', 'right'].map(side => (
        <span
          key={side}
          className='absolute inset-y-0 block w-0.5'
          style={{
            [side]: `calc(${GUIDE_X} - 1px)`,
            backgroundImage: dashes('to bottom'),
          }}
        />
      ))}
    </div>
  );
}

/*
 * Glitch text for the labels.
 *
 * 1. DECODE: when the label scrolls into view its characters are random
 *    glyphs and lock into the real text one by one, left to right.
 * 2. IDLE GLITCH: every few seconds (random, so the labels don't pulse in
 *    sync) one or two characters flicker for a fraction of a second, with a
 *    thin red / cyan split on the letters.
 *
 * The font is monospace, so the label never changes width while it scrambles.
 * Brackets and spaces are never scrambled. With reduced motion the label is
 * just static text.
 */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*+=<>/';
const KEEP = /[()\s]/;
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/** Thin colour split used while a glitch is running */
const GLITCH_SHADOW = '1px 0 rgba(255, 46, 99, 0.85), -1px 0 rgba(8, 217, 214, 0.85)';

function useGlitchText({ text, active, startDelayMs, reduceMotion }) {
  const [display, setDisplay] = useState(text);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (!active || reduceMotion) return undefined;

    const chars = [...text];
    const timers = [];
    let cancelled = false;
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
    };

    // short flicker: a few frames where 1-2 characters are swapped
    const idleGlitch = () => {
      const swappable = chars
        .map((c, i) => (KEEP.test(c) ? -1 : i))
        .filter(i => i >= 0);
      let frames = 4;
      setGlitching(true);

      const frame = () => {
        if (frames === 0) {
          setDisplay(text);
          setGlitching(false);
          later(idleGlitch, 3500 + Math.random() * 5500);
          return;
        }
        frames -= 1;
        const next = [...chars];
        const count = 1 + Math.floor(Math.random() * 2);
        for (let k = 0; k < count; k += 1) {
          next[swappable[Math.floor(Math.random() * swappable.length)]] =
            randomGlyph();
        }
        setDisplay(next.join(''));
        later(frame, 55);
      };

      frame();
    };

    // decode-in: everything scrambled, then locks in left to right
    setDisplay(chars.map(c => (KEEP.test(c) ? c : randomGlyph())).join(''));
    setGlitching(true);

    later(() => {
      const startedAt = performance.now();
      const resolveAt = chars.map((_, i) => 160 + i * 75 + Math.random() * 120);
      const lastResolve = Math.max(...resolveAt);

      const tick = () => {
        const elapsed = performance.now() - startedAt;
        setDisplay(
          chars
            .map((c, i) =>
              KEEP.test(c) || elapsed >= resolveAt[i] ? c : randomGlyph(),
            )
            .join(''),
        );

        if (elapsed < lastResolve) {
          later(tick, 45);
        } else {
          setDisplay(text);
          setGlitching(false);
          later(idleGlitch, 2500 + Math.random() * 4000);
        }
      };

      tick();
    }, startDelayMs);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [active, reduceMotion, startDelayMs, text]);

  return { display, glitching };
}

/** Small lime label sitting on a guide crossing */
function Tag({ side, delay, text }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const { display, glitching } = useGlitchText({
    text,
    active: inView,
    // same moment the label fades in (see transition below)
    startDelayMs: (0.7 + delay) * 1000,
    reduceMotion,
  });

  return (
    <motion.span
      ref={ref}
      className='absolute top-1/2 z-10 whitespace-nowrap rounded-md px-2 font-mono text-[10px] font-bold leading-5 tracking-tight sm:text-[11px]'
      style={{
        [side]: GUIDE_X,
        x: side === 'left' ? '-50%' : '50%',
        y: '-50%',
        backgroundColor: LIME,
        color: INK,
        textShadow: glitching ? GLITCH_SHADOW : 'none',
        // paper-coloured ring so the label cuts cleanly through the dashes
        boxShadow: '0 0 0 3px rgba(243, 243, 245, 0.95)',
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.7 + delay }}
    >
      {display}
    </motion.span>
  );
}

/**
 * @param {{ name: string, index: string, delay?: number }} props
 * name: section name (left label). index: section number (right label).
 * delay: seconds to wait before drawing (used under the intro screen).
 */
export function Partition({ name, index, delay = 0 }) {
  return (
    <div
      aria-hidden='true'
      className='pointer-events-none relative h-0.5 w-full select-none'
    >
      {/* the line draws itself in from the left when it scrolls into view */}
      <motion.span
        className='absolute inset-0 block origin-left'
        style={{ backgroundImage: dashes('to right') }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay }}
      />
      <Tag side='left' delay={delay} text={`(${name})`} />
      <Tag side='right' delay={delay} text={`(${index})`} />
    </div>
  );
}
