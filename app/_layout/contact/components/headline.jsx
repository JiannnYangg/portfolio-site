import styles from '../index.module.css';
import { EmailActions } from './copy-email';
import { GetInTouch } from './get-in-touch';
import { Sparkle } from './sparkles';

/**
 * Top of the footer: the call to action. Same typeface, weight, size and
 * tracking as the hero headline (Inter Tight, semibold, -0.03em).
 *
 * The key word is a glossy blue "sticker" pill (same gradient, ring and inner
 * highlight as the CTA button below it) with white extra-bold italic text, set
 * at a slight tilt. It stays real, selectable text; only the pill is styling.
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
