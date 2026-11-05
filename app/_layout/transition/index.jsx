'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { PRELOADER_DURATION_MS } from '@/data';
import { scrollToId, useLenis, useTimeOut } from '@/hooks';

import { Preloader } from './preloader';

/** @param {import('react').PropsWithChildren<unknown>} */
export function Transition({ children }) {
  const [isLoading, setLoading] = useState(true);
  const pathname = usePathname();

  //? A refresh must start the page (and the animations in it, like the
  //? showcase carousel) from the beginning. By default the browser restores
  //? the old scroll position on reload, which would drop the visitor in the
  //? middle of the pinned showcase and fire its entry while the preloader is
  //? still up. So: take over scroll restoration and start at the top. A link
  //? with a #hash is left alone, it is scrolled to once the preloader is gone.
  //? (Runs before useLenis so the smooth scroller starts from the top too.)
  useEffect(() => {
    const history = window.history;
    const canControl = 'scrollRestoration' in history;
    const previous = canControl ? history.scrollRestoration : 'auto';
    if (canControl) history.scrollRestoration = 'manual';
    if (!window.location.hash) window.scrollTo(0, 0);
    return () => {
      if (canControl) history.scrollRestoration = previous;
    };
  }, []);

  useLenis();
  useTimeOut({
    callback: () => {
      setLoading(false);
      window.scrollTo(0, 0);
      const { hash } = window.location;
      if (hash) {
        //? Arrived via a link like /#contact-footer
        setTimeout(() => scrollToId(hash.slice(1)), 100);
      }
    },
    //? Same constant the preloader reads (greetings * 0.4 s): the last greeting
    //? plays fully, then the screen leaves
    duration: PRELOADER_DURATION_MS,
    deps: [],
  });

  //? `page-shell` (globals.css) clips like `overflow-hidden` did, but without
  //? becoming a scroll container, so the pinned (sticky) showcase works
  return (
    <div key={pathname} className='page-shell'>
      <AnimatePresence mode='wait'>
        {isLoading ? <Preloader /> : null}
      </AnimatePresence>
      {children}
    </div>
  );
}
