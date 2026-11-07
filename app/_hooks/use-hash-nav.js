'use client';

import { useCallback } from 'react';

import { usePathname } from 'next/navigation';

import { scrollToId, scrollToTop } from './nav-scroll';

/** A normal left click: not a "open in new tab / window" gesture */
const isPlainClick = event =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

/**
 * Click handler for in-site links such as `/#contact-footer`, `/` or `/about`.
 *
 * - Open-in-new-tab gestures (Cmd / Ctrl / Shift / Alt / middle click) are
 *   left to the browser.
 * - A link to the page you are already on does not reload: it scrolls, to the
 *   section after the `#`, or to the top when there is none (so "Home" on the
 *   home page, or the current page's own link, does something useful).
 * - A link to another page runs the normal navigation; the section is
 *   scrolled into view once that page has loaded (see Transition).
 *
 * @param {import('react').MouseEvent} event
 * @param {string} href
 * @param {{ onNavigate?: () => void, delay?: number }} [options]
 * `onNavigate` runs for every plain click (e.g. to close the side menu);
 * `delay` (ms) postpones the same-page scroll, e.g. until that menu is out of
 * the way.
 */
export function useHashNav() {
  const pathname = usePathname();

  return useCallback(
    (event, href, { onNavigate, delay = 0 } = {}) => {
      if (event.defaultPrevented || !isPlainClick(event)) return;

      onNavigate?.();

      const [path, hash] = href.split('#');
      if ((path || '/') !== pathname) return; // another page: normal navigation

      event.preventDefault();

      const scroll = () => {
        // the visitor may have moved on to another page in the meantime
        if (window.location.pathname !== pathname) return;
        if (hash) scrollToId(hash);
        else scrollToTop();
      };

      if (delay > 0) window.setTimeout(scroll, delay);
      else scroll();
    },
    [pathname],
  );
}
