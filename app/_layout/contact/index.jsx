import { GlassContent, Headline } from './components';
import styles from './index.module.css';

/**
 * Site footer (#contact-footer). One picture behind everything: the footer
 * background image (public/images/footer-bg.png), which fades in from the
 * page above so the two read as one surface. The site's dashed vertical
 * guides continue through it. On top, two halves like a poster:
 *   top    the call to action
 *   bottom the details (email, socials, version, local time)
 */
export function Contact() {
  return (
    <footer
      id='contact-footer'
      data-scroll-align='start'
      className={styles.root}
    >
      <span
        aria-hidden='true'
        className={`${styles.guide} ${styles.guideLeft}`}
      />
      <span
        aria-hidden='true'
        className={`${styles.guide} ${styles.guideRight}`}
      />
      <Headline />
      <div className={styles.glass}>
        <GlassContent />
      </div>
    </footer>
  );
}
