import styles from '../index.module.css';
import { EmailActions } from './copy-email';
import { GetInTouch } from './get-in-touch';
import { Sparkle } from './sparkles';

/**
 * Top of the footer: the call to action. Same typeface, weight, size and
 * tracking as the hero headline (Inter Tight, semibold, -0.03em); the key word
 * is extra-bold italic like the hero's emphasis words.
 *
 * The key word is solid ink (readable on any part of the tile background) and
 * carries the brand blue as a hand-drawn marker underline behind it, instead
 * of a gradient fill that clashed with the green tiles. The underline is
 * decorative (aria-hidden) and the word itself stays real, selectable text.
 *
 * Under it, one row of actions: the hero-style CTA and the email capsule.
 */
function MarkerUnderline() {
  return (
    <svg
      className={styles.underline}
      viewBox='0 0 250 10'
      preserveAspectRatio='none'
      aria-hidden='true'
      focusable='false'
    >
      <defs>
        <linearGradient id='ft-underline-grad' x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0%' stopColor='#5068f0' />
          <stop offset='55%' stopColor='#445ae9' />
          <stop offset='100%' stopColor='#2b3bb8' />
        </linearGradient>
      </defs>
      <path
        className={styles.underlinePath}
        d='M3 6.5 C 28 2.2, 52 9, 80 5 S 128 2.5, 156 5.8 S 214 8.4, 247 3.6'
        pathLength='1'
        fill='none'
        stroke='url(#ft-underline-grad)'
        strokeLinecap='round'
      />
    </svg>
  );
}

export function Headline() {
  return (
    <div className={styles.top}>
      <h2 className={styles.headline}>
        <span className={styles.line}>
          <span className={styles.ink}>Let’s work</span>
          <Sparkle className={`${styles.star} ${styles.starBig}`} />
          <Sparkle className={`${styles.star} ${styles.starSmall}`} />
        </span>
        <span className={`${styles.line} ${styles.lineIndent}`}>
          <em className={styles.together}>
            together!
            <MarkerUnderline />
          </em>
        </span>
      </h2>

      <div className={styles.actions}>
        <GetInTouch />
        <EmailActions />
      </div>
    </div>
  );
}
