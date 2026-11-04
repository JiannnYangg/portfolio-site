import styles from '../index.module.css';
import { BackToTop } from './back-to-top';
import { EmailActions } from './copy-email';
import { LocalTime } from './local-time';
import { SocialLinks } from './social-links';

/** Everything written on top of the glass tiles. */
export function GlassContent() {
  return (
    <div className={styles.content}>
      <div>
        <p className={styles.statement}>
          <span>Helping</span>
          <span>brands</span>
          <span className={styles.quiet}>thrive.</span>
        </p>
        <EmailActions />
      </div>

      <div className={styles.base}>
        <SocialLinks />

        <dl className={styles.meta}>
          <div>
            <dt>Version</dt>
            <dd>2026 © Edition</dd>
          </div>
          <div>
            <dt>Local time</dt>
            <dd>
              <LocalTime />
            </dd>
          </div>
        </dl>

        <BackToTop />
      </div>
    </div>
  );
}
