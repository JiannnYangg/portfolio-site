'use client';

import Image from 'next/image';

import { scrollToId } from '@/hooks';

/**
 * Soft, natural shadow for the logo on the light/lime hero: a tight contact
 * shadow plus a wider, fainter one, both in a dark olive that belongs to the
 * lime background (not a grey smudge). It lifts the pale gradient "C" off
 * the background without darkening the page.
 */
const LOGO_SHADOW =
  'drop-shadow(0 1px 1px rgba(28,38,0,0.38)) drop-shadow(0 3px 6px rgba(28,38,0,0.20))';

/**
 * Brand logo, top-left. Clicking it scrolls to the contact footer, same as
 * the old "Get in touch with me" label.
 * @param {{ tone?: 'light' | 'dark' }} props
 * `dark` = charcoal wordmark with a black dot (light backgrounds),
 * `light` = white wordmark (dark backgrounds, default)
 */
export function NavbarBrand({ tone = 'light' }) {
  const scrollToFooter = () => scrollToId('contact-footer');
  const isDark = tone === 'dark';
  // logo-social.svg = the dark logo with the dot recolored to charcoal
  // (an SVG wrapper around the image, so next/image must not optimize it)
  const src = isDark ? '/logo-social.svg' : '/logo-light.png';

  return (
    <button
      type='button'
      onClick={scrollToFooter}
      aria-label='Social, get in touch'
      className='group flex cursor-pointer items-center text-left'
    >
      <Image
        src={src}
        alt='Social'
        width={640}
        height={139}
        priority
        unoptimized={isDark}
        style={isDark ? { filter: LOGO_SHADOW } : undefined}
        className='h-8 w-auto origin-left transition-transform duration-500 ease-in-expo group-hover:scale-105 md:h-9'
      />
    </button>
  );
}
