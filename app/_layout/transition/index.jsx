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
    //? Must equal FIRST_MS + (greetings - 1) * EACH_MS in preloader/index.jsx
    //? (600 + 5 * 300): the last greeting plays fully, then the screen leaves
    duration: 2100,
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
