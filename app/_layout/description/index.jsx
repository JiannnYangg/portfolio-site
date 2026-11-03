'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Balancer from 'react-wrap-balancer';

import { MagneticButton, ParallaxFade } from '@/components';

import {
  Dimension,
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

/** Line draws itself left to right (inset is negative so end ticks aren't clipped) */
const drawFrom = { clipPath: 'inset(-1em 100% -1em 0)' };
const drawTo = { clipPath: 'inset(-1em 0% -1em 0)' };

/**
 * The paragraph, split into plain runs and four editor's marks:
 *  - outline with two handles on a diagonal ("tested the waters")
 *  - dashed strike-through ("AI slop.")
 *  - dimension line with end ticks ("faster, better, scalable.")
 *  - closing outline, four handles, soft lift ("new status quo.")
 */
const segments = [
  { text: 'We' },
  { text: 'tested the waters', mark: 'outline', handles: ['tl', 'br'] },
  { text: 'of automation. Now we’re diving in, leaving no space for' },
  { text: 'AI slop.', mark: 'strike' },
  { text: 'Shipping' },
  { text: 'faster, better, scalable.', mark: 'dimension' },
  { text: 'Together, we’ll set the' },
  {
    text: 'new status quo.',
    mark: 'outline',
    handles: ['tl', 'tr', 'bl', 'br'],
    tint: true,
  },
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

function Decoration({ segment, delay }) {
  const { mark, handles = [], tint } = segment;

  if (mark === 'outline') {
    return (
      <Outline
        aria-hidden='true'
        $tint={tint}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay }}
      >
        <svg>
          <rect
            x='0.5'
            y='0.5'
            style={{ width: 'calc(100% - 1px)', height: 'calc(100% - 1px)' }}
          />
        </svg>
        {handles.map(pos => (
          <Handle key={pos} $pos={pos} />
        ))}
      </Outline>
    );
  }

  const Line = mark === 'strike' ? Strike : Dimension;

  return (
    <Line
      aria-hidden='true'
      initial={drawFrom}
      whileInView={drawTo}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    />
  );
}

export function Description() {
  let cursor = 0;
  let markCount = 0;

  const content = segments.map(segment => {
    const { text, mark } = segment;
    const start = cursor;
    cursor += text.split(' ').length;

    if (!mark) {
      return <Words key={start} text={text} start={start} />;
    }

    const delay = 0.8 + markCount * 0.2;
    markCount += 1;

    return (
      <Mark
        key={start}
        $outlined={mark === 'outline'}
        $fade={mark === 'strike'}
      >
        <Words text={text} start={start} inMark />
        <Decoration segment={segment} delay={delay} />
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
