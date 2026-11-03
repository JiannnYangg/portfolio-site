// Everything you'd want to edit lives here: the project list + all tunables.

// Based on "liquid-glass-carousel" by Yousuf Soomro (MIT) — see LICENSE-carousel.md.
//
// Panels shown in the carousel. src is relative to /public. The aspect is set
// explicitly (width / height of the file) so the row lays out correctly before
// any image has loaded; leave it null to auto-measure instead. All panels are
// PANEL_H tall and get their width from the aspect ratio, so nothing is
// cropped or stretched.
//
// These are neutral placeholders (public/showcase/*.svg). To show real work,
// drop your images into public/showcase/ and edit this list.
export const PROJECTS = [
  {
    src: '/showcase/01.svg',
    aspect: 1.25,
    brand: 'Content Strategy',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/02.svg',
    aspect: 0.8,
    brand: 'Brand Storytelling',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/03.svg',
    aspect: 1.6,
    brand: 'Short-form Reels',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/04.svg',
    aspect: 0.75,
    brand: 'SEO & GEO',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/05.svg',
    aspect: 1.3306,
    brand: 'Google Ads',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/06.svg',
    aspect: 1.0,
    brand: 'Funnels',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/07.svg',
    aspect: 0.8,
    brand: 'Lead Gen',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/08.svg',
    aspect: 1.5,
    brand: 'GA4 Dashboards',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/09.svg',
    aspect: 1.25,
    brand: 'Marketing Automation',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/10.svg',
    aspect: 0.9,
    brand: 'GraphRAG',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/11.svg',
    aspect: 1.7806,
    brand: 'Agentic Workflows',
    desc: 'Case study coming soon',
  },
  {
    src: '/showcase/12.svg',
    aspect: 1.1,
    brand: 'Evals',
    desc: 'Case study coming soon',
  },
];

// Layout + scroll feel. Wheel and drag both move a target, the scroll lerps
// after it. Once input has been idle for SNAP_IDLE_MS the target is redirected
// onto the nearest panel center, so the row always settles on an image.
export const CONFIG = {
  PANEL_H: 450, // px height — same for every panel
  GAP: 12, // px gap between panels
  EASE: 0.09, // lerp toward target (lower = heavier / more glide)
  WHEEL: 1.4, // wheel sensitivity
  DRAG: 1.6, // mouse drag sensitivity
  FRICTION: 0.865, // flick momentum decay after a drag release
  SNAP: true, // settle onto the nearest panel center
  // ms of idle input before snap engages. Distance/velocity gating used to
  // trigger inconsistently (fast flicks vs slow scrolls behaved completely
  // differently) — idle time means the same thing regardless of speed.
  SNAP_IDLE_MS: 120,
  // lerp for the glide onto the snapped panel — slower than EASE so the
  // final settle reads as a soft landing, not a speed-up.
  SNAP_EASE: 0.05,
  SHRINK_MAX: 60, // scroll speed (px/frame) that = full 25% shrink
  SHRINK_ATTACK: 0.25, // how fast panels shrink when speeding up
  SHRINK_DECAY: 0.06, // how fast they grow back when settling
};

// Interaction modes — both toggleable live from the GUI.
//   drag    : click/touch and pull the row sideways. Swaps the cursor to
//             grab / grabbing over the carousel instead of the pointer hand.
//   noClick : kill click-to-focus entirely, for when you only want to browse.
// Invariant: noClick implies drag (there'd be nothing left to do with the
// mouse otherwise), and turning drag off releases noClick.
export const INTERACT = {
  drag: true, // drag-to-scroll enabled
  noClick: false, // true = clicking a panel no longer opens focus mode
  CLICK_SLOP: 6, // px of movement before a press counts as a drag, not a click
  FLICK_IDLE_MS: 90, // if the pointer sat still this long before release, no flick
  // Touch is held to a different standard than the mouse: a finger expects
  // the row to stick to it, so touch drags run 1:1 and follow much harder
  // than the weighty wheel lerp. Fingers also wobble, so a tap gets more slop.
  TOUCH_DRAG: 1.0, // touch drag sensitivity (mouse uses CONFIG.DRAG)
  TOUCH_EASE: 0.22, // lerp toward the finger while a touch drag is live
  TOUCH_CLICK_SLOP: 12, // px of wobble still counted as a tap, not a drag
};

