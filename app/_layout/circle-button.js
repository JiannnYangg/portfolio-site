/**
 * Shared look of the round "About us" / "Works" buttons (a MagneticButton with
 * variant='ghost'), so the landing page and the About page stay identical:
 * same size, same shape, same hover colour. Change it here and both follow.
 */

/**
 * Hover fill: a plain, warm orange with only a tiny touch of beige at the
 * start of the gradient (no pink, no brown, no dark end), with dark text on
 * top so the label stays readable. The solid orange is the fallback colour
 * under the gradient. Both hover layers (before = the growing disc, after =
 * the final fill) get the same gradient, so the colour never jumps. The menu
 * button (layout/offcanvas/components/toggle) uses the same colours.
 *
 * Written out as complete class names on purpose: Tailwind only generates
 * classes it can read as whole strings in the source, so these must not be
 * built by joining pieces.
 */
export const CIRCLE_HOVER =
  'before:bg-[#ee7a3d] after:bg-[#ee7a3d] before:[background-image:linear-gradient(135deg,#f3ad7e_0%,#ee7a3d_55%,#ec732f_100%)] after:[background-image:linear-gradient(135deg,#f3ad7e_0%,#ee7a3d_55%,#ec732f_100%)] hover:text-[#1f1b18]';

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
