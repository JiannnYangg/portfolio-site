'use client';

import { useRef } from 'react';

import { useRevealPhase } from '@/hooks';

import { GlassContent, GlassField, Headline } from './components';
import styles from './index.module.css';
import { useSpotlight } from './use-spotlight';

/**
 * Site footer (#contact-footer). Two halves, like a poster:
 *   top    paper, column lines, the call to action
 *   bottom a field of glass tiles in the site's lime, with the details on it
 *
 * The tiles light up once, in a diagonal wave, when the footer scrolls into
 * view (`data-phase`, see useRevealPhase). Without JS or with reduced motion
 * they are simply there.
 */
export function Contact() {
  /** @type {import('react').MutableRefObject<HTMLDivElement>} */
  const glassRef = useRef(null);
  /** @type {import('react').MutableRefObject<HTMLDivElement>} */
  const gridRef = useRef(null);

  const phase = useRevealPhase(glassRef);
  useSpotlight(glassRef, gridRef);

  return (
    <footer
      id='contact-footer'
      data-phase={phase}
      data-scroll-align='start'
      className={styles.root}
    >
      <Headline />
      <div ref={glassRef} className={styles.glass}>
        <GlassField gridRef={gridRef} />
        <GlassContent />
      </div>
    </footer>
  );
}
