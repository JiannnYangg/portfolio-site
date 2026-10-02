'use client';

import { Copyright } from 'lucide-react';

import { scrollToId } from '@/hooks';

export function NavbarBrand() {
  const scrollToFooter = () => scrollToId('contact-footer');

  return (
    <button
      type='button'
      onClick={scrollToFooter}
      aria-label='Get in touch with me'
      className='group flex cursor-pointer pb-5 text-left'
    >
      <div className='transition-transform duration-500 ease-in-expo group-hover:rotate-[360deg]'>
        <Copyright />
      </div>

      <div className='ms-2 flex overflow-hidden whitespace-nowrap'>
        <h5>Get in touch</h5>
        <h5 className='max-w-0 overflow-hidden ps-0 opacity-0 transition-all duration-500 ease-in-expo group-hover:max-w-[6rem] group-hover:ps-1 group-hover:opacity-100'>
          with me
        </h5>
      </div>
    </button>
  );
}
