import { getLenis } from './use-lenis';

/*
 * Programmatic page scrolling for navigation: the logo, the top-right links,
 * the side menu, the hero button, "Back to top" and links like /#contact-footer
 * that are followed once a page has loaded.
 *
 * Everything goes through ONE scroller (the same Lenis the wheel uses), so
 * there is one feel everywhere instead of the browser's own smooth scroll
 * fighting Lenis. It is built to survive the awkward moments:
 *
 * - The showcase holds the page still while its cards come in. A navigation
 *   click first tells it to let go (NAV_SCROLL_START), otherwise the click
 *   would do nothing, or leave the page stuck at the destination with the
 *   wheel blocked.
 * - While a navigation is in progress the showcase must not take the page over
 *   as the scroll passes through it (isNavScrolling), or "Contact" would end
 *   up stopped halfway, at the cards. It is told when the scroll ends
 *   (NAV_SCROLL_END) and then checks where the visitor actually is.
 * - Layout can still move while the page scrolls (the showcase swaps from its
 *   placeholder to the pinned stage, fonts load, images arrive). When the
 *   scroll ends the target is measured again and the scroll is corrected, a
 *   few times at most.
 * - The visitor is always in charge: touching the screen or pressing a scroll
 *   key stops the scroll on the spot, and so does the wheel (after a short
 *   moment in which trackpad momentum left over from before the click is
 *   ignored, otherwise it would cancel the click straight away).
 * - A second click replaces the first one cleanly; leaving the page cancels it.
 * - Reduced motion jumps instead of gliding; without Lenis the browser's own
 *   smooth scroll is used; an unknown id does nothing.
 */

/** Sent right before a navigation scroll starts */
export const NAV_SCROLL_START = 'site:nav-scroll-start';
/** Sent when it is over (arrived, interrupted or cancelled) */
export const NAV_SCROLL_END = 'site:nav-scroll-end';

/** Ids that fall back to the bottom of the page when the element is missing */
const FALLBACK_TO_BOTTOM = new Set(['contact-footer']);

/** Glide time: longer for longer distances, always within these bounds (s) */
const MIN_DURATION_S = 0.9;
const MAX_DURATION_S = 1.8;
const BASE_DURATION_S = 0.7;
const PX_PER_EXTRA_SECOND = 5000;
/** Quick glide used to correct the position after the layout moved (s) */
const CORRECTION_DURATION_S = 0.45;
/** Close enough to the target (px) */
const TOLERANCE_PX = 3;
const MAX_CORRECTIONS = 3;
/** Extra time (ms) after the expected end before giving up waiting for it */
const SAFETY_MARGIN_MS = 1500;
/** Wheel events this soon after the click are leftover momentum: ignored */
const WHEEL_GRACE_MS = 350;

const SCROLL_KEYS = new Set([
  ' ',
  'Spacebar',
  'PageUp',
  'PageDown',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]);
const FIELDS = 'input, textarea, select, [contenteditable="true"]';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** The navigation scroll in progress, if any */
let active = null;

/** Is a navigation scroll running right now? */
export function isNavScrolling() {
  return active !== null;
}

/** Stops the navigation scroll in progress (if any), e.g. when leaving the page. */
export function cancelNavScroll() {
  active?.cancel();
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function maxScrollY() {
  const root = document.documentElement;
  return Math.max(0, root.scrollHeight - window.innerHeight);
}

function prefersReducedMotion() {
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  } catch {
    return false;
  }
}

