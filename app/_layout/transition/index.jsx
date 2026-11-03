'use client';

import { useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { scrollToId, useLenis, useTimeOut } from '@/hooks';

import { Preloader } from './preloader';

/** @param {import('react').PropsWithChildren<unknown>} */
export function Transition({ children }) {
  const [isLoading, setLoading] = useState(true);
  const pathname = usePathname();

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
    //? 8 greetings: 500ms for the first, 260ms each after, plus a short hold
    duration: 2600,
    deps: [],
  });

  return (
    <div key={pathname} className='overflow-hidden'>
      <AnimatePresence mode='wait'>
        {isLoading ? <Preloader /> : null}
      </AnimatePresence>
      {children}
    </div>
  );
}
