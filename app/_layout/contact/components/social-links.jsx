import { BookOpen, Github, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';

import { socialMedias } from '@/data';

import styles from '../index.module.css';
import { XMark } from './brand-icons';
import pendingStyles from './social-links.module.css';

const ICONS = {
  instagram: Instagram,
  github: Github,
  youtube: Youtube,
  zenodo: BookOpen, // Zenodo = where the research papers live
  twitter: XMark,
};

const isExternal = href => /^https?:\/\//.test(href);

/** A link counts as ready only when it is a non-empty string */
const hasLink = href => typeof href === 'string' && href.trim() !== '';

/**
 * Footer links from `socialMedias`, as icon + label chips, in the order of
 * that list. An item whose `href` is still empty (null, '' or spaces) is
 * shown as a dimmed, non-clickable "coming soon" chip, so the layout is final
 * today and there is never a dead button; it turns into a normal link as soon
 * as a link is filled in (app/_data).
 */
export function SocialLinks() {
  if (!Array.isArray(socialMedias) || socialMedias.length === 0) return null;

  return (
    <ul className={styles.socials} aria-label='Social links'>
      {socialMedias.map(({ id, href, title }) => {
        const Icon = ICONS[id];
        const icon = Icon && (
          <Icon size={18} strokeWidth={1.75} aria-hidden='true' />
        );

        if (!hasLink(href)) {
          return (
            <li key={id ?? title}>
              {/* no href: not a link, not focusable. role + aria-disabled let
                  screen readers announce it as an unavailable link. */}
              <span
                role='link'
                aria-disabled='true'
                title='Coming soon'
                className={pendingStyles.pending}
              >
                {icon}
                <span>{title}</span>
                <span className='sr-only'> (coming soon)</span>
              </span>
            </li>
          );
        }

        const external = isExternal(href);

        return (
          <li key={id ?? title}>
            <Link
              href={href}
              className={`${styles.chip} ${styles.focusable}`}
              {...(external && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
            >
              {icon}
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
