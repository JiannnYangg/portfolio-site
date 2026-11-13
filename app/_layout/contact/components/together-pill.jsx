'use client';

import { useEffect, useRef, useState } from 'react';

import styles from '../index.module.css';
import { Sparkle } from './sparkles';

/**
 * The glossy "together!" pill and its two sparkles.
 *
 * Its entrance is a timed animation (see `.pillWrap[data-reveal]` in
 * index.module.css) that starts once the pill is properly on screen and plays
 * once, at the same unhurried speed for everyone. It used to be tied to the
 * scroll position, which made it as fast as the visitor's thumb and meant
 * browsers without scroll-driven animation (Safari, Firefox) got no
 * animation at all.
 *
 * `data-reveal` goes idle (no attribute, pill fully visible) -> `pending`
 * (pill held back) -> `in` (the animation plays). The server HTML and the
 * first paint are the idle state, so with JavaScript off, a script error,
 * "reduce motion" on, or a browser without IntersectionObserver, the pill is
 * simply there and nothing can leave it hidden. The hand-over to `pending`
 * happens right after hydration, long before the footer is scrolled into
 * view, so the visitor never sees it.
 */
export function TogetherPill() {
  const ref = useRef(null);
  const [stage, setStage] = useState('idle');

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // nothing to animate, or no way to know when it is on screen: stay visible
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    setStage('pending');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setStage('in');
        observer.disconnect();
      },
      // wait until the pill is well inside the screen, not just touching its
      // bottom edge, so the visitor is looking at it when it starts
      { threshold: 0.9, rootMargin: '0px 0px -12% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={styles.pillWrap}
      data-reveal={stage === 'idle' ? undefined : stage}
    >
      <em className={styles.together}>together!</em>
      <Sparkle className={`${styles.star} ${styles.starBig}`} />
      <Sparkle className={`${styles.star} ${styles.starSmall}`} />
    </span>
  );
}
