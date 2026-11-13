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

/** Scroll: logos fade out and drift up at different speeds (depth) */
const SCROLL_FADE_START = 30;
const SCROLL_FADE_DISTANCE = 300;

/** Mouse parallax travel in px at depth 1 */
const MOUSE_X = 16;
const MOUSE_Y = 11;

/**
 * How strong the logo drop shadows are, as a share of their designed opacity:
 * 1 = as designed, 0.2 = 80% less opacity. Only the shadow colour's alpha is
 * scaled; the shadow's offset and blur (its shape and length) are unchanged.
 * Valid range: 0 (no shadow) to 1.
 */
const SHADOW_STRENGTH = 0.2;

/**
 * The landing screen carries no colour blobs, scene lights, glow halos or
 * lights on the logos any more: only the logos themselves, over plain paper.
 * (The site-wide background starts its very light wash below the landing
 * screen, see components/backdrop.)
 */

/**
 * Lighting, matched to the artwork: the key light sits top-left, so every
 * shadow falls down and to the right. Shadow tint is a deep warm brown so it
 * belongs to the beige paper instead of looking like grey stickers.
 * Bigger depth = closer to the viewer = longer, softer shadow.
 * The designed alphas are 0.22 (tight contact shadow) and 0.16 (long soft
 * one); both are multiplied by SHADOW_STRENGTH.
 */
const shadowFor = depth =>
  [
    `drop-shadow(${(3 * depth).toFixed(1)}px ${(5 * depth).toFixed(1)}px ${(4 * depth).toFixed(1)}px rgba(90,40,10,${(0.22 * SHADOW_STRENGTH).toFixed(3)}))`,
    `drop-shadow(${(14 * depth).toFixed(1)}px ${(24 * depth).toFixed(1)}px ${(20 * depth).toFixed(1)}px rgba(90,40,10,${(0.16 * SHADOW_STRENGTH).toFixed(3)}))`,
  ].join(' ');

/**
 * Hierarchy layout. Three hero logos (claude, comfy, squiggle/Higgsfield) are
 * the largest and close to the viewer; the supporting logos (n8n, github,
 * elevenlabs, codex, runway) are small and sit further back, so they add
 * texture without competing.
 * Nothing mirrors: sizes, edges and tilts all differ, but the visual weight is
 * balanced.
 *
 * TWO ARRANGEMENTS, picked with the `wide:` variant (tailwind plugin): a
 * tablet or desktop, or a phone held sideways, uses the original scatter in
 * percentages of the hero (the `wide:` classes below, unchanged from before).
 * A phone held upright uses the base classes:
 *
 *  - The headline + CTA block is centred in the hero, and globals.css
 *    (.hero-scope) works out its top and bottom edge as --hero-top and
 *    --hero-bottom from the headline size, gap and padding. On a phone the
 *    logos are placed against those two edges, not against percentages of the
 *    screen, so they can never land on the text whatever the screen height.
 *  - 3 above, 3 beside, 2 below, so the weight is spread over the whole
 *    screen and the area under the CTA is not a pile of logos. The sides are
 *    the blank pockets next to the headline lines (the lines are left
 *    aligned, so the left pocket is a thin strip at every line and the right
 *    one is wide beside line 2); each logo is centred on its line, using the
 *    line's middle (line 1 = 0.54, line 2 = 1.62, line 3 = 2.7 headline
 *    sizes below the block top). Nothing mirrors:
 *      above the headline  claude (top left, the biggest), n8n (a little
 *                          right of centre, lower), comfy (right, sitting
 *                          just above the headline's selection callout)
 *      beside line 1       runway, in the left pocket
 *      beside line 2       codex, in the right pocket after "We build it."
 *      beside line 3       elevenlabs, in the left pocket
 *      below the CTA       squiggle (right, the big one) and github (left
 *                          of centre, lower). --hero-top-room /
 *                          --hero-travel are the spare height of the top /
 *                          bottom band (0 on the shortest phones, where the
 *                          logos stay side by side); each logo takes its own
 *                          share of it.
 *  - Sizes are clamps of the smaller of screen width and screen height
 *    (min(vw, svh)): bigger on a tall phone that has room, smaller on a short
 *    one so the logos never crowd the text.
 *
 * Order matters: hero logos come first so they pop in first.
 *
 * size   : Tailwind width classes: phone clamp, then the `wide:` desktop clamp
 * imgSizes: the matching `sizes` hint for the image, so a phone downloads a
 *          small file
 * position: Tailwind placement classes: phone arrangement, then `wide:`
 * depth  : parallax strength + shadow length (big/close logos move more)
 * rotate : resting tilt in degrees
 * float  : [amplitude px, duration s, tilt deg, phase s]
 */
