import styles from '../index.module.css';
import { BackToTop } from './back-to-top';
import { LocalTime } from './local-time';
import { SocialLinks } from './social-links';

/**
 * Bottom of the footer, two rows:
 *   1. social chips on the left, "Back to top" on the right (one line)
 *   2. a hairline, then the version on the left and the live local time on
 *      the right
 */
export function FooterBase() {
  return (
    <div className={styles.base}>
      <div className={styles.baseRow}>
        <SocialLinks />
        <BackToTop />
      </div>

      <dl className={styles.meta}>
        <div className={styles.metaItem}>
          <dt>Version</dt>
          <dd>2026 © Edition</dd>
        </div>
        <div className={`${styles.metaItem} ${styles.metaTime}`}>
          <dt>Local time</dt>
          <dd>
            <span className={styles.live} aria-hidden='true' />
            <LocalTime />
          </dd>
        </div>
      </dl>
    </div>
  );
}
