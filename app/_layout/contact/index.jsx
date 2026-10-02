'use client';

import { useRef } from 'react';

import { motion } from 'framer-motion';

import { useContactSlider } from '@/hooks';

import { SocialInfo, UserDetails } from './components';

export function Contact() {
  /** @type {import('react').MutableRefObject<HTMLElement>} */
  const containerRef = useRef(null);
  const { transformX } = useContactSlider(containerRef);

  return (
    <motion.footer
      id='contact-footer'
      ref={containerRef}
      className='relative bg-foreground text-background'
    >
      <div
        style={{
          paddingTop: 'clamp(5em, 21vh, 12em)',
          paddingBottom: '2.5em',
        }}
      >
        <UserDetails transformX={transformX} />
        <SocialInfo />
      </div>
    </motion.footer>
  );
}
