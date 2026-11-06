/**
 * Intro (preloader + hero reveal) timing and the "already seen" memory.
 *
 * Every intro-bound animation in the site (hero headline, logos, navbar line,
 * logo shine, page heroes) is written as an absolute time in seconds on the
 * FIRST-VISIT timeline: the 2.0 s preloader plays, then the hero lands. When
 * the preloader is skipped those same times are all moved earlier by the same
 * amount (INTRO_LEAD_S), so the hero plays exactly the same sequence with the
 * same spacing, just without the empty wait in front of it.
 *
 * Wrap a first-visit time in `introDelay()` at the place where it is used.
 *
 * When is the intro skipped?
 * - the visitor has already seen it in this browser tab (sessionStorage), if
 *   INTRO_ONCE_PER_SESSION is on. A new tab or a new session plays it again.
 * - the visitor asked for reduced motion.
 * If sessionStorage is unavailable (private modes, blocked storage) nothing
 * is remembered and the intro simply plays, as it always did.
 */

/** Play the intro once per tab session. Set to false to play it on every load. */
export const INTRO_ONCE_PER_SESSION = true;

/** sessionStorage key that remembers the intro has played */
export const INTRO_STORAGE_KEY = 'intro-seen';

/**
 * Seconds by which the hero timeline moves earlier when the preloader is
 * skipped. It must not be larger than the EARLIEST intro-bound time (the
 * navbar line at 2.1 s), so nothing is ever pushed before the start and the
 * order and spacing of the sequence stay identical.
 */
export const INTRO_LEAD_S = 2.1;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Set once per page mount by `resolveIntro` (always false on the server) */
let skipped = false;

function prefersReducedMotion() {
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  } catch {
    return false;
  }
}

function hasSeenIntro() {
  if (!INTRO_ONCE_PER_SESSION) return false;
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Should the preloader be skipped for this visitor right now? (client only) */
export function shouldSkipIntro() {
  if (typeof window === 'undefined') return false;
  return hasSeenIntro() || prefersReducedMotion();
}

/**
 * Decides, once per page mount, whether the intro is skipped and remembers it
 * for `introDelay`. Call it before any intro-bound child renders (the
 * Transition wrapper does, through a lazy state initialiser).
 * @returns {boolean} true when the intro is skipped
 */
export function resolveIntro() {
  skipped = shouldSkipIntro();
  return skipped;
}

/** Remembers that the intro has played in this tab. Never throws. */
export function markIntroSeen() {
  if (!INTRO_ONCE_PER_SESSION) return;
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
  } catch {
    // storage unavailable: the intro will just play again next time
  }
}

/**
 * Moves a first-visit time (seconds) earlier when the intro is skipped.
 * @param {number} seconds time on the first-visit timeline
 * @returns {number} the delay to use now, never negative
 */
export function introDelay(seconds) {
  return skipped ? Math.max(0, seconds - INTRO_LEAD_S) : seconds;
}

/**
 * Tiny script for <head>: runs before the first paint and marks <html> with
 * data-intro="skip" when the intro will be skipped, so the preloader overlay
 * in the server HTML is hidden by CSS (globals.css) instead of flashing until
 * the page's JavaScript has loaded. Mirrors `shouldSkipIntro`; it must never
 * throw, a failure just means the overlay is hidden a moment later by React.
 */
export const INTRO_SKIP_SCRIPT = `(function(){try{var s=false;${
  INTRO_ONCE_PER_SESSION
    ? `try{s=window.sessionStorage.getItem('${INTRO_STORAGE_KEY}')==='1'}catch(e){}`
    : ''
}if(!s){try{s=window.matchMedia('${REDUCED_MOTION_QUERY}').matches}catch(e){}}if(s)document.documentElement.setAttribute('data-intro','skip')}catch(e){}})();`;
