import styles from '../index.module.css';
import { EmailActions } from './copy-email';
import { GetInTouch } from './get-in-touch';
import { Sparkle } from './sparkles';

/**
 * Top of the footer: the call to action. Same typeface, weight, size and
 * tracking as the hero headline (Inter Tight, semibold, -0.03em); the key word
 * is extra-bold italic like the hero's emphasis words, filled with the same
 * blue gradient as the CTA. No highlight bars, no selection handles.
 *
 * Under it, one row of actions: the hero-style CTA and the email capsule.
 */
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
          <em className={styles.together}>together!</em>
        </span>
      </h2>

      <div className={styles.actions}>
        <GetInTouch />
        <EmailActions />
      </div>
    </div>
  );
}
