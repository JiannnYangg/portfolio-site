'use client';

import { useRef } from 'react';

import { motion } from 'framer-motion';

import { MagneticButton } from '@/components';
import { useOffcanvasToggle } from '@/hooks';
import { cn } from '@/utils';

import classes from './index.module.css';

/**
 * Same behaviour and colours as the round "About us" / "Works" buttons (see
 * layout/circle-button.js): dark by default, and on HOVER a plain orange with
 * a tiny touch of beige grows in. Only the two hover layers (before = the
 * growing disc, after = the final fill) carry the colour, so the resting
 * button stays dark. Whole class names on purpose (Tailwind reads them as
 * plain strings).
 */
const TOGGLE_HOVER =
  'before:!bg-[#ee7a3d] after:!bg-[#ee7a3d] before:![background-image:linear-gradient(135deg,#f3ad7e_0%,#ee7a3d_55%,#ec732f_100%)] after:![background-image:linear-gradient(135deg,#f3ad7e_0%,#ee7a3d_55%,#ec732f_100%)]';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {import('react').Dispatch<SetStateAction<boolean>>} props.handleOpen
 */
export function OffcanvasToggle({ isOpen, handleOpen }) {
  /** @type {import('react').MutableRefObject<HTMLDivElement>} */
  const containerRef = useRef(null);
  const { scrollYProgress } = useOffcanvasToggle({
    element: containerRef,
    callback: latest => latest <= 1 && handleOpen(false),
  });

  return (
    <motion.div
      ref={containerRef}
      className={classes.wrapper}
      initial={false}
      transition={{
        duration: 1,
        ease: [0.76, 0, 0.24, 1],
      }}
      style={{ scale: scrollYProgress }}
    >
      <MagneticButton
        size='md'
        variant='ghost'
        className={`border border-solid border-muted-foreground ${TOGGLE_HOVER}`}
        aria-expanded={isOpen}
        onClick={() => handleOpen(!isOpen)}
      >
        <span
          className={cn([classes.burger], [isOpen && classes.burgerActive])}
        />
        <span className='sr-only focus:not-sr-only'>Offcanvas Toggle</span>
      </MagneticButton>
    </motion.div>
  );
}
