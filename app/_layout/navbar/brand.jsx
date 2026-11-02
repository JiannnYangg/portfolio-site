'use client';

import Image from 'next/image';

import { scrollToId } from '@/hooks';

/**
 * Brand logo, top-left. Clicking it scrolls to the contact footer, same as
 * the old "Get in touch with me" label.
 * @param {{ tone?: 'light' | 'dark' }} props
 * `dark` = charcoal wordmark (light backgrounds),
 * `light` = white wordmark (dark backgrounds, default)
 */
export function NavbarBrand({ tone = 'light' }) {
  const scrollToFooter = () => scrollToId('contact-footer');
  const src = tone === 'dark' ? '/logo.png' : '/logo-light.png';

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
        className='h-8 w-auto origin-left transition-transform duration-500 ease-in-expo group-hover:scale-105 md:h-9'
      />
    </button>
  );
}
