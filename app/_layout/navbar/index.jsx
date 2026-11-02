'use client';

import { NavbarBrand } from './brand';
import { NavbarList } from './list';

/**
 * @param {{ tone?: 'light' | 'dark' }} props
 * `light` = white text (for dark backgrounds, default), `dark` = dark text (for light backgrounds)
 */
export function Navbar({ tone = 'light' }) {
  const textColor = tone === 'dark' ? 'text-foreground' : 'text-background';

  return (
    <nav className='absolute inset-x-0 top-0 z-10'>
      <div
        className={`flex items-center justify-between px-8 py-4 ${textColor}`}
      >
        <NavbarBrand />
        <NavbarList />
      </div>
    </nav>
  );
}
