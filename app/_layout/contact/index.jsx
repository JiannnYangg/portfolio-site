import Image from 'next/image';

import { FooterBase, Headline } from './components';
import styles from './index.module.css';

/**
 * Site footer (#contact-footer). One picture behind everything: the footer
 * background (public/images/footer-bg.webp, 1632x912), a field of rounded
 * tiles that fades from white at the top to deep blue at the bottom. It goes
 * through next/image, so visitors get a right-sized WebP/AVIF. The top 150px
 * of the picture are plain white, so they are not shown (see index.module.css)
 * and the footer is about one screen tall. The site's dashed vertical guides
 * stop at the footer's top edge.
 *   top     the call to action (headline, CTA, email) on the light part
 *   bottom  socials + back to top, then version and local time, in white on
 *           the deep blue part
 */
export function Contact() {
  return (
    <footer
      id='contact-footer'
      data-scroll-align='start'
      className={styles.root}
    >
      <div className={styles.bg} aria-hidden='true'>
        <Image
          src='/images/footer-bg.webp'
          alt=''
          fill
          sizes='100vw'
          quality={70}
          className={styles.bgImage}
        />
      </div>
      <Headline />
      <FooterBase />
    </footer>
  );
}
