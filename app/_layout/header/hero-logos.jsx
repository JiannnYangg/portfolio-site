'use client';

import { useEffect } from 'react';

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import Image from 'next/image';

/**
 * Timeline (seconds), continuing the headline sequence in index.jsx:
 * the header lands at 2.5s, words rise 2.65s -> ~4.1s, so the logos pop in
 * right behind the words (reading order) and have all settled by the time
 * the iOS callout appears at 4.2s.
 */
const LOGOS_START = 3.1;
const LOGO_STAGGER = 0.13;

/** Scroll: logos fade out and drift up at different speeds (depth) */
const SCROLL_FADE_START = 30;
const SCROLL_FADE_DISTANCE = 300;

/** Mouse parallax travel in px at depth 1 */
const MOUSE_X = 16;
const MOUSE_Y = 11;

/**
 * Lighting, matched to the artwork: the key light sits top-left, so every
 * shadow falls down and to the right. Shadow tint is a dark olive so it
 * belongs to the lime paper instead of looking like grey stickers.
 * Bigger depth = closer to the viewer = longer, softer shadow.
 */
const shadowFor = depth =>
  [
    `drop-shadow(${(3 * depth).toFixed(1)}px ${(5 * depth).toFixed(1)}px ${(4 * depth).toFixed(1)}px rgba(34,48,0,0.22))`,
    `drop-shadow(${(14 * depth).toFixed(1)}px ${(24 * depth).toFixed(1)}px ${(20 * depth).toFixed(1)}px rgba(34,48,0,0.16))`,
  ].join(' ');

/**
 * Asymmetric layout. Nothing mirrors: sizes, edges and tilts all differ.
 * Mobile positions are the base classes, md: classes take over on desktop.
 * Everything stays in the empty bands above and below the headline and in
 * the side margins, so the text never collides with a logo.
 *
 * width  : clamp(min on phones, fluid vw, max on large screens)
 * depth  : parallax strength + shadow length (big/close logos move more)
 * rotate : resting tilt in degrees
 * float  : [amplitude px, duration s, tilt deg, phase s]
 */
const LOGOS = [
  {
    id: 'claude',
    src: '/hero-logos/hero-claude-4827.png',
    width: 300,
    height: 261,
    size: 'clamp(64px, 9vw, 150px)',
    position: 'left-[5%] top-[15%] md:left-[8%] md:top-[14%]',
    rotate: -9,
    depth: 1.1,
    float: [9, 6.2, 1.6, 0],
  },
  {
    id: 'comfy',
    src: '/hero-logos/hero-comfy-9153.png',
    width: 420,
    height: 172,
    size: 'clamp(92px, 13vw, 210px)',
    position: 'right-[5%] top-[21%] md:right-[7%] md:top-[12%]',
    rotate: 5,
    depth: 1.35,
    float: [11, 7.4, 1.2, 0.8],
  },
  {
    id: 'n8n',
    src: '/hero-logos/hero-n8n-2606.png',
    width: 320,
    height: 200,
    size: 'clamp(70px, 10vw, 160px)',
    position: 'bottom-[27%] left-[5%] md:bottom-auto md:left-[3%] md:top-[56%]',
    rotate: -14,
    depth: 1.2,
    float: [10, 6.8, 2, 1.6],
  },
  {
    id: 'elevenlabs',
    src: '/hero-logos/hero-elevenlabs-7342.png',
    width: 240,
    height: 234,
    size: 'clamp(54px, 7.5vw, 120px)',
    position:
      'bottom-[31%] right-[7%] md:bottom-auto md:right-[4%] md:top-[47%]',
    rotate: 11,
    depth: 0.85,
    float: [7, 5.6, 1.4, 0.4],
  },
  {
    id: 'github',
    src: '/hero-logos/hero-github-5918.png',
    width: 176,
    height: 173,
    size: 'clamp(44px, 5.5vw, 88px)',
    position: 'bottom-[20%] left-[34%] md:bottom-[19%] md:left-[22%]',
    rotate: 7,
    depth: 0.65,
    float: [6, 5.2, 1.8, 1.1],
  },
  {
    id: 'squiggle',
    src: '/hero-logos/hero-squiggle-1084.png',
    width: 224,
    height: 196,
    size: 'clamp(56px, 7vw, 112px)',
    position: 'bottom-[16%] right-[24%] md:bottom-[14%] md:right-[21%]',
    rotate: -8,
    depth: 0.95,
    float: [8, 6.6, 1.5, 2],
  },
];

function Logo({ logo, index, mouseX, mouseY }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const { depth, rotate, float } = logo;
  const [amplitude, duration, tilt, phase] = float;
  const enterDelay = LOGOS_START + index * LOGO_STAGGER;

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
              : { y: [0, -amplitude, 0], rotate: [0, tilt, 0] }
          }
          transition={{
            duration,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: enterDelay + 1 + phase,
          }}
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
              priority
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
    <div aria-hidden='true' className='pointer-events-none absolute inset-0'>
      {LOGOS.map((logo, index) => (
        <Logo
          key={logo.id}
          logo={logo}
          index={index}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}
    </div>
  );
}
