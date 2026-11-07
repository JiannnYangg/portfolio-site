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
    // filter lives on the outermost element so the shadow is cast in screen
    // space: it keeps pointing down-right whatever the logo tilt or float is
    <motion.div
      className={`pointer-events-none absolute z-0 ${logo.position}`}
      style={{
        width: logo.size,
        filter: shadowFor(depth),
        ...(reduceMotion ? {} : { opacity: scrollOpacity, x: parallaxX, y }),
      }}
    >
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
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Floating 3D logos scattered around the headline */
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
