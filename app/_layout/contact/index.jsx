import Image from 'next/image';

import { FooterBase, Headline } from './components';
import styles from './index.module.css';

/** 32x18 preview of the footer picture: shows instantly while the real one loads */
const FOOTER_BLUR =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAASACADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD0Sa8ii+8wH1oiu4pfusK4DUZL/U/39tcMR1AFZ1lrlzZS+XOSfevSjgOaOj1MPaO56vuGM5pqyKx4NcqNfVdOEit5hI6+nNUdP8VCSciQ7MdCawWDqNN9ivaGV4WZsN8x6ev1rK1wf6W/1oor2Ifx2ZdDQ03/AJAlz/wH+dZN0AI1IFFFXT+J+oj/2Q==';

/**
 * Site footer (#contact-footer). One picture behind everything: the footer
 * background (public/images/footer-bg.webp, 1632x912), a field of rounded
 * tiles that fades from white at the top to deep blue at the bottom. It goes
 * through next/image, so visitors get a right-sized AVIF/WebP (see
 * next.config.js). The source is a ~34 KB WebP, and a tiny blurred copy shows
 * while it loads. The top 150px
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
          quality={85}
          placeholder='blur'
          blurDataURL={FOOTER_BLUR}
          className={styles.bgImage}
        />
      </div>
      <Headline />
      <FooterBase />
    </footer>
  );
}
