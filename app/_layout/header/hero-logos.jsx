'use client';

import { useEffect, useRef } from 'react';

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import Image from 'next/image';

import { introDelay } from '@/data';
import { useLoopDelay } from '@/hooks';

/**
 * Timeline (seconds), continuing the headline sequence in index.jsx:
 * the header lands at 2.4s (after the 2.0s preloader), words rise 2.55s ->
 * ~4.0s, so the logos pop in right behind the words (reading order) and have
 * all settled by the time the iOS callout appears at 4.1s.
 */
const LOGOS_START = 3.0;
const LOGO_STAGGER = 0.13;

/** The soft colour blobs melt in just after the first logos pop */
const BLOBS_START = 3.2;

/** The coloured lights switch on once the logos have settled */
const LIGHTS_START = 3.9;

/** Scroll: logos fade out and drift up at different speeds (depth) */
const SCROLL_FADE_START = 30;
const SCROLL_FADE_DISTANCE = 300;

/** Mouse parallax travel in px at depth 1 */
const MOUSE_X = 16;
const MOUSE_Y = 11;

/** Mouse travel of the lights in px at shift 1 (they slide against the logos) */
const LIGHT_SHIFT = 26;

/**
 * Lighting, matched to the artwork: the key light sits top-left, so every
 * shadow falls down and to the right. Shadow tint is a deep violet so it
 * belongs to the light paper instead of looking like grey stickers.
 * Bigger depth = closer to the viewer = longer, softer shadow.
 */
const shadowFor = depth =>
  [
    `drop-shadow(${(3 * depth).toFixed(1)}px ${(5 * depth).toFixed(1)}px ${(4 * depth).toFixed(1)}px rgba(38,20,70,0.22))`,
    `drop-shadow(${(14 * depth).toFixed(1)}px ${(24 * depth).toFixed(1)}px ${(20 * depth).toFixed(1)}px rgba(38,20,70,0.16))`,
  ].join(' ');

/**
 * Gradient halos: every logo gets a soft glow behind it, drawn from the .social
 * logo's colours. Violet and pink lead; two logos start from the logo's blue
 * as a faint periwinkle, so blue stays a hint. They are indexed like LOGOS
 * (same order), and cycle if a logo is ever added.
 * Each entry is [centre colour, edge colour] as "r,g,b", plus a strength.
 *
 * HALO_STRENGTH scales every halo at once: 1 was the first version, 0.5 is
 * half as strong (the halos are now a gentle tint, not a glow).
 */
const HALO_STRENGTH = 0.5;
const HALOS = [
  { from: '160,100,232', to: '240,96,188', alpha: 0.42 }, // claude: violet -> pink
  { from: '240,96,188', to: '160,100,232', alpha: 0.4 }, // comfy: pink -> violet
  { from: '125,108,255', to: '240,96,188', alpha: 0.38 }, // squiggle: periwinkle -> pink
  { from: '160,100,232', to: '125,108,255', alpha: 0.34 }, // n8n: violet -> periwinkle
  { from: '240,96,188', to: '200,98,214', alpha: 0.34 }, // github: pink -> orchid
  { from: '200,98,214', to: '160,100,232', alpha: 0.34 }, // elevenlabs: orchid -> violet
  { from: '160,100,232', to: '240,96,188', alpha: 0.36 }, // codex: violet -> pink
  { from: '240,96,188', to: '125,108,255', alpha: 0.34 }, // runway: pink -> periwinkle
];

const haloBackground = ({ from, to, alpha }) => {
  const strength = alpha * HALO_STRENGTH;
  return `radial-gradient(closest-side, rgba(${from},${strength.toFixed(3)}) 0%, rgba(${to},${(strength * 0.55).toFixed(3)}) 55%, rgba(${to},0) 100%)`;
};

