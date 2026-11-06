'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Dot } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navItems } from '@/data';
import { useHashNav } from '@/hooks';

import classes from './index.module.css';
import { scale, slideOut } from './variants';

/**
 * The menu links: big, theme-blue, turning violet on hover / keyboard focus
 * (the other links dim a little, so the one you are on stands out). A dot in a
 * reserved slot on the left marks the link under the pointer, or the current
 * page when nothing is hovered. The slot is always there, so the text never
 * jumps and nothing hangs outside the panel on small phones.
 */
export function OffcanvasLinks() {
  const pathname = usePathname();
  const handleHashNav = useHashNav();
  const [activeLink, setActiveLink] = useState(pathname);

  const items = navItems.map(({ href, title }, index) => {
    const id = index;
    return (
      <motion.li
        key={id}
        className={classes.item}
        variants={slideOut}
        custom={id}
        initial='initial'
        animate='enter'
        exit='exit'
        onPointerEnter={() => setActiveLink(href)}
      >
        <motion.span
          className={classes.dot}
          aria-hidden='true'
          variants={scale}
          animate={activeLink === href ? 'open' : 'closed'}
        >
          <Dot size={32} />
        </motion.span>
        <Link
          href={href}
          className={classes.link}
          aria-current={pathname === href ? 'page' : undefined}
          onFocus={() => setActiveLink(href)}
          onClick={event =>
            handleHashNav(event, href, {
              onBeforeScroll: () =>
                window.dispatchEvent(new Event('offcanvas:close')),
              delay: 700,
            })
          }
        >
          {title}
        </Link>
      </motion.li>
    );
  });

  return (
    <nav aria-label='Main menu'>
      <ul className={classes.list} onPointerLeave={() => setActiveLink(pathname)}>
        {items}
      </ul>
    </nav>
  );
}
