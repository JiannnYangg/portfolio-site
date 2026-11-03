'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

import { scrollToId } from '@/hooks';

/**
 * Same light sweep as the iPhone edit menu in the hero: a slim diagonal
 * sheen that slowly passes over the logo, then a 0.5s pause, then again.
 */
const SHINE_FIRST_DELAY = 2.8; // after the preloader has lifted
const SHINE_DURATION = 2.2; // slow sweep
const SHINE_REPEAT_DELAY = 0.5; // 0.5s pause between passes

/**
 * Brand logo, top-left. Clicking it scrolls to the contact footer, same as
 * the old "Get in touch with me" label.
 * @param {{ tone?: 'light' | 'dark' }} props
 * `dark` = charcoal wordmark with a black dot (light backgrounds),
 * `light` = white wordmark (dark backgrounds, default)
 */
export function NavbarBrand({ tone = 'light' }) {
  const reduceMotion = useReducedMotion();
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
      <span className='relative block origin-left transition-transform duration-500 ease-in-expo group-hover:scale-105'>
        <Image
          src={src}
          alt='Social'
          width={640}
          height={139}
          priority
          unoptimized={isDark}
          className='block h-8 w-auto md:h-9'
        />

        {/* light sweep, clipped to the logo's own shape (mask) so it shines
            on the letters and the "C" only, never on the empty box around */}
        {!reduceMotion && (
          <span
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 overflow-hidden'
            style={{
              maskImage: `url(${src})`,
              WebkitMaskImage: `url(${src})`,
              maskSize: '100% 100%',
              WebkitMaskSize: '100% 100%',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
            }}
          >
            <motion.span
              className='absolute inset-y-0 left-0 w-[24%]'
              style={{
                background:
                  'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
                transform: 'skewX(-18deg)',
              }}
              initial={{ x: '-160%' }}
              animate={{ x: '480%' }}
              transition={{
                delay: SHINE_FIRST_DELAY,
                duration: SHINE_DURATION,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: SHINE_REPEAT_DELAY,
              }}
            />
          </span>
        )}
      </span>
    </button>
  );
}
