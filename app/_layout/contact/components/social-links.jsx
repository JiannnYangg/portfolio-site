import Link from 'next/link';

import { socialMedias } from '@/data';

import styles from '../index.module.css';

const isExternal = href => /^https?:\/\//.test(href);

/**
 * Footer links from `socialMedias`. An item with `href: null` is shown but
 * is not a link (same rule as the data file says).
 */
export function SocialLinks() {
  return (
    <ul className={styles.links}>
      {socialMedias.map(({ href, title }) => {
        if (!href) {
          return (
            <li key={title}>
              <span className={styles.muted}>{title}</span>
            </li>
          );
        }

        const external = isExternal(href);

        return (
          <li key={title}>
            <Link
              href={href}
              className={`${styles.link} ${styles.focusable}`}
              {...(external && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
            >
              {title}
              {external && (
                <span className='sr-only'> (opens in a new tab)</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
