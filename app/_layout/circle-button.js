/**
 * Shared look of the round "About us" / "Works" buttons (a MagneticButton with
 * variant='ghost'), so the landing page and the About page stay in sync.
 */

/**
 * Hover colour of the circle: the brand pink (the end of the logo's gradient)
 * with dark text on top (about 6:1), instead of the default fill.
 */
export const CIRCLE_HOVER =
  'before:bg-[#f0546b] after:bg-[#f0546b] hover:text-[#1f2024]';

/**
 * Shape of the circle. The default "xl" button size is padding-driven, which
 * made the box ~204x184px (an oval). A fixed square with no padding is a true
 * circle. isolate + the radial mask make the rounded clip anti-alias cleanly
 * while the hover layers animate inside it (the usual jagged-edge fix for
 * overflow-hidden + border-radius + transforms).
 */
export const CIRCLE_SHAPE_BASE =
  'p-0 isolate will-change-transform [-webkit-mask-image:-webkit-radial-gradient(white,black)]';

/** Landing page size: 200px */
export const CIRCLE_SIZE_LARGE = 'h-[12.5rem] w-[12.5rem]';

/** About page size: smaller (120px on phones, 144px from `sm` up) */
export const CIRCLE_SIZE_SMALL =
  'h-[7.5rem] w-[7.5rem] text-base sm:h-[9rem] sm:w-[9rem]';
