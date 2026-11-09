import Image from 'next/image';

import { FooterBase, Headline } from './components';
import styles from './index.module.css';

/**
 * Site footer (#contact-footer). Two layers behind everything (see .bg in
 * index.module.css):
 *   1. soft, asymmetric clouds of light orange, peach and beige (pure CSS)
 *   2. the tile picture (public/images/footer-bg.webp, 1632x912): a field of
 *      rounded "ice cube" tiles. It is turned into a light tile pattern and
 *      screened over the clouds, so the tiles show up as lighter cream cubes
 *      on the orange and never darken it.
 * The picture goes through next/image, so visitors get a right-sized
 * AVIF/WebP (see next.config.js). The top 150px of the picture are plain
 * white, so they are not shown and the footer is about one screen tall. The
 * site's dashed vertical guides stop at the footer's top edge.
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
      <div className={styles.bg} aria-hidden='true'>
        <Image
          src='/images/footer-bg.webp'
          alt=''
          fill
          sizes='100vw'
          quality={85}
          className={styles.bgImage}
        />
      </div>
      <Headline />
      <FooterBase />
    </footer>
  );
}
