'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Balancer from 'react-wrap-balancer';

import { MagneticButton, ParallaxFade } from '@/components';

import {
  Frame,
  FrameRect,
  Handle,
  Highlight,
  Mark,
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

/** The paragraph, with one solid strike on "AI slop." */
const segments = [
  {
    text: 'We tested the waters of automation. Now we’re diving in, leaving no space for',
  },
  { text: 'AI slop.', strike: true },
  {
    text: 'Shipping faster, better, scalable. Together, we’ll set the new status quo.',
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

export function Description() {
  let cursor = 0;

  const content = segments.map(({ text, strike }) => {
    const start = cursor;
    cursor += text.split(' ').length;

    if (!strike) {
      return <Words key={start} text={text} start={start} />;
    }

    return (
      <Mark key={start}>
        <Words text={text} start={start} inMark />
        <Strike
          aria-hidden='true'
          initial={{ clipPath: 'inset(-1em 100% -1em 0)' }}
          whileInView={{ clipPath: 'inset(-1em 0% -1em 0)' }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 1.1 }}
        />
      </Mark>
    );
  });

  return (
    <article className='container relative'>
      <Wrapper>
        <div className='basis-full lg:basis-8/12'>
          <Frame>
            <FrameRect
              aria-hidden='true'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <svg>
                <rect
                  x='1'
                  y='1'
                  style={{
                    width: 'calc(100% - 2px)',
                    height: 'calc(100% - 2px)',
                  }}
                />
              </svg>
              {['tl', 'tr', 'bl', 'br'].map(pos => (
                <Handle key={pos} $pos={pos} />
              ))}
            </FrameRect>
            <Title>{content}</Title>
          </Frame>
        </div>

        {/* side note: top-aligned with the text block, well away from the
            "About me" circle that hangs below the section */}
        <div className='basis-10/12 sm:basis-7/12 lg:basis-3/12 lg:self-start'>
          <ParallaxFade>
            <Balancer
              as='p'
              className='text-base leading-loose lg:text-lg lg:leading-loose'
            >
              We bring together the four D&rsquo;s:{' '}
              <Highlight $variant='data'>Data</Highlight>,{' '}
              <Highlight $variant='design'>Design</Highlight>,{' '}
              <Highlight $variant='development'>Development</Highlight>,{' '}
              <Highlight $variant='distribution'>Distribution</Highlight>.
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
          <div className='absolute right-0 top-full lg:me-10'>
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
