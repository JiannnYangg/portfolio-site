import styles from '../index.module.css';
import { EmailActions } from './copy-email';
import { GetInTouch } from './get-in-touch';
import { TogetherPill } from './together-pill';

/**
 * Top of the footer: the call to action. Same typeface, weight, size and
 * tracking as the hero headline (Inter Tight, semibold, -0.03em).
 *
 * One phrase, one baseline: "Let’s work" in deep navy ink, followed by the key
 * word as a glossy blue sticker pill (same gradient family, ring and inner
 * highlight as the CTA button below it). When the screen is too narrow for
 * both, the pill wraps to its own line. The word stays real, selectable text;
 * only the pill is styling. The sparkles sit on the pill's corner.
 *
 * Under it, one row of actions: the hero-style CTA and the email capsule.
 */
export function Headline() {
  return (
    <div className={styles.top}>
      <h2 className={styles.headline}>
        <span className={styles.phrase}>
          <span className={styles.ink}>Let’s work</span>
          <TogetherPill />
        </span>
      </h2>

      <div className={styles.actions}>
        <GetInTouch />
        <EmailActions />
      </div>
    </div>
  );
}