const LOGOS = [
  {
    id: 'claude',
    src: '/hero-logos/hero-claude-4827.webp',
    width: 300,
    height: 261,
    size: 'w-[clamp(48px,min(19vw,8.5svh),84px)] wide:w-[clamp(62px,8.4vw,152px)]',
    imgSizes: '(min-width: 768px) 152px, 84px',
    position:
      'left-[5%] top-[calc(var(--band)_+_22px_+_var(--hero-top-room)_*_0.1)] wide:left-[7%] wide:top-[max(15%,calc(var(--band)_+_20px))]',
    rotate: -9,
    depth: 1.3,
    float: [10, 6.2, 1.6, 0],
  },
  {
    id: 'comfy',
    src: '/hero-logos/hero-comfy-9153.webp',
    width: 420,
    height: 172,
    size: 'w-[clamp(64px,min(26vw,14svh),118px)] wide:w-[clamp(84px,12vw,224px)]',
    imgSizes: '(min-width: 768px) 224px, 118px',
    position:
      'right-[5%] bottom-[calc(100%_-_var(--hero-top)_+_62px)] wide:bottom-auto wide:right-[8%] wide:top-[24%]',
    rotate: 5,
    depth: 1.5,
    float: [12, 7.4, 1.2, 0.8],
  },
  {
    id: 'squiggle',
    src: '/hero-logos/hero-squiggle-1084.webp',
    width: 224,
    height: 196,
    size: 'w-[clamp(48px,min(19vw,9.5svh),84px)] wide:w-[clamp(54px,8vw,148px)]',
    imgSizes: '(min-width: 768px) 148px, 84px',
    position:
      'right-[6%] top-[calc(var(--hero-bottom)_+_16px_+_var(--hero-travel)_*_0.3)] wide:right-[6%] wide:top-[50%]',
    rotate: -8,
    depth: 1.25,
    float: [9, 6.6, 1.5, 2],
  },
  {
    id: 'n8n',
    src: '/hero-logos/hero-n8n-2606.webp',
    width: 320,
    height: 200,
    size: 'w-[clamp(40px,min(14vw,7.5svh),66px)] wide:w-[clamp(48px,6vw,100px)]',
    imgSizes: '(min-width: 768px) 100px, 66px',
    position:
      'left-[44%] top-[calc(var(--band)_+_16px_+_var(--hero-top-room)_*_0.55)] wide:left-[4%] wide:top-[49%]',
    rotate: -14,
    depth: 0.7,
    float: [6, 6.8, 2, 1.6],
  },
  {
    // the new GitHub logo (octocat). Wide: lowered (bottom 22% -> 16%) and
    // moved a bit left (left 20% -> 17%). Same size, tilt and float as before.
    id: 'github',
    src: '/hero-logos/hero-gitcat-4719.webp',
    width: 190,
    height: 200,
    size: 'w-[clamp(34px,min(13vw,6.8svh),58px)] wide:w-[clamp(34px,4.2vw,68px)]',
    imgSizes: '(min-width: 768px) 68px, 58px',
    position:
      'left-[34%] top-[calc(var(--hero-bottom)_+_16px_+_var(--hero-travel)_*_0.85)] wide:top-auto wide:bottom-[16%] wide:left-[17%]',
    rotate: 7,
    depth: 0.5,
    float: [5, 5.2, 1.8, 1.1],
  },
  {
    id: 'elevenlabs',
    src: '/hero-logos/hero-elevenlabs-7342.webp',
    width: 240,
    height: 234,
    size: 'w-[clamp(26px,min(8.5vw,5.5svh),36px)] wide:w-[clamp(38px,4.8vw,78px)]',
    imgSizes: '(min-width: 768px) 78px, 36px',
    position:
      'left-[3%] top-[calc(var(--hero-top)_+_var(--hero-fs)_*_2.7_+_3px)] wide:left-auto wide:top-auto wide:bottom-[13%] wide:right-[27%]',
    rotate: 11,
    depth: 0.6,
    float: [5, 5.6, 1.4, 0.4],
  },
  {
    // Codex: sits in the blank space after "We build it." (line 2 of the
    // headline). On a phone it is centred on that line: the line's middle is
    // the block top + 1.5 lines (1.5 * 1.08 = 1.62 headline sizes).
    id: 'codex',
    src: '/hero-logos/hero-mylogo-6382.webp',
    width: 193,
    height: 200,
    size: 'w-[clamp(32px,10vw,46px)] wide:w-[clamp(34px,4.2vw,68px)]',
    imgSizes: '(min-width: 768px) 68px, 46px',
    position:
      'right-[11%] top-[calc(var(--hero-top)_+_var(--hero-fs)_*_1.62_-_20px)] wide:right-[27%] wide:top-[calc(50%_-_112px)]',
    rotate: 8,
    depth: 0.6,
    float: [5, 5.4, 1.7, 0.9],
  },
  {
    // Runway ML: left side, below n8n, above GitHub (wide: smaller, higher).
    id: 'runway',
    src: '/hero-logos/hero-letter-r-8156.webp',
    width: 200,
    height: 200,
    size: 'w-[clamp(26px,min(8vw,5.5svh),34px)] wide:w-[clamp(30px,3.6vw,58px)]',
    imgSizes: '(min-width: 768px) 58px, 34px',
    position:
      'left-[2%] top-[calc(var(--hero-top)_+_var(--hero-fs)_*_0.54_-_30px)] wide:top-auto wide:bottom-[41%] wide:left-[24%]',
    rotate: -8,
    depth: 0.55,
    float: [5, 6.1, 1.5, 1.9],
  },
];

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

  return (
    // the outer box carries position, scroll fade and parallax
    <motion.div
      className={`pointer-events-none absolute z-0 ${logo.size} ${logo.position}`}
      style={
        reduceMotion ? undefined : { opacity: scrollOpacity, x: parallaxX, y }
      }
    >
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
                sizes={logo.imgSizes}
                {...(index < 4
                  ? { priority: true }
                  : { loading: 'eager', fetchPriority: 'low' })}
                draggable={false}
                className='h-auto w-full select-none'
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Floating 3D logos scattered around the headline, over plain paper.
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
    </div>
  );
}
