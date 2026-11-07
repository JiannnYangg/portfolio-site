'use client';

import { useRef } from 'react';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

import { introDelay } from '@/data';
import { scrollToId, useLoopDelay } from '@/hooks';

/**
 * Same light sweep as the iPhone edit menu in the hero: a slim diagonal
 * sheen that slowly passes over the logo, then a 0.5s pause, then again.
 */
const SHINE_FIRST_DELAY = 2.3; // after the preloader has lifted
const SHINE_DURATION = 2.2; // slow sweep
const SHINE_REPEAT_DELAY = 0.5; // 0.5s pause between passes

/**
 * Brand logo, top-left. Clicking it scrolls to the contact footer, same as
 * the old "Get in touch with me" label.
 * @param {{ tone?: 'light' | 'dark' }} props
 * `dark` = deep-navy wordmark (light backgrounds),
 * `light` = white wordmark (dark backgrounds, default)
 * Both are vector (SVG) with a transparent background; the "C" carries the
 * brand gradient (blue to violet to pink).
 */
export function NavbarBrand({ tone = 'light' }) {
  const reduceMotion = useReducedMotion();
  //? the sweep repeats forever: it only runs while the logo is near the
  //? screen, so it costs nothing once the visitor has scrolled away
  const shineRef = useRef(null);
  const onScreen = useInView(shineRef, { margin: '200px 0px 200px 0px' });
  const shineDelay = useLoopDelay(onScreen, introDelay(SHINE_FIRST_DELAY));
  const scrollToFooter = () => scrollToId('contact-footer');
  const isDark = tone === 'dark';
  // SVGs are served as they are (next/image must not optimize them)
  const src = isDark ? '/logo-social.svg' : '/logo-light.svg';

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
          width={722}
          height={164}
          priority
          unoptimized
          className='block h-8 w-auto md:h-9'
        />

        {/* light sweep, clipped to the logo's own shape (mask) so it shines
            on the letters and the "C" only, never on the empty box around */}
        {!reduceMotion && (
          <span
            ref={shineRef}
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
              animate={{ x: onScreen ? '480%' : '-160%' }}
              transition={
                onScreen
                  ? {
                      delay: shineDelay,
                      duration: SHINE_DURATION,
                      ease: 'easeInOut',
                      repeat: Infinity,
                      repeatDelay: SHINE_REPEAT_DELAY,
                    }
                  : { duration: 0 }
              }
            />
          </span>
        )}
      </span>
    </button>
  );
}
