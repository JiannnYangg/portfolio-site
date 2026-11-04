import { GlassContent, Headline } from './components';
import styles from './index.module.css';

/**
 * Site footer (#contact-footer). One picture behind everything: the footer
 * background image (public/images/footer-bg.png) is painted on the footer
 * itself. On top of it, two halves like a poster:
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
      <Headline />
      <div className={styles.glass}>
        <GlassContent />
      </div>
    </footer>
  );
}
