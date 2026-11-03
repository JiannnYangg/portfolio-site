'use client';

import { useScroll, useTransform } from 'framer-motion';

/** px scrolled before the first item starts to fade */
export const SCROLL_FADE_START = 20;
/** extra px of scroll before each following item starts to fade */
export const SCROLL_FADE_STAGGER = 14;
/** px over which an item fades out completely */
export const SCROLL_FADE_DISTANCE = 260;
/** px an item drifts up while fading */
export const SCROLL_LIFT = -64;

/**
 * Scroll-linked fade + lift. Scrolling down fades and lifts items one after
 * another (lowest index first); scrolling back up brings them back, because
 * the values are derived from scroll position, not from a one-off animation.
 *
 * Spread `opacity` and `y` into a `motion.*` element's `style`.
 * `pointerEvents` turns off once the item is invisible, so a faded-out
 * button can't be clicked by accident.
 *
 * @param {number} [index] position in the reading order (0 = first)
 */
export function useScrollFade(index = 0) {
  const { scrollY } = useScroll();
  const start = SCROLL_FADE_START + index * SCROLL_FADE_STAGGER;
  const range = [start, start + SCROLL_FADE_DISTANCE];

  const opacity = useTransform(scrollY, range, [1, 0]);
  const y = useTransform(scrollY, range, [0, SCROLL_LIFT]);
  const pointerEvents = useTransform(opacity, value =>
    value < 0.05 ? 'none' : 'auto',
  );

  return { opacity, y, pointerEvents };
}
