'use client';

import { useEffect, useRef, useState } from 'react';

import { motion, useReducedMotion, useSpring } from 'framer-motion';

/**
 * Smooth cursor, based on Magic UI's <SmoothCursor /> (MIT,
 * magicui.design/docs/components/smooth-cursor), ported to this project
 * (JS, framer-motion) and made a little smoother:
 *
 * - spring-driven position, with rotation toward the direction of travel and
 *   a small press-in scale while moving (same physics as the original)
 * - pointer events are batched into ONE update per animation frame using the
 *   LATEST position (the original handled the first event of the frame and
 *   dropped the newer ones, which reads as tiny stutters on fast mice)
 * - the first move after load / after re-entering the window snaps to the
 *   pointer instead of flying in from the top-left corner
 * - hides when the pointer leaves the window
 * - reduced motion: no lag, rotation or scale, the cursor just follows
 * - desktop only: needs a hover-capable fine pointer, so touch devices keep
 *   their normal behaviour and never see a stray cursor after a tap
 * - the native cursor is hidden only while this component is running, so if
 *   anything fails the visitor still has a normal cursor
 */

const DESKTOP_POINTER_QUERY = '(any-hover: hover) and (any-pointer: fine)';
const HIDE_CLASS = 'has-smooth-cursor';

/** Hides the native cursor everywhere (buttons, links, ...), but keeps the
 *  text caret over editable fields. */
const HIDE_NATIVE_CURSOR_CSS = `
html.${HIDE_CLASS},
html.${HIDE_CLASS} * { cursor: none !important; }
html.${HIDE_CLASS} :is(input, textarea, select, [contenteditable='true']) {
  cursor: text !important;
}
`;

export const DEFAULT_SPRING = {
  damping: 45,
  stiffness: 400,
  mass: 1,
  restDelta: 0.001,
};

/** Movement faster than this (px per ms) counts as "moving" */
const MOVE_SPEED = 0.1;
/** ms after the last movement before the cursor relaxes back to full size */
const SETTLE_MS = 150;

function DefaultCursor() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={50}
      height={54}
      viewBox='0 0 50 54'
      fill='none'
      style={{ scale: 0.5 }}
      aria-hidden='true'
    >
      <g filter='url(#smooth-cursor-shadow)'>
        <path
          d='M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z'
          fill='black'
        />
        <path
          d='M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z'
          stroke='white'
          strokeWidth={2.25825}
        />
      </g>
      <defs>
        <filter
          id='smooth-cursor-shadow'
          x={0.602397}
          y={0.952444}
          width={49.0584}
          height={52.428}
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity={0} result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy={2.25825} />
          <feGaussianBlur stdDeviation={2.25825} />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'
          />
          <feBlend
            mode='normal'
            in2='BackgroundImageFix'
            result='effect1_dropShadow'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow'
            result='shape'
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * @param {{
 *   cursor?: import('react').ReactNode,
 *   springConfig?: { damping: number, stiffness: number, mass: number, restDelta: number }
 * }} props
 */
export function SmoothCursor({
  cursor = <DefaultCursor />,
  springConfig = DEFAULT_SPRING,
}) {
  const reduceMotion = useReducedMotion();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const last = useRef({ x: 0, y: 0, time: 0 });
  const hasPosition = useRef(false); // false until the first move (and after leaving)
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, { ...springConfig, damping: 60, stiffness: 300 });
  const scale = useSpring(1, { ...springConfig, stiffness: 500, damping: 35 });

  // desktop-class pointers only (follows the device if a mouse is plugged in)
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_POINTER_QUERY);
    const update = () => {
      setIsEnabled(query.matches);
      if (!query.matches) setIsVisible(false);
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isEnabled) return undefined;

    let settleTimer = null;
    let rafId = 0;
    /** newest pointer position not yet applied */
    let pending = null;

    const apply = ({ x, y }) => {
      const now = performance.now();

      // first move: snap to the pointer, don't fly in from the corner
      if (!hasPosition.current) {
        hasPosition.current = true;
        last.current = { x, y, time: now };
        cursorX.jump(x);
        cursorY.jump(y);
        setIsVisible(true);
        return;
      }

      setIsVisible(true);

      if (reduceMotion) {
        // no lag, rotation or scale
        last.current = { x, y, time: now };
        cursorX.jump(x);
        cursorY.jump(y);
        return;
      }

      const dt = now - last.current.time;
      const vx = dt > 0 ? (x - last.current.x) / dt : 0;
      const vy = dt > 0 ? (y - last.current.y) / dt : 0;
      last.current = { x, y, time: now };

      cursorX.set(x);
      cursorY.set(y);

      if (Math.hypot(vx, vy) > MOVE_SPEED) {
        const angle = Math.atan2(vy, vx) * (180 / Math.PI) + 90;

        // take the short way round, and keep accumulating so the spring never
        // spins back through 360 degrees
        let diff = angle - previousAngle.current;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        accumulatedRotation.current += diff;
        rotation.set(accumulatedRotation.current);
        previousAngle.current = angle;

        scale.set(0.95);
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => scale.set(1), SETTLE_MS);
      }
    };

    const onPointerMove = event => {
      if (event.pointerType === 'touch') return;
      // always keep the newest position; one update per frame
      pending = { x: event.clientX, y: event.clientY };
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (pending) apply(pending);
        pending = null;
      });
    };

    const onLeave = () => {
      setIsVisible(false);
      hasPosition.current = false; // re-snap when the pointer comes back
      pending = null;
    };

    document.documentElement.classList.add(HIDE_CLASS);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      document.documentElement.classList.remove(HIDE_CLASS);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(settleTimer);
    };
  }, [cursorX, cursorY, rotation, scale, isEnabled, reduceMotion]);

  if (!isEnabled) return null;

  return (
    <>
      <style>{HIDE_NATIVE_CURSOR_CSS}</style>
      <motion.div
        aria-hidden='true'
        style={{
          position: 'fixed',
          left: cursorX,
          top: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          rotate: rotation,
          scale,
          zIndex: 100,
          pointerEvents: 'none',
          willChange: 'transform',
        }}
        initial={false}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        {cursor}
      </motion.div>
    </>
  );
}
