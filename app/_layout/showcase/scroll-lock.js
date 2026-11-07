import { getLenis, NAV_SCROLL_START } from '@/hooks';

/*
 * Scroll helpers for the showcase entry animation.
 *
 * The entry plays once, with the first card centred. If the page could keep
 * scrolling underneath it, a fast scroller would already be several cards deep
 * by the time it ends, and the cards in between would be skipped. So while the
 * entry runs the page is held in place (lockScroll), and it is released the
 * moment the entry ends.
 *
 * The lock is deliberately easy to leave, so nobody is ever trapped:
 * - any upward gesture (wheel up, finger down, PageUp / ArrowUp / Home)
 *   releases it straight away
 * - clicking any link releases it (navbar, offcanvas, footer links), and so does
 *   anything that starts a navigation scroll (the logo, the hero button, "Back
 *   to top": they are buttons, not links; see NAV_SCROLL_START)
 * - a fail-safe timer releases it no matter what
 * - the caller releases it when the carousel is destroyed
 */

const FIELDS = 'input, textarea, select, [contenteditable="true"]';
const BLOCK_KEYS = new Set([' ', 'Spacebar', 'PageDown', 'ArrowDown', 'End']);
const RELEASE_KEYS = new Set(['PageUp', 'ArrowUp', 'Home']);
const TOUCH_RELEASE_PX = 10; // finger travelling down (= page up) this far releases

/**
 * Hold the page still. Returns a function that releases the hold (safe to
 * call any number of times).
 * @param {{ maxMs?: number, onRelease?: () => void }} [options]
 */
export function lockScroll({ maxMs = 12000, onRelease } = {}) {
  let released = false;
  let touchStartY = 0;
  const lenis = getLenis();

  try {
    //? stop any glide that is still running, then pause the smooth scroller
    lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    lenis?.stop();
  } catch {}

  const options = { capture: true, passive: false };

  const onWheel = event => {
    if (event.ctrlKey) return; // pinch / browser zoom
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (event.deltaY < 0) {
      release();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  const onTouchStart = event => {
    touchStartY = event.touches[0]?.clientY ?? 0;
  };
  const onTouchMove = event => {
    const y = event.touches[0]?.clientY ?? touchStartY;
    if (y - touchStartY > TOUCH_RELEASE_PX) {
      release();
      return;
    }
    if (event.cancelable) event.preventDefault();
  };
  const onKeyDown = event => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    )
      return;
    if (event.target?.closest?.(FIELDS)) return;
    if (RELEASE_KEYS.has(event.key) || (event.key === ' ' && event.shiftKey)) {
      release();
      return;
    }
    if (BLOCK_KEYS.has(event.key)) event.preventDefault();
  };
  const onClick = event => {
    if (event.target?.closest?.('a[href]')) release();
  };

  window.addEventListener('wheel', onWheel, options);
  window.addEventListener('touchstart', onTouchStart, options);
  window.addEventListener('touchmove', onTouchMove, options);
  window.addEventListener('keydown', onKeyDown, options);
  document.addEventListener('click', onClick, true);
  window.addEventListener(NAV_SCROLL_START, release);
  const failSafe = setTimeout(() => release(), maxMs);

  function release() {
    if (released) return;
    released = true;
    clearTimeout(failSafe);
    window.removeEventListener('wheel', onWheel, options);
    window.removeEventListener('touchstart', onTouchStart, options);
    window.removeEventListener('touchmove', onTouchMove, options);
    window.removeEventListener('keydown', onKeyDown, options);
    document.removeEventListener('click', onClick, true);
    window.removeEventListener(NAV_SCROLL_START, release);
    try {
      lenis?.start();
    } catch {}
    onRelease?.();
  }

  return release;
}

/**
 * Scroll to an absolute page position, then call `onDone` exactly once (also
 * if the smooth scroller never reports completion).
 */
export function scrollToY(y, onDone) {
  let finished = false;
  const timer = setTimeout(() => finish(), 900);
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    onDone?.();
  }

  const lenis = getLenis();
  if (lenis) {
    try {
      lenis.scrollTo(y, {
        duration: 0.5,
        lock: true,
        force: true,
        onComplete: finish,
      });
      return;
    } catch {}
  }
  window.scrollTo(0, y);
  finish();
}
