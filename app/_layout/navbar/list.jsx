'use client';

import { Dot } from 'lucide-react';
import Link from 'next/link';

import { Center, MagneticButton } from '@/components';
import { navItems } from '@/data';
import { useHashNav } from '@/hooks';

//? The theme's `foreground` is near-black (#1c1d21), which felt too heavy for
//? bold 15px links on the light paper. On light pages the links use a softened
//? charcoal instead (#44464d, about 8.6:1 on the paper, so it still clears
//? WCAG AAA). On dark heroes (`tone='light'`) nothing is overridden and the
//? links keep inheriting the white text colour from the navbar.
const SOFT_INK = 'text-[#44464d]';

/**
 * @param {{ tone?: 'light' | 'dark' }} props
 * Same meaning as on `Navbar`: `dark` = dark text for light backgrounds.
 */
export function NavbarList({ tone = 'light' }) {
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
              they are bold now.
              tracking-[0.04em]: a little air between the letters. Letter
              spacing is NOT part of the `ch` unit, so it would push the
              longest label ("research papers") past the 14ch cap and break
              it in the middle of a word (the label box uses break-all).
              [&>span]:max-w-none lifts that cap for the nav labels only: the
              box is width: max-content, so each label simply sizes itself to
              its text on one line, whatever the spacing. */}
          <MagneticButton className='text-[15px] font-bold tracking-[0.04em] [&>span]:max-w-none'>
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
    <ul
      className={`-me-6 flex translate-y-[3px] items-center max-lg:hidden ${
        tone === 'dark' ? SOFT_INK : ''
      }`}
    >
      {items}
    </ul>
  );
}
