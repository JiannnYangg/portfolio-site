'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, Copy } from 'lucide-react';

import { EMAIL } from '../config';
import styles from '../index.module.css';

/** Clipboard API first (needs https), old text-selection trick as a fallback. */
async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(area);

  if (!copied) throw new Error('Copy is not available');
}

const LABELS = {
  idle: 'Copy email',
  copied: 'Copied',
  failed: 'Copy failed',
};

/**
 * Many desktops have no mail app, so a mailto: link can do nothing at all.
 * This pair gives a way out: the link, and a button that copies the address
 * and says what happened (announced to screen readers too).
 */
export function EmailActions() {
  const [state, setState] = useState('idle');
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    clearTimeout(timer.current);
    try {
      await copyText(EMAIL);
      setState('copied');
    } catch {
      setState('failed');
    }
    timer.current = setTimeout(() => setState('idle'), 2400);
  };

  const Icon = state === 'copied' ? Check : Copy;

  return (
    <div className={styles.pills}>
      <a
        href={`mailto:${EMAIL}`}
        className={`${styles.pill} ${styles.focusable}`}
      >
        {EMAIL}
      </a>
      <button
        type='button'
        onClick={handleCopy}
        className={`${styles.pill} ${styles.focusable}`}
      >
        <Icon size={15} strokeWidth={1.75} aria-hidden='true' />
        <span role='status'>{LABELS[state]}</span>
      </button>
    </div>
  );
}