/**
 * Colour blobs: big, very soft, mesh-gradient style washes that sit behind the
 * logos in a few places only (top-left, right edge, lower-left, plus one tiny
 * one top-right). They are deliberately NOT symmetrical: different sizes,
 * different distances from the edges, different colour pairs, and the two
 * biggest ones bleed off the edge of the screen so they read as light spilling
 * in, not as circles.
 *
 * Each blob is two overlapping radial gradients ("a" and "b", offset from each
 * other) so the colour shifts inside it like a mesh gradient. The stops fall
 * off in three steps (no hard edge, no banding), and the strongest alpha is
 * 0.2, so the headline text on top stays fully readable.
 *
 * Cost: no blur filter (the gradient itself is soft), no extra images. The slow
 * drift is transform-only, runs only while the hero is on screen, and is off
 * with reduced motion. They fade out with the scroll, like the logos.
 *
 * position: Tailwind classes (mobile first, md: for desktop)
 * width   : clamp(phone, fluid vw, large screen); height follows from `aspect`
 * drift   : [x px, y px, duration s, phase s]
 */
const BLOBS = [
  {
    // top-left: the largest, violet leaning to periwinkle, behind "claude"
    id: 'top-left',
    position: '-left-[14%] -top-[9%] md:-left-[7%] md:top-[0%]',
    width: 'clamp(250px, 42vw, 760px)',
    aspect: 1.25,
    a: '160,100,232',
    b: '125,108,255',
    alpha: 0.2,
    drift: [16, 12, 24, 0],
  },
  {
    // right edge, a little below the middle: pink into violet, behind the
    // big "comfy" / "squiggle" pair
    id: 'right',
    position: '-right-[16%] top-[36%] md:-right-[8%] md:top-[33%]',
    width: 'clamp(220px, 34vw, 620px)',
    aspect: 0.95,
    a: '240,96,188',
    b: '160,100,232',
    alpha: 0.17,
    drift: [-14, 14, 29, 2.5],
  },
  {
    // lower left: orchid into periwinkle, smaller and lighter, near "github"
    id: 'bottom-left',
    position: '-bottom-[2%] -left-[8%] md:bottom-[3%] md:left-[6%]',
    width: 'clamp(200px, 26vw, 460px)',
    aspect: 1.5,
    a: '200,98,214',
    b: '125,108,255',
    alpha: 0.14,
    drift: [12, -10, 33, 5],
  },
  {
    // a small pink accent, top-right of the headline, desktop only
    id: 'top-right',
    position: 'hidden md:block md:right-[21%] md:top-[3%]',
    width: 'clamp(140px, 15vw, 280px)',
    aspect: 1.1,
    a: '240,96,188',
    b: '200,98,214',
    alpha: 0.1,
    drift: [-8, 9, 26, 7],
  },
];

const blobBackground = ({ a, b, alpha }) =>
  [
    `radial-gradient(closest-side at 38% 40%, rgba(${a},${alpha}) 0%, rgba(${a},${(alpha * 0.45).toFixed(3)}) 50%, rgba(${a},0) 100%)`,
    `radial-gradient(closest-side at 66% 62%, rgba(${b},${(alpha * 0.8).toFixed(3)}) 0%, rgba(${b},${(alpha * 0.3).toFixed(3)}) 55%, rgba(${b},0) 100%)`,
  ].join(', ');

