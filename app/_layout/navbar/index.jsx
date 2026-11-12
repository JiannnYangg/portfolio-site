'use client';

import { GUIDE_X, Partition } from '@/components';
import { introDelay } from '@/data';

import { NavbarBrand } from './brand';
import { NavbarList } from './list';

/**
 * The band height (--band) and the inset from the guides (--nav-inset) are the
 * shared layout tokens in globals.css, so the burger button lines up with the
 * logo. The bar is a fixed-height band whose content is aligned to the two vertical
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
    <nav className='absolute inset-x-0 top-0 z-10'>
      <div
        className={`flex h-[var(--band)] items-center justify-between ${textColor}`}
        style={{ paddingInline: `calc(${GUIDE_X} + var(--nav-inset))` }}
      >
        <NavbarBrand tone={tone} />
        <NavbarList tone={tone} />
      </div>

      {partition ? (
        <div className='absolute inset-x-0' style={{ top: 'var(--band)' }}>
          <Partition
            name={partition.name}
            index={partition.index}
            delay={introDelay(2.1)}
          />
        </div>
      ) : null}
    </nav>
  );
}
