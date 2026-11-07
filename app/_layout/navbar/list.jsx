'use client';

import { Dot } from 'lucide-react';
import Link from 'next/link';

import { Center, MagneticButton } from '@/components';
import { navItems } from '@/data';
import { useHashNav } from '@/hooks';

export function NavbarList() {
  const handleHashNav = useHashNav();
  const items = navItems.slice(1).map(({ href, title }) => {
    return (
      //? flex + items-center: no inline baseline gap, so the link box sits on
      //? the true vertical centre of the navbar band. The key is the link
      //? itself (it used to be a new random id every render, which remounted
      //? every link and dropped its hover state).
      <li key={href} className='group flex items-center p-4'>
        <Link
          href={href}
          passHref
          className='flex'
          onClick={event => handleHashNav(event, href)}
        >
          {/* font size lives on the button (not on the span) because the label
              box is max-width: 14ch, and ch follows the button's font size.
              font-bold: the links were too light to read over the hero, so
              they are bold now (the weight also feeds the ch width, which
              still leaves room for the longest label). */}
          <MagneticButton className='text-[15px] font-bold'>
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
  //? translate-y-[3px]: the logo letters sit a few px below the band centre,
  //? so the links are nudged down just enough to share their centre line.
  return (
    <ul className='-me-6 flex translate-y-[3px] items-center max-lg:hidden'>
      {items}
    </ul>
  );
}
