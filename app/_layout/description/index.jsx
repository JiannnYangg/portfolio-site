'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Balancer from 'react-wrap-balancer';

import { MagneticButton, ParallaxFade } from '@/components';

import {
  Handle,
  Mark,
  Outline,
  Strike,
  Title,
  Wrapper,
} from './index.styled';

/** Same word reveal used across the site */
const reveal = {
  initial: { y: '100%' },
  open: i => ({
    y: '0%',
    transition: { duration: 0.5, delay: 0.01 * i },
  }),
};

/**
 * The paragraph with just two marks:
 *  - dashed strike-through on "AI slop."
 *  - closing selection box (four handles, soft lime lift) on "new status quo."
 */
const segments = [
  {
    text: 'We tested the waters of automation. Now we’re diving in, leaving no space for',
  },
  { text: 'AI slop.', mark: 'strike' },
  { text: 'Shipping faster, better, scalable. Together, we’ll set the' },
  { text: 'new status quo.', mark: 'outline' },
];

function Words({ text, start, inMark }) {
  const words = text.split(' ');

  return words.map((word, n) => (
    <span
      // eslint-disable-next-line react/no-array-index-key
      key={`${start}-${n}`}
      className={`inline-flex overflow-hidden ${
        inMark && n === words.length - 1 ? '' : 'me-2'
      }`}
    >
      <motion.span
        custom={start + n}
        variants={reveal}
        initial='initial'
        whileInView='open'
      >
        {word}
      </motion.span>
    </span>
  ));
}

function Decoration({ mark, delay }) {
  if (mark === 'outline') {
    return (
      <Outline
        aria-hidden='true'
        $tint
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay }}
      >
        <svg>
          <rect
            x='1'
            y='1'
            rx='2'
            style={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }}
          />
        </svg>
        {['tl', 'tr', 'bl', 'br'].map(pos => (
          <Handle key={pos} $pos={pos} />
        ))}
      </Outline>
    );
  }

  return (
    <Strike
      aria-hidden='true'
      initial={{ clipPath: 'inset(-1em 100% -1em 0)' }}
      whileInView={{ clipPath: 'inset(-1em 0% -1em 0)' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    />
  );
}

export function Description() {
  let cursor = 0;
  let markCount = 0;

  const content = segments.map(({ text, mark }) => {
    const start = cursor;
    cursor += text.split(' ').length;

    if (!mark) {
      return <Words key={start} text={text} start={start} />;
    }

    const delay = 0.9 + markCount * 0.3;
    markCount += 1;

    return (
      <Mark key={start} $outlined={mark === 'outline'} $fade={mark === 'strike'}>
        <Words text={text} start={start} inMark />
        <Decoration mark={mark} delay={delay} />
      </Mark>
    );
  });

  return (
    <article className='container relative'>
      <Wrapper>
        <div className='basis-full lg:basis-9/12'>
          <Title>{content}</Title>
        </div>

        <div className='basis-7/12 lg:basis-3/12'>
          <ParallaxFade>
            <Balancer as='p' className='mt-2 text-base lg:text-lg'>
              My passion for designing, developing, distributing &amp; data these 4 D&apos;s position me in a unique place.
            </Balancer>
          </ParallaxFade>
        </div>

        <motion.div
          whileInView={{ y: '-15%' }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
          }}
        >
          <div className='absolute right-0 top-3/4 lg:top-full lg:me-10'>
            <Link href='/about' passHref>
              <MagneticButton variant='ghost' size='xl'>
                About me
              </MagneticButton>
            </Link>
          </div>
        </motion.div>
      </Wrapper>
    </article>
  );
}
