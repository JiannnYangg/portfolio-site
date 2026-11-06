'use client';

import { motion } from 'framer-motion';

import { FixedOverlay } from '@/components';

import { OffcanvasBackdrop } from './back-drop';
import classes from './index.module.css';
import { OffcanvasLinks } from './links';
import { slideLeft } from './variants';

const MotionComponent = motion(FixedOverlay);

/**
 * The right-hand slide-out menu: a light, blue-tinted panel with the page
 * links centred vertically. Colours live in index.module.css (.root), so the
 * panel, its curved edge (back-drop) and the links all share one palette.
 */
export function OffcanvasBody() {
  return (
    <MotionComponent
      className={`z-40 ${classes.root}`}
      variants={slideLeft}
      initial='initial'
      animate='enter'
      exit='exit'
    >
      <OffcanvasBackdrop />

      <div className={classes.panel}>
        <div className={classes.inner}>
          <OffcanvasLinks />
        </div>
      </div>
    </MotionComponent>
  );
}
