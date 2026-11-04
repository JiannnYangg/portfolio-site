'use client';

import { ArrowUp } from 'lucide-react';

import styles from '../index.module.css';

/** One button, laid out over two rows of the footer (text, then the arrow). */
export function BackToTop() {
  const handleClick = event => {
    const calm = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
    event.currentTarget.blur();
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={`${styles.up} ${styles.focusable}`}
    >
      <span className={styles.upText}>
        <span>Back</span>
        <span>to top</span>
      </span>
      <span className={styles.upIcon}>
        <ArrowUp size={20} strokeWidth={1.5} aria-hidden='true' />
      </span>
    </button>
  );
}
