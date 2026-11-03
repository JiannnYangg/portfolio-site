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
      //? flex + items-center: no inline baseline gap, so the link box sits on
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
          <MagneticButton className='text-sm'>
            {/* The hover dot below sits in normal flow and is 24px tall (even
                while scaled to 0), which pushed the text up by 12px. This
                24px spacer above balances it, so the TEXT itself is centred. */}
            <span aria-hidden='true' className='block h-6' />
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
  //? translate-y-[9px]: sits the links a little below the logo's centre line,
  //? level with the lower part of the logo letters.
  return (
    <ul className='-me-6 flex translate-y-[9px] items-center max-lg:hidden'>
      {items}
    </ul>
  );
}
