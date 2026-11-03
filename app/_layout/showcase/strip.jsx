'use client';

import { motion } from 'framer-motion';

/**
 * The light version of the showcase: a plain CSS scroll-snap strip. No WebGL,
 * no three.js, images load lazily. Used on phones / tablets / small windows,
 * for reduced-motion, data-saver and low-spec devices, and whenever WebGL is
 * unavailable or fails.
 */
export function ShowcaseStrip({ projects }) {
  return (
    <section aria-label='Selected work' className='py-[clamp(2.5em,6vw,5em)]'>
      <ul
        className='flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[max(1.5rem,calc((100%-1400px)/2+2rem))] pb-6'
        tabIndex={0}
        aria-label='Selected work, scroll sideways'
      >
        {projects.map(({ src, aspect, brand, desc }, i) => (
          <motion.li
            key={src}
            className='w-[72vw] max-w-[380px] shrink-0 snap-center sm:w-[44vw]'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: Math.min(i, 3) * 0.06 }}
          >
            <div
              className='overflow-hidden rounded-md'
              style={{ aspectRatio: aspect || '3 / 4' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${brand}: ${desc}`}
                width={Math.round(aspect * 720)}
                height={720}
                loading='lazy'
                decoding='async'
                draggable={false}
                className='size-full object-cover'
              />
            </div>
            <p className='mt-3 text-base'>{brand}</p>
            <p className='text-sm text-secondary-foreground'>{desc}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
