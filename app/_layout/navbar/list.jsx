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
      <li key={id} className='group p-4'>
        <Link
          href={href}
          passHref
          onClick={event => handleHashNav(event, href)}
        >
          <MagneticButton>
            <span className='text-base capitalize'>{title}</span>
            <Center>
              <Dot className='scale-0 transition-transform duration-200 ease-in-expo group-hover:scale-100' />
            </Center>
          </MagneticButton>
        </Link>
      </li>
    );
  });

  //? -me-4 cancels the last item's padding, so the last link's text ends
  //? exactly at the navbar's right alignment line (the right page guide)
  return <ul className='-me-4 flex items-center max-lg:hidden'>{items}</ul>;
}
