'use client';

import { forwardRef } from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { Center } from '@/components';
import { thumbnailOptions } from '@/data';
import { randomId } from '@/utils';

const MotionComponent = motion(Center);

export const ThumbnailModal = forwardRef(
  /**
   * @param {import('react').HTMLAttributes<HTMLElement> & { variants: import('framer-motion').Variants; active: boolean; index: number;}} props
   * @param {import('react').ForwardedRef<HTMLElement>} ref
   */
  function ThumbnailModal({ variants, active, index, ...props }, ref) {
    const items = thumbnailOptions.map(({ title, image }) => {
      const id = randomId();
      return (
        <div key={id} className='relative h-full w-full'>
          {image ? (
            <Image
              src={image}
              fill
              sizes='384px'
              className='object-cover'
              alt={`${title} thumbnail image`}
            />
          ) : (
            <Center className='h-full w-full flex-col gap-2 text-background'>
              <span className='text-2xl'>{title}</span>
              <span className='text-xs opacity-60'>Preview coming soon</span>
            </Center>
          )}
        </div>
      );
    });

    return (
      <MotionComponent
        ref={ref}
        className='pointer-events-none fixed left-1/2 top-1/2 h-56 w-96 overflow-hidden rounded bg-secondary-foreground'
        variants={variants}
        initial='initial'
        animate={active ? 'enter' : 'closed'}
        {...props}
      >
        <div
          className='relative h-full w-full'
          style={{
            top: `${index * -100}%`,
            transition: 'top 0.5s cubic-bezier(0.76, 0, 0.24, 1)',
          }}
        >
          {items}
        </div>
      </MotionComponent>
    );
  },
);