/**
 * Coloured lights, in the logo's own violet / pink / periwinkle (the same
 * colours as the CTA, the marker and the halos). Two kinds, both drawn above
 * the logos and below the headline:
 *
 * 1. Scene lights (this list): big soft washes that fall across the hero and
 *    over some of the logos, like stage light. Uneven on purpose:
 *  - key: a long, slanted violet-to-pink streak from the top-left, the same
 *    direction as the key light and the shadows, aimed so its centre line
 *    runs through "claude".
 *  - pink-pool: a wide pool of pink in the lower right, over "squiggle" and
 *    "elevenlabs", bleeding off the edge.
 *  - periwinkle: a small cool spot at the middle left, over "n8n".
 *  - orchid: a thin tilted sliver near the top right, over "comfy" (desktop).
 *
 * 2. Logo lights (`lit` on a logo, see LOGOS): a light that lands on the logo
 *    itself. The gradient is masked with the logo's own artwork, so it paints
 *    only the logo's pixels, never the paper around it, which is what makes a
 *    logo look lit from one side. Only some logos have one.
 *
 * Each scene light is two stacked radial gradients (a main colour and a
 * warmer core pushed to one side), so the colour shifts inside it. No blur
 * filter and no blend mode (both are costly on low-spec devices).
 *
 * The hero background is already a pale violet-pink, so a pale light of the
 * same hue simply disappears into it. The alphas are therefore strong enough to
 * register (0.2 to 0.26), while the soft falloff keeps them from looking like
 * a flat overlay.
 *
 * Motion: a slow breathing scale and drift, and the scene lights slide against
 * the mouse (opposite to the logos), so the light seems to move over the
 * objects instead of being painted on them. All transform-only, running only
 * while the hero is on screen, and all off with reduced motion. They fade out
 * on scroll.
 *
 * rotate: degrees; shift: how far it follows the mouse (x LIGHT_SHIFT px)
 * drift : [x px, y px, duration s, phase s]
 */
const LIGHTS = [
  {
    id: 'key',
    position: '-left-[10%] top-[17%] md:-left-[8%] md:top-[19%]',
    width: 'clamp(300px, 60vw, 1040px)',
    aspect: 4,
    rotate: 26,
    a: '160,100,232',
    b: '240,96,188',
    alpha: 0.26,
    shift: 1,
    drift: [22, 10, 28, 0],
  },
  {
    id: 'pink-pool',
    position: '-right-[10%] bottom-[2%] md:-right-[5%] md:bottom-[5%]',
    width: 'clamp(220px, 38vw, 680px)',
    aspect: 1.15,
    rotate: 0,
    a: '240,96,188',
    b: '200,98,214',
    alpha: 0.24,
    shift: 0.7,
    drift: [-16, -12, 31, 2],
  },
  {
    id: 'periwinkle',
    position: '-left-[4%] top-[46%] md:left-[1%] md:top-[44%]',
    width: 'clamp(150px, 20vw, 360px)',
    aspect: 1.6,
    rotate: -18,
    a: '125,108,255',
    b: '160,100,232',
    alpha: 0.2,
    shift: 1.3,
    drift: [10, 14, 25, 4],
  },
  {
    id: 'orchid',
    position: 'hidden md:block md:right-[3%] md:top-[12%]',
    width: 'clamp(170px, 24vw, 420px)',
    aspect: 2.8,
    rotate: -20,
    a: '200,98,214',
    b: '240,96,188',
    alpha: 0.2,
    shift: 0.9,
    drift: [-10, 8, 27, 6],
  },
];

const lightBackground = ({ a, b, alpha }) =>
  [
    `radial-gradient(closest-side at 28% 50%, rgba(${b},${(alpha * 0.9).toFixed(3)}) 0%, rgba(${b},0) 100%)`,
    `radial-gradient(closest-side, rgba(${a},${alpha}) 0%, rgba(${a},${(alpha * 0.5).toFixed(3)}) 45%, rgba(${a},0) 100%)`,
  ].join(', ');

/**
 * A light that lands on one logo: a linear gradient from one side (`angle` is
 * the CSS gradient angle, so 135 = from the top-left, 225 = from the top-right
 * is 225 = from the bottom-left of the logo, and so on) fading out across the
 * logo. It is masked with the logo's own artwork in Logo, so only the logo
 * is tinted.
 */
const litBackground = ({ angle, from, to, alpha }) =>
  `linear-gradient(${angle}deg, rgba(${from},${alpha}) 0%, rgba(${to},${(alpha * 0.55).toFixed(3)}) 45%, rgba(${to},0) 80%)`;

