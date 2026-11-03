'use client';

import { useCallback } from 'react';

import { usePathname } from 'next/navigation';

/**
 * Smoothly scrolls to the element with the given id.
 * Bottom aligned by default (right for the contact footer). An element can
 * opt into top alignment with `data-scroll-align='start'`, which is what a
 * section like "Our works" wants: it should open at its top edge.
 */
export function scrollToId(id) {
  const element = document.getElementById(id);
  if (element) {
    const block = element.dataset.scrollAlign === 'start' ? 'start' : 'end';
    element.scrollIntoView({ behavior: 'smooth', block });
  } else {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  }
}

/**
 * Click handler for links like `/#contact-footer`.
 * Already on that page: scroll smoothly instead of reloading.
 * On another page: the normal link navigation runs and the target is
 * scrolled into view once the page has loaded (see Transition).
 */
export function useHashNav() {
  const pathname = usePathname();

  return useCallback(
    (event, href, { onBeforeScroll, delay = 0 } = {}) => {
      const [path, hash] = href.split('#');
      if (!hash || (path || '/') !== pathname) return;

      event.preventDefault();
      onBeforeScroll?.();
      setTimeout(() => scrollToId(hash), delay);
    },
    [pathname],
  );
}
