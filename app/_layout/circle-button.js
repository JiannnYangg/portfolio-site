/**
 * Shared look of the round "About us" / "Works" buttons (a MagneticButton with
 * variant='ghost'), so the landing page and the About page stay identical:
 * same size, same shape, same hover colour. Change it here and both follow.
 */

/**
 * Hover fill: the same purple to magenta to pink gradient as the hero CTA
 * ("Let's talk"), with white text on top (every stop is 4.7:1 or better with
 * white). The solid purple is the fallback colour under the gradient. Both
 * hover layers (before = the growing disc, after = the final fill) get the
 * same gradient, so the colour never jumps.
 *
 * Written out as complete class names on purpose: Tailwind only generates
 * classes it can read as whole strings in the source, so these must not be
 * built by joining pieces.
 */
export const CIRCLE_HOVER =
  'before:bg-[#8a52e8] after:bg-[#8a52e8] before:[background-image:linear-gradient(135deg,#8a52e8_0%,#a14fc9_50%,#c2437f_100%)] after:[background-image:linear-gradient(135deg,#8a52e8_0%,#a14fc9_50%,#c2437f_100%)] hover:text-white';

/**
 * Shape of the circle. The default "xl" button size is padding-driven, which
 * made the box an oval. A fixed square with no padding is a true circle.
 * isolate + the radial mask make the rounded clip anti-alias cleanly while the
 * hover layers animate inside it (the usual jagged-edge fix for
 * overflow-hidden + border-radius + transforms).
 */
export const CIRCLE_SHAPE_BASE =
  'p-0 isolate will-change-transform [-webkit-mask-image:-webkit-radial-gradient(white,black)]';

/** The size of both circles: 200px */
export const CIRCLE_SIZE = 'h-[12.5rem] w-[12.5rem]';

/**
 * Keeps the circle a circle and the label on one line, wherever it is placed:
 * `shrink-0` stops a flex parent from narrowing it, `aspect-square` locks the
 * box to a square, and `[&>span]` lifts the shared magnetic button's label cap
 * (14ch with break-all), which can otherwise split a word like "Works" into
 * "Wor" / "ks".
 */
export const CIRCLE_GUARD =
  'aspect-square shrink-0 whitespace-nowrap text-center [&>span]:max-w-none [&>span]:break-normal';
