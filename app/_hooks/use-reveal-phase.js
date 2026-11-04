'use client';

import { useEffect, useState } from 'react';

import { useReducedMotion } from 'framer-motion';

/**
 * Drives a "play once when it scrolls into view" entrance from CSS.
 *
 * - `idle`  server render, no JS, reduced motion, or no IntersectionObserver:
 *           everything is simply visible, nothing animates.
 * - `armed` hydrated and still off screen: the entrance is parked at its
 *           first frame (hidden).
 * - `in`    seen once: the entrance plays. It never goes back.
 *
 * Because `idle` is the default, a visitor whose JS fails or who asked for
 * less motion never ends up with an invisible section.
 *
 * @param {import('react').MutableRefObject<HTMLElement>} ref
 * @param {{ threshold?: number }} [options]
 * @returns {'idle' | 'armed' | 'in'}
 */
export function useRevealPhase(ref, { threshold = 0.15 } = {}) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    const element = ref.current;

    if (!element || reduceMotion || !('IntersectionObserver' in window)) {
      setPhase('idle');
      return undefined;
    }

    setPhase('armed');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setPhase('in');
        observer.disconnect();
      },
      { threshold },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, reduceMotion, threshold]);

  return phase;
}
