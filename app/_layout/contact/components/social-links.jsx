import { BookOpen, Github, Instagram } from 'lucide-react';
import Link from 'next/link';

import { socialMedias } from '@/data';

import styles from '../index.module.css';
import { XMark } from './brand-icons';

const ICONS = {
  instagram: Instagram,
  github: Github,
  zenodo: BookOpen, // Zenodo = where the research papers live
  twitter: XMark,
};

const isExternal = href => /^https?:\/\//.test(href);

/**
 * Footer links from `socialMedias`, as icon + label chips. An item whose
 * `href` is still null is left out, so the live site never shows a dead
 * button; it appears as soon as a link is filled in (app/_data).
 */
export function SocialLinks() {
  const items = socialMedias.filter(({ href }) => Boolean(href));

  if (items.length === 0) return null;

  return (
    <ul className={styles.socials} aria-label='Social links'>
      {items.map(({ id, href, title }) => {
        const Icon = ICONS[id];
        const external = isExternal(href);

        return (
          <li key={id}>
            <Link
              href={href}
              className={`${styles.chip} ${styles.focusable}`}
              {...(external && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
            >
              {Icon && <Icon size={18} strokeWidth={1.75} aria-hidden='true' />}
              <span>{title}</span>
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
