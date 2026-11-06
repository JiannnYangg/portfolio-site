'use client';

import { useEffect, useRef } from 'react';

/**
 * Delay for an endless animation that is paused while it is off screen.
 *
 * The first run keeps its intended start delay (it is part of the intro
 * choreography). Every later restart, after the element scrolled back into
 * view, has no delay, so it picks up straight away instead of sitting still
 * for the intro delay again.
 *
 * @param {boolean} active whether the animation is currently running
 * @param {number} firstDelay seconds to wait before the very first run
 * @returns {number} the delay (seconds) to put in the transition
 */
export function useLoopDelay(active, firstDelay) {
  const started = useRef(false);

  useEffect(() => {
    if (active) started.current = true;
  }, [active]);

  return started.current ? 0 : firstDelay;
}
