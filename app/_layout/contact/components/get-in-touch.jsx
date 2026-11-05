import { ArrowUpRight } from 'lucide-react';

import { EMAIL } from '../config';
import styles from '../index.module.css';

/**
 * Same call to action as the hero's "Let's talk" (header/index.jsx): a
 * near-white outer pill, a blue gradient label and a dark circle with an
 * arrow. On hover / focus the two swap. The colours live in index.module.css
 * (--ft-cta-*) and match the hero's CTA_SOLID / CTA_GRADIENT / CTA_DARK.
 *
 * It is a real mailto link; the copy button next to the address covers
 * desktops that have no mail app.
 */
export function GetInTouch() {
  return (
    <a
      href={`mailto:${EMAIL}?subject=Hello%20Satyam`}
      className={`${styles.cta} ${styles.focusable}`}
    >
      <span className={styles.ctaLabel}>Get in touch</span>
      <span className={styles.ctaArrow}>
        <ArrowUpRight size={20} strokeWidth={2.25} aria-hidden='true' />
      </span>
    </a>
  );
}
