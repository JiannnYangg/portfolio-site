'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { OffcanvasBody, OffcanvasToggle } from './components';

export function Offcanvas() {
  const [isOpen, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  //? Escape closes the menu (only listened for while it is open)
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = event => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('offcanvas:close', close);
    return () => window.removeEventListener('offcanvas:close', close);
  }, []);

  return (
    <>
      <AnimatePresence mode='wait'>
        {isOpen ? <OffcanvasBody /> : null}
      </AnimatePresence>
      <OffcanvasToggle isOpen={isOpen} handleOpen={setOpen} />
    </>
  );
}
