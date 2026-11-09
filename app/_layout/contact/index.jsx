import { FooterBase, Headline } from './components';
import styles from './index.module.css';

/**
 * Site footer (#contact-footer). The background is pure CSS (see .bg in
 * index.module.css): soft, asymmetric clouds of light orange, peach and beige
 * over a pale warm base. There is no picture any more, so nothing extra is
 * downloaded and nothing in it is dark. The top of the layer fades into the
 * site's paper, and the site's dashed vertical guides stop at the footer's top
 * edge.
 *   top     the call to action (headline, CTA, email)
 *   bottom  socials + back to top, then version and local time, in dark ink
 *           on the light orange clouds
 */
export function Contact() {
  return (
    <footer
      id='contact-footer'
      data-scroll-align='start'
      className={styles.root}
    >
      <div className={styles.bg} aria-hidden='true' />
      <Headline />
      <FooterBase />
    </footer>
  );
}
