import Image from 'next/image';

import { FooterBase, Headline } from './components';
import { FooterGrid } from './components/footer-grid';
import styles from './index.module.css';

/**
 * Site footer (#contact-footer). Three layers behind everything (see .bg and
 * .grid in index.module.css):
 *   1. soft, asymmetric clouds of light orange, peach and beige (pure CSS),
 *      which fade in slowly from the page's paper, so the page does not end
 *      in an edge
 *   2. the tile picture (public/images/footer-bg.webp, 1632x912): a field of
 *      rounded "ice cube" tiles. It is turned into a light tile pattern and
 *      screened over the clouds, so the tiles show up as lighter cream cubes
 *      on the orange and never darken it.
 *   3. the site's graph-paper grid, carried on from the page into the top of
 *      the footer and fading out as the orange takes over (FooterGrid), so
 *      the notebook paper dissolves into the tiles instead of stopping.
 * The picture goes through next/image, so visitors get a right-sized
 * AVIF/WebP (see next.config.js). On phones `cover` crops the wide picture to
 * a narrow slice but scales it to the footer's height, so `sizes` cannot be
 * 100vw there (that would ask for a small file and blow it up); the art is
 * soft and blurry, so a ~480px-wide request (1x to 2x of the screen) is plenty
 * and keeps phones off the largest file. The top 150px of the picture are plain
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
          sizes='(max-width: 767px) 480px, 100vw'
          quality={85}
          className={styles.bgImage}
        />
      </div>
      <FooterGrid className={styles.grid} />
      <Headline />
      <FooterBase />
    </footer>
  );
}
