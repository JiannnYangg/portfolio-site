import Image from 'next/image';

import { FooterBase, Headline } from './components';
import styles from './index.module.css';

/**
 * Site footer (#contact-footer). One picture behind everything: the footer
 * background (public/images/footer-bg.png), which fades in from the paper at
 * the top. It goes through next/image, so visitors get a small, right-sized
 * WebP/AVIF instead of the 2.9 MB original. The top four tile rows of the
 * picture are not shown (see index.module.css), so the footer is about one
 * screen tall and its first row of tiles lines up with the section above.
 * The site's dashed vertical guides stop at the footer's top edge.
 *   top     the call to action (headline, CTA, email)
 *   bottom  socials + back to top, then version and local time
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
          src='/images/footer-bg.png'
          alt=''
          fill
          sizes='100vw'
          quality={60}
          className={styles.bgImage}
        />
      </div>
      <Headline />
      <FooterBase />
    </footer>
  );
}
