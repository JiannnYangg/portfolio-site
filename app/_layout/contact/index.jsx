import { GlassContent, Headline } from './components';
import styles from './index.module.css';

/**
 * Site footer (#contact-footer). One picture behind everything: the footer
 * background image (public/images/footer-bg.png), which fades in from the
 * paper at the top. The site's dashed vertical guides stop at the footer's top
 * edge (the footer sits on solid paper), they do not run through it. On top,
 * two halves like a poster:
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
