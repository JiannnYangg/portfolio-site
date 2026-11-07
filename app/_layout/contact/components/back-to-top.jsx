'use client';

import { ArrowUp } from 'lucide-react';

import { scrollToTop } from '@/hooks';

import styles from '../index.module.css';

/**
 * One compact pill on a single line: the label, then a dark circle with the
 * arrow (the same shape language as the "Get in touch" CTA, just smaller).
 * It sits on the same row as the social chips, right-aligned, and is as tall
 * as they are so the row reads as one line.
 */
export function BackToTop() {
  //? same scroller as every other navigation click (reduced motion included)
  const handleClick = event => {
    scrollToTop();
    event.currentTarget.blur();
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={`${styles.up} ${styles.focusable}`}
    >
      <span className={styles.upText}>Back to top</span>
      <span className={styles.upIcon}>
        <ArrowUp size={18} strokeWidth={2} aria-hidden='true' />
      </span>
    </button>
  );
}
