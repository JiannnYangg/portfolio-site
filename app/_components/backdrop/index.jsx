/**
 * Site-wide background: the landing page's paper, blooms, lime glows and
 * graph-paper grid, as ONE fixed layer mounted in the root layout.
 *
 * Why fixed + root layout:
 * - it is identical on every page and at every scroll position, so there are
 *   no seams, no repeating tiles and no per-page copies to keep in sync
 * - it is not remounted on navigation, so the grid never flashes or jumps
 * - the grid is anchored to the viewport, so every page shares the same lines
 *
 * Sections on top of it must stay transparent (the footer is the one
 * deliberate dark block).
 */

/** Base sheet colour, also used as body background (see globals.css) */
export const PAPER_RGB = '243,243,245';

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

export function SiteBackdrop() {
  return (
    <div aria-hidden='true' className='site-backdrop'>
      <div
        className='absolute inset-0'
        style={{ opacity: 0.6, backgroundImage: PAPER_FOLDS }}
      />
      <div
        className='absolute inset-0'
        style={{ opacity: 0.7, backgroundImage: BLOOMS }}
      />
      <div className='absolute inset-0' style={{ backgroundImage: GLOWS }} />
      <div
        className='absolute inset-0'
        style={{ backgroundImage: GRID, backgroundSize: GRID_CELL }}
      />
    </div>
  );
}
