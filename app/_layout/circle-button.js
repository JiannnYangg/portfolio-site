/**
 * Shared look of the round "About us" / "Works" buttons (a MagneticButton with
 * variant='ghost'), so the landing page and the About page stay in sync.
 */

/**
 * Hover fill: the same purple to magenta to pink gradient as the hero CTA
 * ("Let's talk"), with white text on top (every stop is 4.7:1 or better with
 * white). It replaces the flat pink with dark text, which looked unrelated to
 * the rest of the site. The solid purple is the fallback colour under the
 * gradient. Both hover layers (before = the growing disc, after = the final
 * fill) get the same gradient, so the colour never jumps.
 */
const HOVER_GRADIENT =
  '[background-image:linear-gradient(135deg,#8a52e8_0%,#a14fc9_50%,#c2437f_100%)]';

export const CIRCLE_HOVER = `before:bg-[#8a52e8] after:bg-[#8a52e8] before:${HOVER_GRADIENT} after:${HOVER_GRADIENT} hover:text-white`;

/**
 * Shape of the circle. The default "xl" button size is padding-driven, which
 * made the box an oval. A fixed square with no padding is a true circle.
 * isolate + the radial mask make the rounded clip anti-alias cleanly while the
 * hover layers animate inside it (the usual jagged-edge fix for
 * overflow-hidden + border-radius + transforms).
 */
export const CIRCLE_SHAPE_BASE =
  'p-0 isolate will-change-transform [-webkit-mask-image:-webkit-radial-gradient(white,black)]';

/** Landing page size: 200px */
export const CIRCLE_SIZE_LARGE = 'h-[12.5rem] w-[12.5rem]';

/**
 * About page size: smaller, 120px on phones growing to 144px.
 *
 * The size is set with inline style (not utility classes) and the box is
 * locked to a square, so no parent flex layout, button padding or class merge
 * can squash it into an oval. `shrink-0` keeps a flex parent from narrowing
 * it. The label is forced onto one line: the shared magnetic button caps its
 * label at 14ch with break-all, which is what split "Works" into "Wor" / "ks"
 * inside a narrow box; `[&>span]` lifts that for this button.
 */
export const CIRCLE_SMALL_STYLE = {
  width: 'clamp(7.5rem, 4rem + 8vw, 9rem)',
  height: 'clamp(7.5rem, 4rem + 8vw, 9rem)',
  aspectRatio: '1 / 1',
  padding: 0,
};

export const CIRCLE_SMALL_CLASS =
  'shrink-0 whitespace-nowrap text-center text-base [&>span]:max-w-none [&>span]:break-normal';
