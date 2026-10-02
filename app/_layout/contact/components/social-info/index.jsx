'use client';

import Link from 'next/link';

import { MagneticButton } from '@/components';
import { socialMedias } from '@/data';
import { randomId } from '@/utils';

import { ListTitle } from './index.styled';
import { LocalTime } from './local-time';

export function SocialInfo() {
  const medias = socialMedias.map(({ href, title, icon: Icon }) => {
    const id = randomId();
    const content = (
      <span className='flex items-center gap-2'>
        <Icon size={18} strokeWidth={1.5} />
        {title}
      </span>
    );
    return (
      <li
        key={id}
        className='border-b border-solid border-b-transparent transition-all duration-300 ease-in-expo hover:border-b-border'
      >
        {href ? (
          <Link
            href={href}
            passHref
            {...(/^https?:\/\//.test(href) && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            <MagneticButton>{content}</MagneticButton>
          </Link>
        ) : (
          <span className='cursor-default'>{content}</span>
        )}
      </li>
    );
  });

  return (
    <div className='px-12 pb-4 pt-10'>
      <div className='flex flex-wrap items-stretch justify-between gap-5'>
        <div className='flex gap-8'>
          <div>
            <ListTitle>Version</ListTitle>
            <p className='mt-7'>2026 © Edition</p>
          </div>
          <div>
            <ListTitle>Local time</ListTitle>
            <p className='mt-7'>
              <LocalTime />
            </p>
          </div>
        </div>

        <div className='flex flex-col'>
          <ListTitle>Socials</ListTitle>
          <ul className='flex gap-8'>{medias}</ul>
        </div>
      </div>
    </div>
  );
}
