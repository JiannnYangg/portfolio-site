'use client';

import { ArrowUpRight } from 'lucide-react';

import { useContactModal } from '@/components';

import { EMAIL } from '../config';
import styles from '../index.module.css';

/**
 * Same call to action as the hero's "Let's talk" (header/index.jsx): a
 * near-white outer pill, a gradient label and a dark circle with an arrow. On
 * hover / focus the two swap. The colours live in index.module.css
 * (--ft-cta-*) and match the hero's CTA_SOLID / CTA_GRADIENT / CTA_DARK.
 *
 * Clicking it opens the contact popup (see _components/contact-modal). It is
 * still a real mailto link underneath, so if JavaScript has not loaded (or a
 * visitor opens it in a new tab) it falls back to their mail app; the copy
 * button next to the address covers desktops that have no mail app.
 */
export function GetInTouch() {
  const { open } = useContactModal();

  return (
    <a
      href={`mailto:${EMAIL}?subject=Hello%20Satyam`}
      aria-haspopup='dialog'
      className={`${styles.cta} ${styles.focusable}`}
      onClick={event => {
        //? let modified clicks (new tab, new window) keep the plain link
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        open();
      }}
    >
      <span className={styles.ctaLabel}>Get in touch</span>
      <span className={styles.ctaArrow}>
        <ArrowUpRight size={20} strokeWidth={2.25} aria-hidden='true' />
      </span>
    </a>
  );
}
