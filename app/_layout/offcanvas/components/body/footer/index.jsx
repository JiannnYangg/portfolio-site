'use client';

import Link from 'next/link';

import { MagneticButton } from '@/components';
import { socialMedias } from '@/data';

export function OffcanvasFooter() {
  const medias = socialMedias
    .filter(({ inMenu }) => inMenu !== false)
    .map(({ id, href, title }) => {
      return (
        <li key={id ?? title}>
          {href ? (
            <Link href={href} target='_blank' rel='noopener' passHref>
              <MagneticButton>{title}</MagneticButton>
            </Link>
          ) : (
            <span>{title}</span>
          )}
        </li>
      );
    });

  return <ul className='flex w-full justify-between gap-10'>{medias}</ul>;
}