/**
 * Hierarchy layout. Three hero logos (claude, comfy, squiggle/Higgsfield) are
 * the largest and close to the viewer; the supporting logos (n8n, github,
 * elevenlabs, codex, runway) are small and sit further back, so they add
 * texture without competing.
 * Nothing mirrors: sizes, edges and tilts all differ, but the visual weight is
 * balanced: big top-left vs big top-right, big mid-right vs small mid-left.
 *
 * The original six positions are untouched. The two newer logos fill empty
 * pockets:
 *  - codex: in the blank space to the right of the "We build it." line (the
 *    line is indented 1em and ends well before the line below it). The
 *    headline block is always centered in the hero and its line 2 sits ~51px
 *    above the hero's vertical middle, so top is calc(50% - offset). On
 *    desktop the offset is larger than the line's own centre, so the logo
 *    floats a little above the line. Nudged inwards (toward the headline) so
 *    it sits well clear of the right page guide.
 *  - runway: left side, below n8n and above GitHub, in the open space beside
 *    the "We build it." / "We get it" lines, clear of the left page guide.
 *    Smaller than the other supporting logos on desktop.
 *  - github: lower left, a little lower than before and nudged left, away
 *    from the runway logo.
 *
 * Mobile positions are the base classes, md: classes take over on desktop.
 * Everything stays in the empty bands above and below the headline and in
 * the side margins, and clear of the top nav, so nothing collides with text.
 *
 * Order matters: hero logos come first so they pop in first.
 *
 * width  : clamp(min on phones, fluid vw, max on large screens)
 * depth  : parallax strength + shadow length (big/close logos move more)
 * rotate : resting tilt in degrees
 * float  : [amplitude px, duration s, tilt deg, phase s]
 * lit    : optional light on the logo itself, see litBackground. Only four
 *          logos have one, each from a different side and in a different
 *          colour pair, so the lighting is uneven.
 */
const LOGOS = [
  {
    id: 'claude',
    src: '/hero-logos/hero-claude-4827.webp',
    width: 300,
    height: 261,
    size: 'clamp(62px, 8.4vw, 152px)', // was clamp(76px, 10.5vw, 190px)
    position: 'left-[4%] top-[14%] md:left-[7%] md:top-[15%]',
    rotate: -9,
    depth: 1.3,
    float: [10, 6.2, 1.6, 0],
    // from the top-left, violet into pink (the key light)
    lit: { angle: 135, from: '160,100,232', to: '240,96,188', alpha: 0.5 },
  },
  {
    id: 'comfy',
    src: '/hero-logos/hero-comfy-9153.webp',
    width: 420,
    height: 172,
    size: 'clamp(84px, 12vw, 224px)', // was clamp(104px, 15vw, 280px)
    position: 'right-[4%] top-[21%] md:right-[8%] md:top-[24%]',
    rotate: 5,
    depth: 1.5,
    float: [12, 7.4, 1.2, 0.8],
    // from the top-right, pink into violet
    lit: { angle: 215, from: '240,96,188', to: '160,100,232', alpha: 0.42 },
  },
  {
    id: 'squiggle',
    src: '/hero-logos/hero-squiggle-1084.webp',
    width: 224,
    height: 196,
    size: 'clamp(54px, 8vw, 148px)', // was clamp(68px, 10vw, 185px)
    position:
      'bottom-[29%] right-[6%] md:bottom-auto md:right-[6%] md:top-[50%]',
    rotate: -8,
    depth: 1.25,
    float: [9, 6.6, 1.5, 2],
    // from the bottom-right, pink into orchid
    lit: { angle: 315, from: '240,96,188', to: '200,98,214', alpha: 0.46 },
  },
  {
    id: 'n8n',
    src: '/hero-logos/hero-n8n-2606.webp',
    width: 320,
    height: 200,
    size: 'clamp(48px, 6vw, 100px)',
    // lifted: was bottom-[26%] on mobile and md:top-[60%] on desktop
    position: 'bottom-[34%] left-[5%] md:bottom-auto md:left-[4%] md:top-[49%]',
    rotate: -14,
    depth: 0.7,
    float: [6, 6.8, 2, 1.6],
  },
  {
    // the new GitHub logo (octocat). Desktop: lowered (bottom 22% -> 16%) and
    // moved a bit left (left 20% -> 17%); mobile only lowered (19% -> 16%).
    // Same size, tilt and float as before.
    id: 'github',
    src: '/hero-logos/hero-gitcat-4719.webp',
    width: 190,
    height: 200,
    size: 'clamp(34px, 4.2vw, 68px)',
    position: 'bottom-[16%] left-[36%] md:bottom-[16%] md:left-[17%]',
    rotate: 7,
    depth: 0.5,
    float: [5, 5.2, 1.8, 1.1],
    // from the top, a cool periwinkle into violet
    lit: { angle: 160, from: '125,108,255', to: '160,100,232', alpha: 0.5 },
  },
  {
    id: 'elevenlabs',
    src: '/hero-logos/hero-elevenlabs-7342.webp',
    width: 240,
    height: 234,
    size: 'clamp(38px, 4.8vw, 78px)',
    position: 'bottom-[15%] right-[26%] md:bottom-[13%] md:right-[27%]',
    rotate: 11,
    depth: 0.6,
    float: [5, 5.6, 1.4, 0.4],
  },
  {
    // Codex: same size as before. Sits in the blank space after "We build it."
    // Moved inwards on desktop (right 24% -> 27%) and a bit upwards (offset
    // 84px -> 112px above the middle); mobile is unchanged.
    id: 'codex',
    src: '/hero-logos/hero-mylogo-6382.webp',
    width: 193,
    height: 200,
    size: 'clamp(34px, 4.2vw, 68px)',
    position:
      'right-[6%] top-[calc(50%_-_60px)] md:right-[27%] md:top-[calc(50%_-_112px)]',
    rotate: 8,
    depth: 0.6,
    float: [5, 5.4, 1.7, 0.9],
  },
  {
    // Runway ML: left side, below n8n, above GitHub. Desktop: smaller (max
    // 74px -> 58px), higher (bottom 41%) and a bit to the right (left 21% ->
    // 24%). Mobile is unchanged.
    id: 'runway',
    src: '/hero-logos/hero-letter-r-8156.webp',
    width: 200,
    height: 200,
    size: 'clamp(30px, 3.6vw, 58px)',
    position: 'bottom-[24%] left-[14%] md:bottom-[41%] md:left-[24%]',
    rotate: -8,
    depth: 0.55,
    float: [5, 6.1, 1.5, 1.9],
  },
];

