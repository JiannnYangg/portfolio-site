'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, Copy, Mail } from 'lucide-react';

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
  idle: 'Copy',
  copied: 'Copied',
  failed: 'Copy failed',
};

/** What screen readers hear after pressing the button */
const ANNOUNCEMENTS = {
  idle: '',
  copied: 'Email address copied',
  failed: 'Could not copy the email address',
};

/**
 * The address as one capsule: [ mail icon + address ] | [ copy ].
 * Many desktops have no mail app, so a mailto: link can do nothing at all;
 * the copy half gives a way out. The button keeps one steady accessible name
 * and the result is announced by a separate live region (a live region inside
 * a button is not part of the button's name). On very narrow screens the
 * visible label collapses to just the icon so the capsule never overflows.
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
    <div className={styles.email}>
      <a
        href={`mailto:${EMAIL}`}
        className={`${styles.emailLink} ${styles.focusable}`}
      >
        <Mail size={16} strokeWidth={1.75} aria-hidden='true' />
        <span>{EMAIL}</span>
      </a>
      <button
        type='button'
        onClick={handleCopy}
        className={`${styles.emailCopy} ${styles.focusable}`}
        data-state={state}
        aria-label='Copy email address'
      >
        <Icon size={15} strokeWidth={1.75} aria-hidden='true' />
        <span className={styles.emailCopyLabel} aria-hidden='true'>
          {LABELS[state]}
        </span>
      </button>
      <span role='status' className='sr-only'>
        {ANNOUNCEMENTS[state]}
      </span>
    </div>
  );
}
