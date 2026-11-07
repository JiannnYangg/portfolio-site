'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Dot } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navItems } from '@/data';
import { useHashNav } from '@/hooks';

import { scale, slideOut } from './variants';

/** The menu slides out in 0.8 s; the page starts moving a little before it is gone */
const MENU_EXIT_SCROLL_DELAY_MS = 300;

const closeMenu = () => window.dispatchEvent(new Event('offcanvas:close'));

export function OffcanvasLinks() {
  const pathname = usePathname();
  const handleHashNav = useHashNav();
  const [activeLink, setActiveLink] = useState(pathname);

  const items = navItems.map(({ href, title }, index) => {
    const id = index;
    return (
      <motion.li
        key={id}
        className='relative my-4 flex items-center'
        variants={slideOut}
        custom={id}
        initial='initial'
        animate='enter'
        exit='exit'
        onPointerEnter={() => setActiveLink(href)}
      >
        <motion.div
          className='absolute -left-11'
          variants={scale}
          animate={activeLink === href ? 'open' : 'closed'}
        >
          <Dot size={36} />
        </motion.div>
        <Link
          href={href}
          className='text-6xl capitalize'
          onClick={event =>
            handleHashNav(event, href, {
              onNavigate: closeMenu,
              delay: MENU_EXIT_SCROLL_DELAY_MS,
            })
          }
        >
          {title}
        </Link>
      </motion.li>
    );
  });

  return (
    <div className='mt-20 flex flex-col gap-3'>
      <div className='mb-10 border-b border-solid'>
        <h5 className='text-xs uppercase text-secondary-foreground'>
          Navigation
        </h5>
      </div>
      <ul onPointerLeave={() => setActiveLink(pathname)}>{items}</ul>
    </div>
  );
}
