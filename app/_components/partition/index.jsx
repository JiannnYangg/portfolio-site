'use client';

import { motion } from 'framer-motion';

/*
 * Page partitions: the site's lime dashed line (same colour and 7/6 dash
 * rhythm as the dashed frame round the intro paragraph) used as a layout
 * system.
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
const LIME = '#b6f500';
/** Deep forest green, the same dark as the intro screen */
const INK = '#0b1f14';

/**
 * x of a guide, measured from the page edge. Mirrors the Tailwind `container`
 * (max 1400px, centred, 2rem side padding) so guides line up with content.
 */
const GUIDE_X = 'calc((100% - min(100%, 1400px)) / 2 + 2rem)';

const dashes = direction =>
  `repeating-linear-gradient(${direction}, ${LIME} 0 7px, transparent 7px 13px)`;

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

/** Small lime label sitting on a guide crossing */
function Tag({ side, children }) {
  return (
    <motion.span
      className='absolute top-1/2 z-10 whitespace-nowrap rounded-md px-2 font-mono text-[10px] font-bold leading-5 tracking-tight sm:text-[11px]'
      style={{
        [side]: GUIDE_X,
        x: side === 'left' ? '-50%' : '50%',
        y: '-50%',
        backgroundColor: LIME,
        color: INK,
        // paper-coloured ring so the label cuts cleanly through the dashes
        boxShadow: '0 0 0 3px rgba(243, 243, 245, 0.95)',
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.7 }}
    >
      {children}
    </motion.span>
  );
}

/**
 * @param {{ name: string, index: string }} props
 * name: section name (left label). index: section number (right label).
 */
export function Partition({ name, index }) {
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
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      />
      <Tag side='left'>({name})</Tag>
      <Tag side='right'>({index})</Tag>
    </div>
  );
}
