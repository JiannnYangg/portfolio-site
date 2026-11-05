'use client';

import { useEffect } from 'react';

import Lenis from '@studio-freight/lenis';

/** The live smooth-scroll instance (null before mount / after unmount) */
let instance = null;

/**
 * Lets other code (the showcase scroll lock) pause or steer the smooth
 * scroller without owning it. Returns null when it is not running.
 */
export function getLenis() {
  return instance;
}

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis();
    instance = lenis;

    //? The old cleanup cancelled the wrong thing (the function, not the frame
    //? id) and never destroyed Lenis, so the loop and its listeners lived on
    //? after unmount. Track the frame id and destroy the instance properly.
    let frameId = 0;
    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      if (instance === lenis) instance = null;
    };
  }, []);
}
