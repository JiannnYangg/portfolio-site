import { EMAIL } from '../config';
import styles from '../index.module.css';
import { Sparkle } from './sparkles';

/** Top, paper-coloured half of the footer: the call to action. */
export function Headline() {
  return (
    <div className={styles.top}>
      <p className={styles.tag}>
        <span>Satyam Gupta</span>
        <span>Portfolio</span>
      </p>

      <h2 className={styles.headline}>
        <span className={`${styles.line} ${styles.ink}`}>
          Let’s work
          <Sparkle className={`${styles.star} ${styles.starBig}`} />
          <Sparkle className={`${styles.star} ${styles.starSmall}`} />
        </span>
        <span className={`${styles.line} ${styles.lime}`}>
          together!
          <a
            href={`mailto:${EMAIL}?subject=Hello%20Satyam`}
            className={`${styles.touch} ${styles.focusable}`}
          >
            <span>Get in</span> <span>touch</span>
          </a>
        </span>
      </h2>
    </div>
  );
}
