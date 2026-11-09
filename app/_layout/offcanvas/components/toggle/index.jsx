'use client';

import { useRef } from 'react';

import { motion } from 'framer-motion';

import { MagneticButton } from '@/components';
import { useOffcanvasToggle } from '@/hooks';
import { cn } from '@/utils';

import classes from './index.module.css';

/**
 * Same behaviour as the round "About us" / "Works" buttons (see
 * layout/circle-button.js): dark by default, and on HOVER the light
 * peach-coral gradient grows in. Only the two hover layers (before = the
 * growing disc, after = the final fill) carry the gradient, so the resting
 * button stays dark. Whole class names on purpose (Tailwind reads them as
 * plain strings).
 */
const TOGGLE_HOVER =
  'before:!bg-[#ffb594] after:!bg-[#ffb594] before:![background-image:linear-gradient(135deg,#ffe3d4_0%,#ffc2a3_45%,#ff9e78_100%)] after:![background-image:linear-gradient(135deg,#ffe3d4_0%,#ffc2a3_45%,#ff9e78_100%)]';

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