/**
 * One soft colour blob (see BLOBS). The outer box carries the position and
 * the scroll fade, the inner one the intro fade-in and the slow drift, so the
 * two never fight over the same property.
 */
function Blob({ blob, active }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 420], [1, 0]);

  const [driftX, driftY, duration, phase] = blob.drift;
  //? the drift repeats forever: it only runs while the hero is near the
  //? screen, and only waits its intro delay the very first time
  const drifting = !reduceMotion && active;
  const introAt = introDelay(BLOBS_START);
  const driftDelay = useLoopDelay(drifting, introAt + 1.6 + phase);

  const loop = {
    duration,
    ease: 'easeInOut',
    repeat: Infinity,
    delay: driftDelay,
  };

  return (
    <motion.div
      className={`pointer-events-none absolute z-0 ${blob.position}`}
      style={{
        width: blob.width,
        aspectRatio: blob.aspect,
        ...(reduceMotion ? {} : { opacity: scrollOpacity }),
      }}
    >
      <motion.span
        aria-hidden='true'
        className='block h-full w-full rounded-full'
        style={{ backgroundImage: blobBackground(blob) }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={
          reduceMotion
            ? { opacity: 1, scale: 1 }
            : drifting
              ? {
                  opacity: 1,
                  scale: 1,
                  x: [0, driftX, 0],
                  y: [0, driftY, 0],
                }
              : { opacity: 1, scale: 1, x: 0, y: 0 }
        }
        transition={{
          opacity: { duration: 1.8, ease: 'easeOut', delay: introAt },
          scale: { duration: 2.2, ease: 'easeOut', delay: introAt },
          x: drifting ? loop : { duration: 0 },
          y: drifting ? loop : { duration: 0 },
        }}
      />
    </motion.div>
  );
}

