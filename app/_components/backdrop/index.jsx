'use client';

import { memo, useEffect, useRef, useState } from 'react';

/**
 * Site-wide background, painted ONTO THE PAGE (it scrolls with the content).
 *
 * The landing screen (the first screen of the page) has NO blobs at all: it
 * is plain paper plus the graph-paper grid (the hero brings its own violet and
 * pink lights, see header/hero-logos.jsx). From the second screen down, a
 * light wash of soft blooms appears. For every screen-height "band" of the
 * page the layout is generated from a fixed seed with rules, so it varies the
 * way a designer would vary it by hand:
 *   - the big bloom swaps sides from band to band (left, right, left ...)
 *   - the smaller counter-bloom sits on the opposite side, tilted the other way
 *   - an elongated accent drifts near the middle on two bands out of three
 *   - a warm glow bleeds off one edge, alternating apricot top-right / coral
 *     lower-left
 *   - faint neutral folds and white highlights keep the "paper" feel
 *   - every band has its own intensity, so the page breathes: loud, quiet,
 *     medium, quiet, ...
 * Shapes are ellipses with their own width, height and tilt, so no two
 * blooms look alike.
 *
 * Technical notes
 * - Absolutely positioned inside <body> over the whole document: it scrolls
 *   with the content, nothing is pinned to the screen.
 * - Blobs are plain positioned elements (no blur filters), sized in vw and in
 *   screens, and are not clipped per band, so they cross band boundaries
 *   freely. No seams, no tiles.
 * - The generator is seeded (integer hash, no Math.random / Math.sin), so the
 *   server and client render identical markup: no hydration mismatch.
 * - The graph-paper grid is ONE layer over the whole page, so its lines are
 *   continuous and the same on every page. The footer draws the same grid on
 *   its own top half (see layout/contact/components/footer-grid.jsx), lined up
 *   with this one, so the notebook paper runs on into the footer instead of
 *   stopping at its edge.
 * - The number of bands follows the document height (ResizeObserver).
 *
 * Sections on top of it must stay transparent (the footer is the one
 * deliberate solid block).
 */

/** Base sheet colour (also the body background, see globals.css): the soft
 *  grey-beige of the brand reference (#e5e3dd) */
export const PAPER_RGB = '229,227,221';

/**
 * How strong ALL the background blobs are, as a share of their designed
 * opacity: 1 = as designed, 0.9 = 90% of it. It is applied once, to the whole
 * blob layer (see SiteBackdrop), so every blob, fold, highlight and glow is
 * scaled by the same amount and the relative balance between them stays the
 * way it was designed. The graph-paper grid is NOT affected. Valid range: 0
 * (no blobs) to 1.
 *
 * History: 0.05 was invisible, and 0.4 with pale colours was still too faint
 * to see on the grey-beige paper. 0.9 with the clearer colours below gives
 * soft, clearly visible washes (the strongest cores are about 45% opacity,
 * most are 20 to 35%) that still sit behind the text. Turn this one number up
 * or down to taste.
 */
const BLOB_STRENGTH = 0.9;

/** Enough bands to cover a tall first paint before the measurement runs */
const INITIAL_BANDS = 8;

/**
 * Graph-paper grid, drawn on TOP of the blooms in the brand orange so the
 * lines stay readable on both the paper and the coloured areas.
 * Alpha is low so the grid sits quietly behind the text.
 *
 * Exported (GRID_LINES, GRID_CELL_W, GRID_CELL_H, GRID_CELL) so the footer can
 * draw the very same grid and line it up with this one.
 */
const GRID_COLOR = '226,74,40';
const GRID_ALPHA = 0.075;
export const GRID_CELL_W = 62;
export const GRID_CELL_H = 57;
export const GRID_CELL = `${GRID_CELL_W}px ${GRID_CELL_H}px`;
export const GRID_LINES = [
  `linear-gradient(to right, rgba(${GRID_COLOR},${GRID_ALPHA}) 2px, transparent 2px)`,
  `linear-gradient(to bottom, rgba(${GRID_COLOR},${GRID_ALPHA}) 2px, transparent 2px)`,
].join(', ');

/**
 * Warm "apricot and cream" palette, a lighter cousin of the footer's orange,
 * peach and beige, so the page and the footer belong together. Every colour
 * is a clean warm tone: apricot, peach, blush rose, butter cream and honey
 * sand. Nothing here leans brown or dirty: the sand is a light honey, not a
 * tan, and the "fold" shading is a neutral warm grey.
 *
 * These are a step more saturated than a pastel would be, on purpose: the
 * paper is a grey-beige, and a very pale peach on it simply disappears. The
 * glows (which bleed off the page edges) use the strongest steps (apricot and
 * coral); the blooms use the peach, blush, cream and sand.
 * The brand vermilion #e24a28 is not used for blobs: it is too strong for a
 * wash, and stays on the buttons and the grid.
 */
const COLOR = {
  glowOrange: '255,142,70', // apricot
  glowAmber: '250,122,92', // soft coral
  softPeach: '252,176,124', // peach
  blush: '248,166,154', // blush rose, a whisper of pink to warm the peach
  softBeige: '250,234,204', // butter cream
  sand: '242,208,150', // honey sand
  white: '255,255,255',
  fold: '96,86,76',
};

/** How loud each band is. Cycles, so the page has a rhythm. */
const INTENSITY = [1, 0.72, 0.95, 0.58, 0.85, 0.68];

