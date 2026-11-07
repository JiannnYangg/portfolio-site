'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { markIntroSeen, PRELOADER_DURATION_MS, resolveIntro } from '@/data';
import { cancelNavScroll, scrollToId, useLenis, useTimeOut } from '@/hooks';

import { Preloader } from './preloader';

//? useLayoutEffect warns when a component renders on the server, and this one
//? is pre-rendered. Same behaviour on the client, no warning on the server.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** @param {import('react').PropsWithChildren<unknown>} */
export function Transition({ children }) {
  //? Decided once per mount, BEFORE any child renders (children read it
  //? through `introDelay` to time the hero). True when the visitor already saw
  //? the intro in this tab, or asked for reduced motion: the preloader is then
  //? skipped and the hero starts straight away. See app/_data/intro.js.
  const [skipIntro] = useState(resolveIntro);
  //? Starts true on the server AND on the first client render whatever
  //? `skipIntro` says, so the markup always matches the server HTML. A skipped
  //? intro is removed in the layout effect below, before the browser paints.
  const [isLoading, setLoading] = useState(true);
  const pathname = usePathname();
  const hashTimer = useRef(0);

  //? Leaving the page: a pending #hash scroll must not run on the next page,
  //? and a navigation scroll still in flight is cancelled.
  useEffect(
    () => () => {
      window.clearTimeout(hashTimer.current);
      cancelNavScroll();
    },
    [],
  );

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

  useIsomorphicLayoutEffect(() => {
    if (skipIntro) setLoading(false);
  }, [skipIntro]);

  useLenis();
  useTimeOut({
    callback: () => {
      setLoading(false);
      markIntroSeen();
      window.scrollTo(0, 0);
      const { hash } = window.location;
      if (hash) {
        //? Arrived via a link like /#contact-footer
        hashTimer.current = window.setTimeout(
          () => scrollToId(hash.slice(1)),
          100,
        );
      }
    },
    //? Same constant the preloader reads (greetings * 0.4 s): the last greeting
    //? plays fully, then the screen leaves. A skipped intro has nothing to wait
    //? for: the page is reset to the top (and a #hash followed) right away.
    duration: skipIntro ? 0 : PRELOADER_DURATION_MS,
    deps: [],
  });

  //? `page-shell` (globals.css) clips like `overflow-hidden` did, but without
  //? becoming a scroll container, so the pinned (sticky) showcase works
  return (
    <div key={pathname} className='page-shell'>
      {skipIntro ? (
        //? no exit animation: the overlay is just removed (it is also hidden
        //? by CSS from the first paint, see INTRO_SKIP_SCRIPT)
        isLoading ? (
          <Preloader />
        ) : null
      ) : (
        <AnimatePresence mode='wait'>
          {isLoading ? <Preloader /> : null}
        </AnimatePresence>
      )}
      {children}
    </div>
  );
}