// The liquid-glass lens (fullscreen post-process). Ported from a hero
// explosion shader, hence some of the exotic knob names.
export const LENS = {
  shape: 'circle', // 'circle' (ellipse) | 'square' (rectangle)
  squareRound: 0, // corner rounding for rectangle (0 sharp .. 1 very round)
  rotation: 65, // static rotation in degrees
  spin: 0, // auto-spin speed (deg/sec, 0 = off)
  sizeX: 0.565, // half-width (fraction of viewport height)
  sizeY: 1, // half-height (fraction of viewport height)
  posX: 0.5, // center x in screen-UV (0 left .. 1 right)
  posY: 0.5, // center y in screen-UV (0 bottom .. 1 top)
  zoom: 0, // inward pull strength
  dispersion: 11, // chromatic dispersion
  blur: 0.0, // blur amount (px)
  glow: 4.2, // overall glow multiplier
  whiteGlow: 0.24, // central white nova intensity
  novaSize: 12, // nova size
  blueRing: 6, // blue ring intensity
  ringRadius: 0.49, // ring radius (0..0.5)
  ringWidth: 0.014, // ring width
  shimmer: true, // animated ring shimmer
  shimmerFreq: 12, // shimmer wave count around the ring
  shimmerSpeed: 3.5, // shimmer animation speed
  shimmerDepth: 0.12, // shimmer intensity (0 = none .. 0.5 = strong)
  rimStart: 0.578, // where the rim fluid wave begins
  rimTangential: 0.6, // tangential fluid-wave displacement
  rimInward: 0, // extra inward pull at the rim
  rimFreq1: 2, // fluid wave frequency 1
  rimFreq2: 1, // fluid wave frequency 2
  blueColor: '#009dff', // the soul: blue tint / ring color
  rimLine: 1.4, // bright white border line intensity (0 = off)
  rimLinePos: 0.488, // where the white border sits (0..0.5)
  rimLineWidth: 0.003, // sharpness of the white border
  vignette: 0, // overall screen vignette strength (0 = off)
  vignetteSize: 0.3, // how far in the vignette reaches
  samples: 16, // dispersion samples
};

// Focus mode: click an image -> it centers and enlarges, everything else
// sweeps down out of view, the lens distortion fades away.
export const FOCUS = {
  cardDuration: 0.7, // seconds for the OTHER cards to drop
  focusDuration: 0.9, // seconds for the MAIN card to scale into focus
  cardEase: 'power4.out',
  focusEase: 'power3.out',
  stagger: 0.06, // seconds between successive panels leaving (center-out)
  dropDist: 1.4, // how far panels drop, as a fraction of viewport height
  centerScale: 1.18, // how much the focused image grows when alone
  lensFade: 0.85, // seconds for the lens props to ramp to invisible
};

// Entry animation (auto on load): panels rise from below at a small size,
// hold, then grow to full size while the lens blooms back in.
export const ENTRY = {
  enabled: true,
  delay: 0.5, // seconds before the entry begins
  startH: 80, // px height each panel starts at
  riseDuration: 1.0, // seconds for a panel to rise into place
  stagger: 0.07, // seconds between panels rising
  riseEase: 'power3.out',
  fromBelow: 0.9, // start offset below screen, as a fraction of viewport H
  growDelay: 0.25, // seconds to wait after the rise before growing
  growDuration: 2.15, // seconds for each panel to grow to full size
  growEase: 'expo.inOut',
  growStagger: 0.085, // seconds between successive panels growing
  growDir: 'inward', // "outward" = center grows first, "inward" = edges first
  lensBloom: 1.4, // seconds for the lens effect to fade back in
  lensBloomEase: 'power2.inOut',
};

// Overlay text transitions (heading + counter), animated in the React layer.
export const UI_ANIM = {
  duration: 0.4, // seconds (focus transitions)
  ease: 'power3.out',
  topShiftVh: -5, // how far the top text moves (vh) when focused
  revealDuration: 1.6, // fade-in once the entry settles
  revealEase: 'power2.out',
  revealStagger: 0.18, // counter follows the top text by this delay
};
