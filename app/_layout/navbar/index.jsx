'use client';

import { GUIDE_X, Partition } from '@/components';

import { NavbarBrand } from './brand';
import { NavbarList } from './list';

/**
 * The bar is a fixed-height band whose content is aligned to the two vertical
 * page guides: the logo starts just inside the left guide and the last link
 * ends just inside the right guide. When `partition` is given, the band is
 * closed by a dashed section line (with its two corner labels) right under it.
 *
 * @param {{
 *   tone?: 'light' | 'dark',
 *   partition?: { name: string, index: string },
 * }} props
 * `light` = white text (for dark backgrounds, default), `dark` = dark text (for light backgrounds)
 */
export function Navbar({ tone = 'light', partition }) {
  const textColor = tone === 'dark' ? 'text-foreground' : 'text-background';

  return (
    <nav className='absolute inset-x-0 top-0 z-10 [--band:3.5rem] [--nav-inset:1rem] md:[--band:5rem] md:[--nav-inset:1.5rem]'>
      <div
        className={`flex h-[var(--band)] items-center justify-between ${textColor}`}
        style={{ paddingInline: `calc(${GUIDE_X} + var(--nav-inset))` }}
      >
        <NavbarBrand tone={tone} />
        <NavbarList />
      </div>

      {partition ? (
        <div className='absolute inset-x-0' style={{ top: 'var(--band)' }}>
          <Partition
            name={partition.name}
            index={partition.index}
            delay={2.6}
          />
        </div>
      ) : null}
    </nav>
  );
}
