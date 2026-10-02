'use client';

import { motion } from 'framer-motion';
import { MoveDownRight } from 'lucide-react';

import { ParallaxSlider } from '@/components';

import { slideUp } from './variants';

export function Header() {
  return (
    <motion.header
      className='relative h-screen overflow-hidden bg-secondary-foreground text-background'
      variants={slideUp}
      initial='initial'
      animate='enter'
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/images/hero-bg.webp'
        alt=''
        aria-hidden='true'
        fetchPriority='high'
        className='absolute inset-0 h-full w-full object-cover object-[46%_50%] md:object-center'
      />
      <div className='absolute inset-0 bg-black/20' />

      <div className='relative flex h-full flex-col justify-end gap-2 md:flex-col-reverse md:justify-normal'>
        <div className='select-none'>
          <h1 className='text-[max(9em,15vw)]'>
            <ParallaxSlider repeat={4} baseVelocity={2}>
              <span className='pe-12'>
                Helping Brands Stand Out
                <span className='spacer'>—</span>
              </span>
            </ParallaxSlider>
          </h1>
        </div>

        <div className='md:ml-auto'>
          <div className='mx-10 max-md:my-12 md:me-[5vw] md:ms-0'>
            <div className='mb-4 md:mb-20'>
              <MoveDownRight size={28} strokeWidth={1.25} />
            </div>

            <h4 className='text-[clamp(1.4em,2vw,2.5em)]'>
              <span className='block'>Hey, I&apos;m Satyam</span>
              <span className='block'>Design, Develop &amp; Distribute</span>
            </h4>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