function emit(name) {
  try {
    window.dispatchEvent(new Event(name));
  } catch {
    // nothing listens, nothing to do
  }
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Page offset that puts the element at the top (`start`) or bottom (`end`) of the screen */
function offsetFor(element, align) {
  const rect = element.getBoundingClientRect();
  const raw =
    align === 'start'
      ? rect.top + window.scrollY
      : rect.bottom + window.scrollY - window.innerHeight;
  return clamp(Math.round(raw), 0, maxScrollY());
}

/**
 * @param {() => number | null} resolveTarget page offset to scroll to, measured
 * fresh each time it is called (null = the target is gone)
 * @returns {boolean} whether a scroll was started
 */
function startNavScroll(resolveTarget) {
  if (typeof window === 'undefined') return false;

  active?.abort(); // a newer click replaces the older one, silently

  const lenis = getLenis();
  const instant = prefersReducedMotion();
  const startedAt = performance.now();
  const listenerOptions = { capture: true, passive: false };
  let finished = false;
  let corrections = 0;
  let safetyTimer = 0;
  let pollFrame = 0;

  const durationFor = y =>
    clamp(
      BASE_DURATION_S + Math.abs(y - window.scrollY) / PX_PER_EXTRA_SECOND,
      MIN_DURATION_S,
      MAX_DURATION_S,
    );

  // stop whatever motion is running, right where the page is now
  const halt = () => {
    try {
      if (lenis) lenis.scrollTo(lenis.scroll, { immediate: true, force: true });
      else window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    } catch {
      // the page simply stays where it is
    }
  };

  const onWheel = event => {
    if (event.ctrlKey) return; // pinch / browser zoom
    if (performance.now() - startedAt < WHEEL_GRACE_MS) {
      // momentum from before the click: swallow it, do not let it cancel us
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    halt();
    end();
  };
  const onTouchStart = () => {
    halt();
    end();
  };
  const onKeyDown = event => {
    if (!SCROLL_KEYS.has(event.key)) return;
    if (event.target?.closest?.(FIELDS)) return;
    halt();
    end();
  };

  const teardown = () => {
    finished = true;
    clearTimeout(safetyTimer);
    cancelAnimationFrame(pollFrame);
    window.removeEventListener('wheel', onWheel, listenerOptions);
    window.removeEventListener('touchstart', onTouchStart, listenerOptions);
    window.removeEventListener('keydown', onKeyDown, listenerOptions);
    if (active === token) active = null;
  };

  function end() {
    if (finished) return;
    teardown();
    emit(NAV_SCROLL_END);
  }

  // the scroll got to where it was going: is it really on target?
  function arrive() {
    if (finished) return;
    const y = resolveTarget();
    if (y === null) {
      end();
      return;
    }
    const off = Math.abs(y - window.scrollY);
    if (off > TOLERANCE_PX && corrections < MAX_CORRECTIONS) {
      corrections += 1;
      go(y, CORRECTION_DURATION_S);
      return;
    }
    end();
  }

  // browsers without Lenis: their own smooth scroll, watched until it rests
  function nativeScroll(y) {
    window.scrollTo({ top: y, behavior: 'smooth' });
    let last = window.scrollY;
    let still = 0;
    const tick = () => {
      if (finished) return;
      const now = window.scrollY;
      still = Math.abs(now - last) < 0.5 ? still + 1 : 0;
      last = now;
      if (still >= 8 || Math.abs(now - y) <= 1) {
        arrive();
        return;
      }
      pollFrame = requestAnimationFrame(tick);
    };
    pollFrame = requestAnimationFrame(tick);
  }

  function go(y, duration) {
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(end, duration * 1000 + SAFETY_MARGIN_MS);

    if (Math.abs(y - window.scrollY) <= TOLERANCE_PX) {
      arrive();
      return;
    }
    if (lenis) {
      try {
        lenis.resize(); // its cached page height can be a moment behind
        lenis.scrollTo(y, {
          duration,
          immediate: instant,
          force: true,
          onComplete: arrive,
        });
        return;
      } catch {
        // fall through to the browser's own scroll
      }
    }
    if (instant) {
      window.scrollTo({ top: y, behavior: 'auto' });
      arrive();
    } else {
      nativeScroll(y);
    }
  }

  const token = {
    abort: teardown, // replaced by a newer navigation: no END event
    cancel: () => {
      halt();
      end();
    },
  };
  active = token;

  window.addEventListener('wheel', onWheel, listenerOptions);
  window.addEventListener('touchstart', onTouchStart, listenerOptions);
  window.addEventListener('keydown', onKeyDown, listenerOptions);

  // lets the showcase release its hold on the page before we move it
  emit(NAV_SCROLL_START);

  const y = resolveTarget();
  if (y === null) {
    end();
    return false;
  }
  go(y, durationFor(y));
  return true;
}

/**
 * Smoothly scrolls to the element with the given id. Bottom aligned by
 * default; an element can opt into top alignment with
 * `data-scroll-align='start'` (the footer and the "Works" section do).
 * @param {string} id
 * @returns {boolean} whether a scroll was started (false: no such element)
 */
export function scrollToId(id) {
  if (typeof document === 'undefined') return false;
  const key = safeDecode(String(id ?? ''));

  const element = document.getElementById(key);
  if (!element) {
    if (!FALLBACK_TO_BOTTOM.has(key)) return false;
    return startNavScroll(() => maxScrollY());
  }

  const align = element.dataset.scrollAlign === 'start' ? 'start' : 'end';
  return startNavScroll(() => {
    const target = document.getElementById(key);
    return target ? offsetFor(target, align) : null;
  });
}

/**
 * Smoothly scrolls to the very top of the page.
 * @returns {boolean} whether a scroll was started
 */
export function scrollToTop() {
  return startNavScroll(() => 0);
}
