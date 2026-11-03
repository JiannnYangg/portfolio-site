'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Site-wide background, painted ONTO THE PAGE (it scrolls with the content):
 * the landing page's paper, blooms and lime glows, with the graph-paper grid
 * on top.
 *
 * How it works
 * - It is absolutely positioned inside <body> and covers the whole document,
 *   so scrolling moves the gradients exactly like any other part of the page.
 *   Nothing is pinned to the screen.
 * - The gradient composition is one "sheet" the height of a screen. The first
 *   sheet is the landing hero, pixel for pixel. Sheets are stacked down the
 *   page and every second one is flipped vertically, so the edge where two
 *   sheets meet is a mirror image of itself: the blooms and glows continue
 *   smoothly instead of being cut off (no visible seam, no hard repeat).
 * - The grid is a single layer over the whole page (not per sheet), so its
 *   lines are continuous and identical on every page.
 * - The number of sheets follows the document height (ResizeObserver), so it
 *   stays correct when the page grows, shrinks or the window is resized.
 *
 * Sections on top of it must stay transparent (the footer is the one
 * deliberate dark block).
 */

/** Base sheet colour (also the body background, see globals.css) */
export const PAPER_RGB = '243,243,245';

/** Enough sheets to cover a tall first paint before the measurement runs */
const INITIAL_SHEETS = 8;

/**
 * Graph-paper grid, drawn on TOP of the blooms and glows in a deeper lime so
 * the lines stay readable on both the off-white and the lime areas.
 */
const GRID_COLOR = '140,190,0';
const GRID_ALPHA = 0.133;
const GRID_CELL = '62px 57px';

/** crumpled paper: soft grey folds on an off-white sheet */
const PAPER_FOLDS = [
  'linear-gradient(118deg, rgba(0,0,0,0) 14%, rgba(70,70,80,0.07) 24%, rgba(255,255,255,0) 36%)',
  'linear-gradient(62deg, rgba(0,0,0,0) 38%, rgba(70,70,80,0.06) 48%, rgba(255,255,255,0) 60%)',
  'linear-gradient(155deg, rgba(255,255,255,0) 52%, rgba(70,70,80,0.05) 64%, rgba(255,255,255,0) 78%)',
  'radial-gradient(38% 26% at 30% 22%, rgba(80,80,90,0.09) 0%, rgba(80,80,90,0) 100%)',
  'radial-gradient(34% 24% at 78% 58%, rgba(80,80,90,0.07) 0%, rgba(80,80,90,0) 100%)',
  'radial-gradient(40% 22% at 22% 84%, rgba(80,80,90,0.08) 0%, rgba(80,80,90,0) 100%)',
  'radial-gradient(60% 40% at 85% 12%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
].join(', ');

/** soft blooms (pale lime, yellow-green, chartreuse, mint, aqua-green, soft yellow) */
const BLOOMS = [
  'radial-gradient(34% 30% at 14% 18%, rgba(214,248,140,0.55) 0%, rgba(214,248,140,0) 100%)',
  'radial-gradient(30% 28% at 52% 8%, rgba(232,250,160,0.50) 0%, rgba(232,250,160,0) 100%)',
  'radial-gradient(32% 30% at 84% 40%, rgba(176,238,200,0.50) 0%, rgba(176,238,200,0) 100%)',
  'radial-gradient(30% 28% at 40% 62%, rgba(200,245,110,0.45) 0%, rgba(200,245,110,0) 100%)',
  'radial-gradient(34% 30% at 70% 90%, rgba(170,236,214,0.50) 0%, rgba(170,236,214,0) 100%)',
  'radial-gradient(28% 26% at 6% 66%, rgba(247,250,170,0.50) 0%, rgba(247,250,170,0) 100%)',
].join(', ');

/** lime corner glows */
const GLOWS = [
  'radial-gradient(55% 42% at 100% 0%, rgba(182,245,0,0.8) 0%, rgba(182,245,0,0) 70%)',
  'radial-gradient(50% 38% at 0% 100%, rgba(182,245,0,0.75) 0%, rgba(182,245,0,0) 70%)',
].join(', ');

const GRID = [
  `linear-gradient(to right, rgba(${GRID_COLOR},${GRID_ALPHA}) 2px, transparent 2px)`,
  `linear-gradient(to bottom, rgba(${GRID_COLOR},${GRID_ALPHA}) 2px, transparent 2px)`,
].join(', ');

/** One screen of gradients. `flipped` mirrors it so neighbours join cleanly. */
function Sheet({ flipped, sheetRef }) {
  return (
    <div
      ref={sheetRef}
      className='backdrop-sheet'
      style={flipped ? { transform: 'scaleY(-1)' } : undefined}
    >
      <div
        className='absolute inset-0'
        style={{ opacity: 0.6, backgroundImage: PAPER_FOLDS }}
      />
      <div
        className='absolute inset-0'
        style={{ opacity: 0.7, backgroundImage: BLOOMS }}
      />
      <div className='absolute inset-0' style={{ backgroundImage: GLOWS }} />
    </div>
  );
}

export function SiteBackdrop() {
  const firstSheet = useRef(null);
  const [count, setCount] = useState(INITIAL_SHEETS);

  useEffect(() => {
    const body = document.body;

    const update = () => {
      const sheetHeight =
        firstSheet.current?.offsetHeight || window.innerHeight || 1;
      // +1 sheet of slack; the container clips whatever is beyond the page
      setCount(Math.max(2, Math.ceil(body.scrollHeight / sheetHeight) + 1));
    };

    update();

    // body grows/shrinks with page content (route changes, images, fonts)
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(body);
    window.addEventListener('resize', update);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div aria-hidden='true' className='site-backdrop'>
      {Array.from({ length: count }, (_, index) => (
        <Sheet
          key={index}
          flipped={index % 2 === 1}
          sheetRef={index === 0 ? firstSheet : undefined}
        />
      ))}
      <div
        className='absolute inset-0'
        style={{ backgroundImage: GRID, backgroundSize: GRID_CELL }}
      />
    </div>
  );
}
