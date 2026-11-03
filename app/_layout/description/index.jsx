'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Balancer from 'react-wrap-balancer';

import { MagneticButton, ParallaxFade } from '@/components';

import {
  Box,
  Frame,
  FrameRect,
  Handle,
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
 * The paragraph, split into plain runs and boxed phrases.
 * Each box gets its own handle layout so the frames feel asymmetric:
 *  - diagonal pair, opposite diagonal + strike, three handles, all four + tint.
 */
const segments = [
  { text: 'We' },
  { text: 'tested the waters', box: { handles: ['tl', 'br'] } },
  { text: 'of automation. Now we’re diving in, leaving no space for' },
  { text: 'AI slop.', box: { handles: ['tr', 'bl'], strike: true } },
  { text: 'Shipping' },
  { text: 'faster, better, scalable.', box: { handles: ['tl', 'tr', 'br'] } },
  { text: 'Together, we’ll set the' },
  {
    text: 'new status quo.',
    box: { handles: ['tl', 'tr', 'bl', 'br'], tint: true },
  },
];

function Words({ text, start, inBox }) {
  const words = text.split(' ');

  return words.map((word, n) => (
    <span
      // eslint-disable-next-line react/no-array-index-key
      key={`${start}-${n}`}
      className={`inline-flex overflow-hidden ${
        inBox && n === words.length - 1 ? '' : 'me-2'
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
  let boxCount = 0;

  const content = segments.map(({ text, box }) => {
    const start = cursor;
    cursor += text.split(' ').length;

    if (!box) {
      return <Words key={start} text={text} start={start} />;
    }

    const delay = 0.7 + boxCount * 0.18;
    boxCount += 1;

    return (
      <Box
        key={start}
        $tint={box.tint}
        $strike={box.strike}
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: box.strike ? 0.75 : 1, scale: 1 }}
        transition={{ duration: 0.45, delay }}
      >
        <Words text={text} start={start} inBox />
        {box.handles.map(pos => (
          <Handle key={pos} $pos={pos} aria-hidden='true' />
        ))}
        {box.strike && (
          <Strike
            aria-hidden='true'
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.45 }}
          />
        )}
      </Box>
    );
  });

  return (
    <article className='container relative'>
      <Wrapper>
        <div className='basis-full lg:basis-9/12'>
          <Frame>
            <FrameRect
              aria-hidden='true'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Handle $pos='tl' />
              <Handle $pos='br' />
            </FrameRect>
            <Title style={{ fontSize: 'inherit' }}>{content}</Title>
          </Frame>
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