/* eslint-disable no-bitwise */
/** Small seeded PRNG (mulberry32): identical output on server and client */
function seeded(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* eslint-enable no-bitwise */

const between = (rand, min, max) => min + rand() * (max - min);
const pick = (rand, list) => list[Math.floor(rand() * list.length)];

/**
 * The blobs of one band.
 * x: center, % of page width. y: center, in screens (band + fraction).
 * w: width in vw. h: height in screens. rot: tilt in degrees.
 * a: peak alpha (already multiplied by the band intensity).
 */
function bandBlobs(band) {
  const rand = seeded(band * 7919 + 101);
  const power = INTENSITY[band % INTENSITY.length];
  const leftFirst = band % 2 === 0;
  const dir = leftFirst ? 1 : -1;

  const bigX = leftFirst ? between(rand, 8, 24) : between(rand, 76, 92);
  const counterX = leftFirst ? between(rand, 72, 90) : between(rand, 10, 28);

  // under-layer: paper folds + highlight
  const under = [
    {
      x: between(rand, 25, 75),
      y: band + between(rand, 0.25, 0.55),
      w: between(rand, 50, 70),
      h: between(rand, 0.3, 0.5),
      rot: between(rand, -40, 40),
      rgb: COLOR.fold,
      a: between(rand, 0.04, 0.065),
    },
    {
      x: counterX,
      y: band + between(rand, 0.05, 0.2),
      w: between(rand, 45, 65),
      h: between(rand, 0.3, 0.45),
      rot: -dir * between(rand, 5, 25),
      rgb: COLOR.white,
      a: between(rand, 0.5, 0.75),
    },
  ];

  // blooms
  const blooms = [
    {
      x: bigX,
      y: band + between(rand, 0.1, 0.3),
      w: between(rand, 55, 80),
      h: between(rand, 0.55, 0.8),
      rot: dir * between(rand, 10, 35),
      rgb: pick(rand, [COLOR.softPeach, COLOR.blush, COLOR.softPeach]),
      a: between(rand, 0.42, 0.56) * power,
    },
    {
      x: counterX,
      y: band + between(rand, 0.45, 0.65),
      w: between(rand, 40, 60),
      h: between(rand, 0.4, 0.6),
      rot: -dir * between(rand, 8, 28),
      rgb: pick(rand, [COLOR.sand, COLOR.softBeige, COLOR.sand]),
      a: between(rand, 0.4, 0.55) * power,
    },
  ];

  // elongated accent near the middle, two bands out of three
  if (band % 3 !== 1) {
    blooms.push({
      x: between(rand, 30, 70),
      y: band + between(rand, 0.78, 0.93),
      w: between(rand, 28, 42),
      h: between(rand, 0.22, 0.34),
      rot: between(rand, -20, 20),
      rgb: pick(rand, [COLOR.softBeige, COLOR.blush, COLOR.sand]),
      a: between(rand, 0.3, 0.42) * power,
    });
  }

  // warm glow bleeding off an edge: apricot top-right on even bands, coral lower-left on odd
  const glows =
    band % 2 === 0
      ? [
          {
            x: 104,
            y: band + 0.04,
            w: between(rand, 48, 62),
            h: between(rand, 0.5, 0.7),
            rot: between(rand, -12, 12),
            rgb: COLOR.glowOrange,
            a: between(rand, 0.46, 0.6) * power,
          },
        ]
      : [
          {
            x: -4,
            y: band + between(rand, 0.7, 0.85),
            w: between(rand, 44, 58),
            h: between(rand, 0.45, 0.65),
            rot: between(rand, -14, 14),
            rgb: COLOR.glowAmber,
            a: between(rand, 0.42, 0.56) * power,
          },
        ];

  return [...under, ...blooms, ...glows];
}

/** Soft, gaussian-ish falloff: strong core, long gentle tail */
function blobStyle({ x, y, w, h, rot, rgb, a }) {
  const stop = factor => `rgba(${rgb},${(a * factor).toFixed(3)})`;

  return {
    left: `${x.toFixed(2)}%`,
    top: `calc(var(--screen) * ${y.toFixed(3)})`,
    width: `${w.toFixed(2)}vw`,
    height: `calc(var(--screen) * ${h.toFixed(3)})`,
    transform: `translate(-50%, -50%) rotate(${rot.toFixed(1)}deg)`,
    backgroundImage: `radial-gradient(ellipse closest-side, ${stop(1)} 0%, ${stop(0.55)} 40%, ${stop(0.18)} 72%, rgba(${rgb},0) 100%)`,
  };
}

const Band = memo(function Band({ band }) {
  // band 0 is the landing screen: no blobs there
  if (band === 0) return null;

  return bandBlobs(band).map((blob, index) => (
    <span
      key={index}
      className='absolute block'
      style={blobStyle(blob)}
    />
  ));
});

export function SiteBackdrop() {
  const probe = useRef(null);
  const [bands, setBands] = useState(INITIAL_BANDS);

  useEffect(() => {
    const body = document.body;

    const update = () => {
      // one screen in px, exactly as the CSS defines it (svh, 480px floor)
      const screen = probe.current?.offsetHeight || window.innerHeight || 1;
      // +1 band of slack; the container clips whatever is past the page
      setBands(Math.max(2, Math.ceil(body.scrollHeight / screen) + 1));
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
      {/* measures one screen the same way the blobs are sized */}
      <span
        ref={probe}
        className='absolute left-0 top-0 w-px opacity-0'
        style={{ height: 'var(--screen)' }}
      />
      {/* all the blobs in ONE layer, so a single opacity (BLOB_STRENGTH)
          scales them together. Same box as the container, so the blobs'
          percentage positions are unchanged. */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{ opacity: BLOB_STRENGTH }}
      >
        {Array.from({ length: bands }, (_, band) => (
          <Band key={band} band={band} />
        ))}
      </div>
      <div
        className='absolute inset-0'
        style={{ backgroundImage: GRID_LINES, backgroundSize: GRID_CELL }}
      />
    </div>
  );
}
