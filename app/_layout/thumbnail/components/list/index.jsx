'use client';

import Link from 'next/link';

import { thumbnailOptions } from '@/data';

/**
 * @param {Object} props
 * @param {(index: number) => void} props.handlePointerEnter
 * @param {(index: number) => void} props.handlePointerLeave
 * @param {(x: number, y: number) => void} props.moveItems
 */
export function ThumbnailList({
  handlePointerEnter,
  handlePointerLeave,
  moveItems,
}) {
  const items = thumbnailOptions.map(({ href, title, tag }, index) => {
    const id = index;
    const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);
    const linkClassName =
      'flex items-center justify-between max-lg:flex-wrap';
    const content = (
      <>
        <h4
          style={{
            fontSize: 'calc(clamp(3.25em, 7vw, 8em) * 0.75)',
          }}
        >
          {title}
        </h4>
        <p className='text-lg font-medium'>{tag}</p>
      </>
    );
    return (
      <li
        key={`thumbnail-list-${id}`}
        className='border-t border-solid transition-all last-of-type:border-b group-hover:opacity-90'
        style={{
          paddingInline: 'calc(clamp(1em,3vw,4em) * 2)',
          paddingBlock: 'clamp(1em,3vw,4em)',
        }}
        onPointerEnter={({ clientX, clientY }) => {
          handlePointerEnter(id);
          moveItems(clientX, clientY);
        }}
        onPointerLeave={({ clientX, clientY }) => {
          handlePointerLeave(id);
          moveItems(clientX, clientY);
        }}
      >
        {href ? (
          <Link
            href={href}
            className={linkClassName}
            passHref
            {...(isExternal && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            {content}
          </Link>
        ) : (
          <div className={linkClassName}>{content}</div>
        )}
      </li>
    );
  });

  return <ul className='group'>{items}</ul>;
}
