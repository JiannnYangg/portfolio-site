'use client';

import { Dot } from 'lucide-react';
import Link from 'next/link';

import { Center, MagneticButton } from '@/components';
import { navItems } from '@/data';
import { useHashNav } from '@/hooks';
import { randomId } from '@/utils';

export function NavbarList() {
  const handleHashNav = useHashNav();
  const items = navItems.slice(1).map(({ href, title }) => {
    const id = randomId();
    return (
      //? flex + items-center: no inline baseline gap, so the link text sits on
      //? the true vertical centre of the navbar band
      <li key={id} className='group flex items-center p-4'>
        <Link
          href={href}
          passHref
          className='flex'
          onClick={event => handleHashNav(event, href)}
        >
          {/* font size lives on the button (not on the span) because the label
              box is max-width: 14ch, and ch follows the button's font size */}
          <MagneticButton className='text-lg xl:text-xl'>
            <span className='capitalize'>{title}</span>
            <Center>
              <Dot className='scale-0 transition-transform duration-200 ease-in-expo group-hover:scale-100' />
            </Center>
          </MagneticButton>
        </Link>
      </li>
    );
  });

  //? -me-6 cancels the last item's padding (li p-4 = 16px) AND the magnetic
  //? button's own p-2 (8px), so the last link's TEXT ends exactly at the
  //? navbar's right alignment line, the mirror of where the logo starts.
  //? translate-y-[5px]: the logo image has the leaf above the wordmark, so
  //? the letters sit ~5px below the image centre; the links follow the letters.
  return (
    <ul className='-me-6 flex translate-y-[5px] items-center max-lg:hidden'>
      {items}
    </ul>
  );
}
