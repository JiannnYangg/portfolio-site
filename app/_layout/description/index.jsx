'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Balancer from 'react-wrap-balancer';

import { MagneticButton, ParallaxFade } from '@/components';

import {
  Frame,
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
    text: 'We automate everything except taste, killing',
  },
  { text: 'AI slop.', strike: true },
  {
    text: 'Shipping faster, better, scalable. Together, we’ll set the new status quo.',
  },
];

/**
 * ONE font size for the whole side note (the intro line and the four D's), so
 * both lines always match. It is as large as 1.3rem, and only steps down when
 * the column is too narrow for the four D's to stay on a single line.
 */
const NOTE_TEXT = 'leading-loose [font-size:min(1.3rem,4.4cqw)]';

/**
 * Hover colour of the circle: the theme lime (same as the CTA's hover) with
 * dark text on top, instead of the default blue fill.
 */
const CIRCLE_HOVER =
  'before:bg-[#b6f500] after:bg-[#b6f500] hover:text-[#1f2024]';

/**
 * Shape of the circle. The default "xl" button size is padding-driven, which
 * made the box ~204x184px (an oval). A fixed square with no padding is a true
 * circle. isolate + the radial mask make the rounded clip anti-alias cleanly
 * while the hover layers animate inside it (the usual jagged-edge fix for
 * overflow-hidden + border-radius + transforms).
 */
const CIRCLE_SHAPE =
  'h-[12.5rem] w-[12.5rem] p-0 isolate will-change-transform [-webkit-mask-image:-webkit-radial-gradient(white,black)]';

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
    /* lg:pb-10: extra room under the section. The circle is pinned a fixed
       distance above the bottom edge, so this pushes it further down, clear
       of the "Distribution." text, without moving it closer to the line. */
    <article className='container relative lg:pb-10'>
      <Wrapper>
        <div className='basis-full lg:basis-[54%]'>
          <Frame>
            <Title>{content}</Title>
          </Frame>
        </div>

        {/* side note: top-aligned with the paragraph. It is a size container so
            the text can scale to keep the four D's on ONE line. */}
        <div
          className='basis-full sm:basis-7/12 lg:basis-[38%] lg:self-start lg:pt-2'
          style={{ containerType: 'inline-size' }}
        >
          <ParallaxFade>
            <Balancer as='p' className={NOTE_TEXT}>
              We bring together the four D&rsquo;s:
            </Balancer>
            {/* one line, never wraps, same size as the line above */}
            <p className={`whitespace-nowrap ${NOTE_TEXT}`}>
              <Highlight $variant='data'>Data</Highlight>,{' '}
              <Highlight $variant='design'>Design</Highlight>,{' '}
              <Highlight $variant='development'>Development</Highlight>,{' '}
              <Highlight $variant='distribution'>Distribution</Highlight>.
            </p>
          </ParallaxFade>
        </div>

        {/* "About us" circle: sits INSIDE the section, bottom-right, a little
            above the dashed line and inside the right guide. On small screens
            it simply follows the text, right-aligned. */}
        <motion.div
          className='flex basis-full justify-end lg:absolute lg:bottom-12 lg:right-14 lg:basis-auto'
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Link href='/about' passHref>
            <MagneticButton
              variant='ghost'
              size='xl'
              className={`${CIRCLE_SHAPE} ${CIRCLE_HOVER}`}
            >
              About us
            </MagneticButton>
          </Link>
        </motion.div>
      </Wrapper>
    </article>
  );
}
