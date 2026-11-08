'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

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
 * both lines always match. It grows with the screen (1.25rem to 2rem), which
 * is clearly bigger than before, and the lines simply wrap if a column is ever
 * too narrow: each D keeps its own marker swatch in one piece (nowrap), and
 * text-wrap: balance keeps the break from leaving a lone word.
 */
const NOTE_TEXT =
  'leading-relaxed [text-wrap:balance] [font-size:clamp(1.25rem,1.7vw,2rem)]';

/**
 * Hover colour of the circle: the brand pink (the end of the logo's gradient)
 * with dark text on top (about 6:1), instead of the default fill.
 */
const CIRCLE_HOVER =
  'before:bg-[#f0546b] after:bg-[#f0546b] hover:text-[#1f2024]';

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
    <article className='container relative'>
      {/* Two columns from lg up (stacked below it). The wrapping is set here with
          Tailwind's own lg breakpoint rather than a theme lookup, so the side
          note can never fall under the paragraph on a wide screen. */}
      <Wrapper className='flex-wrap lg:flex-nowrap'>
        <div className='basis-full lg:basis-[52%]'>
          <Frame>
            <Title>{content}</Title>
          </Frame>
        </div>

        {/* Right column, top-aligned with the paragraph: the side note, and the
            "About us" circle directly under it, pushed to the right edge of the
            column. The circle is in the normal flow (not pinned), so it can
            never overlap the text; the gap keeps clear air between the last
            line and the circle. The Wrapper's side padding (2.5em or more)
            keeps the circle well clear of the dashed guide on the right, and
            its bottom padding keeps it clear of the dashed line below. */}
        <div className='flex basis-full flex-col gap-10 sm:basis-7/12 lg:basis-[40%] lg:gap-14 lg:self-start lg:pt-2'>
          <ParallaxFade>
            <p className={NOTE_TEXT}>We bring together the four D&rsquo;s:</p>
            <p className={`mt-1 ${NOTE_TEXT}`}>
              <Highlight $variant='data'>Data</Highlight>,{' '}
              <Highlight $variant='design'>Design</Highlight>,{' '}
              <Highlight $variant='development'>Development</Highlight>,{' '}
              <Highlight $variant='distribution'>Distribution</Highlight>.
            </p>
          </ParallaxFade>

          <motion.div
            className='flex justify-end'
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
        </div>
      </Wrapper>
    </article>
  );
}
