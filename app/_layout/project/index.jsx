'use client';

import { useRef } from 'react';

import { motion } from 'framer-motion';

import { projectOptions } from '@/data';
import { useProjectSlider } from '@/hooks';
import { randomId } from '@/utils';

import { ProjectSlider } from './slider';

export function Project() {
  /** @type {import('react').MutableRefObject<HTMLElement>} */
  const containerRef = useRef(null);
  const { transformX1, transformX2, transformY } =
    useProjectSlider(containerRef);

  const firstSlider = projectOptions.first.map(({ src, alt }) => {
    const id = randomId();
    return <ProjectSlider key={id} src={src} alt={alt} />;
  });

  const secondSlider = projectOptions.second.map(({ src, alt }) => {
    const id = randomId();
    return <ProjectSlider key={id} src={src} alt={alt} />;
  });

  return (
    <section ref={containerRef} className='relative z-10 mt-14'>
      <div className='grid items-center'>
        {/* No solid background here: the site-wide backdrop (paper, blooms,
            grid) must show through between the sliders. */}
        <div>
          <motion.div
            className='mb-10 flex gap-10'
            style={{
              width: '120vw',
              x: transformX1,
            }}
          >
            {firstSlider}
          </motion.div>

          <motion.div
            className='mb-10 flex gap-10'
            style={{
              width: '120vw',
              x: transformX2,
            }}
          >
            {secondSlider}
          </motion.div>
        </div>

        {/* Spacer that eases the gap above the footer closed as you scroll */}
        <motion.div
          aria-hidden='true'
          className='w-screen'
          style={{ height: transformY }}
        />
      </div>
    </section>
  );
}
