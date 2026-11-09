'use client';

import { memo, useEffect, useRef, useState } from 'react';

/**
 * Site-wide background, painted ONTO THE PAGE (it scrolls with the content).
 *
 * Art direction: an asymmetric, art-directed wash of soft blooms. Nothing
 * mirrors or repeats screen to screen. For every screen-height "band" of the
 * page the layout is generated from a fixed seed with rules, so it varies the
 * way a designer would vary it by hand:
 *   - the big bloom swaps sides from band to band (left, right, left ...)
 *   - the smaller counter-bloom sits on the opposite side, tilted the other way
 *   - an elongated accent drifts near the middle on two bands out of three
 *   - a strong brand glow bleeds off one edge, alternating orange top-right / coral lower-left
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
 *   continuous and the same on every page.
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
 * opacity: 1 = as designed, 0.05 = 95% less opacity (5% visible). It is
 * applied once, to the whole blob layer (see SiteBackdrop), so every blob,
 * fold, highlight and glow is reduced by the same amount and the relative
 * balance between them stays the way it was designed. The graph-paper grid is
 * NOT affected. Valid range: 0 (no blobs) to 1.
 *
 * Preview setting: it was 0.2 before the 5% landing-page preview.
 */
const BLOB_STRENGTH = 0.05;

/** Enough bands to cover a tall first paint before the measurement runs */
const INITIAL_BANDS = 8;

/**
 * Graph-paper grid, drawn on TOP of the blooms in the brand orange so the
 * lines stay readable on both the paper and the coloured areas.
 * Alpha is low so the grid sits quietly behind the text.
 */
const GRID_COLOR = '226,74,40';
const GRID_ALPHA = 0.075;
const GRID_CELL = '62px 57px';
const GRID = [
  `linear-gradient(to right, rgba(${GRID_COLOR},${GRID_ALPHA}) 2px, transparent 2px)`,
  `linear-gradient(to bottom, rgba(${GRID_COLOR},${GRID_ALPHA}) 2px, transparent 2px)`,
].join(', ');

/**
 * Orange and grey-beige palette. The brand orange is the vermilion #e24a28.
 * The big glows use the vivid steps (glowOrange = the brand orange, top-right;
 * glowAmber = a lighter coral-orange, lower-left); the blooms are soft blush,
 * stone and sand versions of the same warm hues, so the page reads as one
 * calm wash on grey-beige paper. Nothing here leans brown: the "fold" shading
 * is a neutral warm grey, not a tan.
 */
const COLOR = {
  glowOrange: '226,74,40',
  glowAmber: '240,118,66',
  softPeach: '238,196,176',
  softBeige: '236,230,218',
  cream: '240,226,212',
  sand: '224,217,204',
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
 * The landing screen (band 0) is the ORIGINAL hero look, ported 1:1: same
 * folds, blooms, glows and intensity. Every shape is an unclipped
 * element (radii in % of the page width / screens), so a glow that touches
 * the bottom edge of the first screen keeps fading out into the next one
 * instead of being cut off by a hero edge. The layer opacities the old hero
 * used (paper 0.6, blooms 0.7) are folded into the alphas.
 */
const LANDING_PAPER = 0.6;
const LANDING_BLOOM = 0.7;
const LANDING_BLOBS = [
  // paper folds (radial)
  { cx: 30, cy: 0.22, rx: 38, ry: 0.26, rgb: COLOR.fold, a: 0.07 * LANDING_PAPER },
  { cx: 78, cy: 0.58, rx: 34, ry: 0.24, rgb: COLOR.fold, a: 0.055 * LANDING_PAPER },
  { cx: 22, cy: 0.84, rx: 40, ry: 0.22, rgb: COLOR.fold, a: 0.06 * LANDING_PAPER },
  { cx: 85, cy: 0.12, rx: 60, ry: 0.4, rgb: COLOR.white, a: 0.8 * LANDING_PAPER },
  // soft blooms
  { cx: 14, cy: 0.18, rx: 34, ry: 0.3, rgb: COLOR.softPeach, a: 0.5 * LANDING_BLOOM },
  { cx: 52, cy: 0.08, rx: 30, ry: 0.28, rgb: COLOR.softPeach, a: 0.45 * LANDING_BLOOM },
  {
    cx: 84,
    cy: 0.4,
    rx: 32,
    ry: 0.3,
    rgb: COLOR.cream,
    a: 0.4 * LANDING_BLOOM,
  },
  { cx: 40, cy: 0.62, rx: 30, ry: 0.28, rgb: COLOR.softBeige, a: 0.45 * LANDING_BLOOM },
  { cx: 70, cy: 0.9, rx: 34, ry: 0.3, rgb: COLOR.sand, a: 0.5 * LANDING_BLOOM },
  { cx: 6, cy: 0.66, rx: 28, ry: 0.26, rgb: '244,224,208', a: 0.5 * LANDING_BLOOM },
  // brand corner glows (fade out at 70% of the radius)
  { cx: 100, cy: 0, rx: 55, ry: 0.42, rgb: COLOR.glowOrange, a: 0.66, fade: 70 },
  { cx: 0, cy: 1, rx: 50, ry: 0.38, rgb: COLOR.glowAmber, a: 0.6, fade: 70 },
];

/** Diagonal paper folds of the old hero: one screen-sized layer, fully
 *  transparent well before its bottom edge, so there is no seam. The folds
 *  are a neutral warm grey (96,86,76), never a tan or brown. */
const LANDING_FOLDS = [
  'linear-gradient(118deg, rgba(0,0,0,0) 14%, rgba(96,86,76,0.06) 24%, rgba(255,255,255,0) 36%)',
  'linear-gradient(62deg, rgba(0,0,0,0) 38%, rgba(96,86,76,0.05) 48%, rgba(255,255,255,0) 60%)',
  'linear-gradient(155deg, rgba(255,255,255,0) 52%, rgba(96,86,76,0.04) 64%, rgba(255,255,255,0) 78%)',
].join(', ');

function landingStyle({ cx, cy, rx, ry, rgb, a, fade = 100 }) {
  return {
    left: `${cx}%`,
    top: `calc(var(--screen) * ${cy})`,
    width: `${rx * 2}%`,
    height: `calc(var(--screen) * ${ry * 2})`,
    transform: 'translate(-50%, -50%)',
    backgroundImage: `radial-gradient(ellipse closest-side, rgba(${rgb},${a.toFixed(3)}) 0%, rgba(${rgb},0) ${fade}%)`,
  };
}

function LandingBand() {
  return (
    <>
      <span
        className='absolute left-0 top-0 block w-full'
        style={{
          height: 'var(--screen)',
          opacity: LANDING_PAPER,
          backgroundImage: LANDING_FOLDS,
        }}
      />
      {LANDING_BLOBS.map((blob, index) => (
        <span
          key={index}
          className='absolute block'
          style={landingStyle(blob)}
        />
      ))}
    </>
  );
}

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
      rgb: pick(rand, [COLOR.softPeach, COLOR.softBeige, COLOR.softPeach]),
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
      rgb: pick(rand, [COLOR.softBeige, COLOR.sand]),
      a: between(rand, 0.3, 0.42) * power,
    });
  }

  // brand glow bleeding off an edge: orange top-right on even bands, coral lower-left on odd
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
  if (band === 0) return <LandingBand />;

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
        style={{ backgroundImage: GRID, backgroundSize: GRID_CELL }}
      />
    </div>
  );
}
