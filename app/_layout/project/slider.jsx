'use client';

import Image from 'next/image';

import { Center } from '@/components';

/**
 * @param {Object} props
 * @param {string} props.src
 * @param {string} props.alt
 */
export function ProjectSlider({ src, alt }) {
  return (
    <Center
      className='relative w-1/4 overflow-hidden rounded'
      style={{
        minWidth: '150px',
        height: '20vw',
      }}
    >
      <Image
        src={src}
        className='object-cover'
        fill={true}
        sizes='(min-width: 768px) 30vw, 150px'
        alt={alt}
      />
    </Center>
  );
}