/**
 * One coloured scene light (see LIGHTS). Three layers, so no two animations
 * fight over a property: the outer box carries the position, the scroll fade
 * and the mouse slide; the middle one the fade-in, the breathing scale and the
 * drift; the inner one the fixed tilt and the gradient.
 */
function Light({ light, mouseX, mouseY, active }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 360], [1, 0]);

  // slide against the mouse (logos travel the other way), by their own amount
  const travel = LIGHT_SHIFT * light.shift;
  const slideX = useTransform(mouseX, [-1, 1], [travel, -travel]);
  const slideY = useTransform(mouseY, [-1, 1], [travel * 0.7, -travel * 0.7]);

  const [driftX, driftY, duration, phase] = light.drift;
  //? same rule as the blobs: the loop only runs while the hero is near the
  //? screen, and only waits its intro delay the very first time
  const breathing = !reduceMotion && active;
  const introAt = introDelay(LIGHTS_START);
  const loopDelay = useLoopDelay(breathing, introAt + 1.4 + phase);

  const loop = {
    duration,
    ease: 'easeInOut',
    repeat: Infinity,
    delay: loopDelay,
  };

  return (
    <motion.div
      className={`pointer-events-none absolute z-0 ${light.position}`}
      style={{
        width: light.width,
        aspectRatio: light.aspect,
        ...(reduceMotion
          ? {}
          : { opacity: scrollOpacity, x: slideX, y: slideY }),
      }}
    >
      <motion.div
        className='h-full w-full'
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={
          reduceMotion
            ? { opacity: 1 }
            : breathing
              ? {
                  opacity: 1,
                  scale: [1, 1.07, 1],
                  x: [0, driftX, 0],
                  y: [0, driftY, 0],
                }
              : { opacity: 1, scale: 1, x: 0, y: 0 }
        }
        transition={{
          opacity: { duration: 1.6, ease: 'easeOut', delay: introAt },
          scale: breathing ? loop : { duration: 0 },
          x: breathing ? loop : { duration: 0 },
          y: breathing ? loop : { duration: 0 },
        }}
      >
        <span
          aria-hidden='true'
          className='block h-full w-full rounded-full'
          style={{
            backgroundImage: lightBackground(light),
            transform: `rotate(${light.rotate}deg)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function Logo({ logo, index, mouseX, mouseY, active }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const { depth, rotate, float } = logo;
  const [amplitude, duration, tilt, phase] = float;
  const enterDelay = introDelay(LOGOS_START) + index * LOGO_STAGGER;
  //? the idle float repeats forever: it only runs while the hero is near the
  //? screen (`active`), and only waits its intro delay the very first time
  const floating = !reduceMotion && active;
  const floatDelay = useLoopDelay(floating, enterDelay + 1 + phase);

  // scroll-linked: fade out in reading order, drift up faster when closer
  const fadeStart = SCROLL_FADE_START + index * 18;
  const fadeRange = [fadeStart, fadeStart + SCROLL_FADE_DISTANCE];
  const scrollOpacity = useTransform(scrollY, fadeRange, [1, 0]);
  const scrollLift = useTransform(
    scrollY,
    value => -value * (0.1 + depth * 0.1),
  );

  // mouse parallax, closer logos travel further
  const parallaxX = useTransform(
    mouseX,
    [-1, 1],
    [-MOUSE_X * depth, MOUSE_X * depth],
  );
  const parallaxY = useTransform(
    mouseY,
    [-1, 1],
    [-MOUSE_Y * depth, MOUSE_Y * depth],
  );
  const y = useTransform([scrollLift, parallaxY], ([lift, par]) => lift + par);

  const halo = HALOS[index % HALOS.length];

  return (
    // the outer box carries position, scroll fade and parallax, so the halo
    // and the logo move and fade together
    <motion.div
      className={`pointer-events-none absolute z-0 ${logo.position}`}
      style={{
        width: logo.size,
        ...(reduceMotion ? {} : { opacity: scrollOpacity, x: parallaxX, y }),
      }}
    >
      {/* gradient halo: sits behind the logo and is not part of the filtered
          box below, so it casts no shadow of its own. It fades in right after
          the logo has popped. */}
      <motion.span
        aria-hidden='true'
        className='absolute -inset-[42%] block rounded-full'
        style={{ backgroundImage: haloBackground(halo) }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.9,
          ease: 'easeOut',
          delay: enterDelay + 0.2,
        }}
      />

      {/* filter lives on this box so the shadow is cast in screen space: it
          keeps pointing down-right whatever the logo tilt or float is */}
      <div className='relative' style={{ filter: shadowFor(depth) }}>
        {/* intro: pop up with a soft spring, opacity eased separately so it never overshoots */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.55, y: 34 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            default: {
              type: 'spring',
              stiffness: 150,
              damping: 13,
              mass: 0.9,
              delay: enterDelay,
            },
            opacity: { duration: 0.45, delay: enterDelay },
          }}
        >
          {/* idle float: slow bob + a hair of tilt, each logo on its own beat */}
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : floating
                  ? { y: [0, -amplitude, 0], rotate: [0, tilt, 0] }
                  : { y: 0, rotate: 0 }
            }
            transition={
              floating
                ? {
                    duration,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    delay: floatDelay,
                  }
                : { duration: 0 }
            }
          >
            {/* resting tilt: spins in while it pops */}
            <motion.div
              className='relative'
              initial={reduceMotion ? false : { rotate: rotate - 16 }}
              animate={{ rotate }}
              transition={{
                type: 'spring',
                stiffness: 90,
                damping: 12,
                delay: enterDelay,
              }}
            >
              <Image
                src={logo.src}
                alt=''
                width={logo.width}
                height={logo.height}
                sizes={logo.size}
                {...(index < 4
                  ? { priority: true }
                  : { loading: 'eager', fetchPriority: 'low' })}
                draggable={false}
                className='h-auto w-full select-none'
              />

              {/* light on the logo itself: a gradient masked with the logo's
                  own artwork, so it tints only the logo's pixels (never the
                  paper around it). It sits inside the tilt box, so it turns
                  and floats with the logo, and fades in once the logo has
                  landed. */}
              {logo.lit ? (
                <motion.span
                  aria-hidden='true'
                  className='pointer-events-none absolute inset-0 block'
                  style={{
                    backgroundImage: litBackground(logo.lit),
                    WebkitMaskImage: `url(${logo.src})`,
                    maskImage: `url(${logo.src})`,
                    WebkitMaskSize: '100% 100%',
                    maskSize: '100% 100%',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                  }}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 1.2,
                    ease: 'easeOut',
                    delay: enterDelay + 0.7,
                  }}
                />
              ) : null}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Floating 3D logos scattered around the headline: over soft colour blobs,
 * and under a few coloured lights.
 */
export function HeroLogos() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const onScreen = useInView(containerRef, { margin: '200px 0px 200px 0px' });

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 55, damping: 18, mass: 0.7 });
  const mouseY = useSpring(rawY, { stiffness: 55, damping: 18, mass: 0.7 });

  useEffect(() => {
    if (reduceMotion) return undefined;

    const onMove = event => {
      if (event.pointerType !== 'mouse') return;
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduceMotion, rawX, rawY]);

  return (
    <div
      ref={containerRef}
      aria-hidden='true'
      className='pointer-events-none absolute inset-0'
    >
      {/* blobs first, so every logo is painted on top of them */}
      {BLOBS.map(blob => (
        <Blob key={blob.id} blob={blob} active={onScreen} />
      ))}

      {LOGOS.map((logo, index) => (
        <Logo
          key={logo.id}
          logo={logo}
          index={index}
          mouseX={mouseX}
          mouseY={mouseY}
          active={onScreen}
        />
      ))}

      {/* scene lights last, so they fall on top of the logos (the headline is
          a later sibling in index.jsx, so the text still sits above them) */}
      {LIGHTS.map(light => (
        <Light
          key={light.id}
          light={light}
          mouseX={mouseX}
          mouseY={mouseY}
          active={onScreen}
        />
      ))}
    </div>
  );
}
