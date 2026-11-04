/** Where "Get in touch" and the copy button point. */
export const EMAIL = 'satyamgupta.social@gmail.com';

/**
 * Glass-tile field (see index.module.css for the breakpoints).
 * The field is rendered once at its biggest size; each breakpoint shows the
 * top-left `--ft-cols` x `--ft-rows` part of it and the rest is clipped.
 */
export const MAX_COLS = 22;
export const MAX_ROWS = 13;

/**
 * How many tiles are missing at the top of each column. This is what draws
 * the stepped skyline: neighbours differ by at most one step, so the edge
 * reads as a staircase and never as noise. Fixed values (no randomness), so
 * the server and the browser render the same markup.
 */
export const STAIR = [
  0, 0, 1, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 1, 0, 1, 1, 2, 2, 1, 1, 2,
];
