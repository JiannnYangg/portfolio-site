'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { MagneticButton, ParallaxFade } from '@/components';
import { useHashNav } from '@/hooks';

import {
  CIRCLE_GUARD,
  CIRCLE_HOVER,
  CIRCLE_SHAPE_BASE,
  CIRCLE_SIZE,
} from '../circle-button';
import { PAGE_INSET, PageHero } from '../page-hero';

const heroLine = 'We help brands thrive.';

/**
 * Overview paragraph, split so a few key phrases can carry the marker
 * highlight. `mark` = highlighted phrase, `tail` = punctuation that follows it
 * (kept outside the swatch so the marker only covers the words).
 */
const intro = [
  {
    text: 'We started our content creation journey in 2021 through Cliver Visions. With',
  },
  { text: '5+ years of experience', mark: true, tail: ',' },
  { text: 'and our expertise in data analytics, marketing, and' },
  { text: 'disruptive AI technologies', mark: true, tail: ',' },
  { text: 'this unique combination focuses not only on delivering' },
  { text: 'better results', mark: true, tail: ',' },
  { text: 'but on optimizing them through' },
  { text: 'iterative analytics', mark: true, tail: '.' },
];

/** Text sits inside the dashed guides, same inset as the rest of the site */
const inset = { paddingInline: PAGE_INSET };

/** Same word reveal used across the site */
const reveal = {
  initial: { y: '100%' },
  open: i => ({
    y: '0%',
    transition: { duration: 0.5, delay: 0.01 * i },
  }),
};

/**
 * Marker swatches: the same hand-placed highlighter shapes as the four D's on
 * the home intro (each one a hair off-level, with uneven edges), in the site's
 * theme blue (the Tailwind `primary`) instead of lime.
 */
const MARKER_BLUE = 'hsl(var(--primary) / 0.3)';

const SWATCHES = [
  {
    left: '-0.08em',
    right: '-0.04em',
    top: '50%',
    bottom: '8%',
    transform: 'rotate(-0.8deg)',
    clipPath: 'polygon(0 14%, 100% 0, 97% 100%, 2% 86%)',
  },
  {
    left: '-0.05em',
    right: '-0.1em',
    top: '46%',
    bottom: '10%',
    transform: 'rotate(0.6deg)',
    clipPath: 'polygon(3% 0, 98% 16%, 100% 92%, 0 100%)',
  },
  {
    left: '-0.1em',
    right: '-0.05em',
    top: '54%',
    bottom: '6%',
    transform: 'rotate(-0.5deg)',
    clipPath: 'polygon(0 0, 99% 12%, 100% 100%, 4% 82%)',
  },
  {
    left: '-0.04em',
    right: '-0.09em',
    top: '48%',
    bottom: '9%',
    transform: 'rotate(0.8deg)',
    clipPath: 'polygon(1% 16%, 100% 0, 95% 90%, 0 100%)',
  },
];

/** One word in its own mask, sliding up like the rest of the site's text */
function Word({ word, custom, gap }) {
  return (
    <span className={`inline-flex overflow-hidden ${gap ? 'me-2' : ''}`}>
      <motion.span
        custom={custom}
        variants={reveal}
        initial='initial'
        whileInView='open'
      >
        {word}
      </motion.span>
    </span>
  );
}

/** Word-by-word reveal with marker highlights behind the marked phrases */
function MarkedReveal({ segments }) {
  let cursor = 0;
  let markCount = 0;

  return segments.map(({ text, mark, tail }) => {
    const words = text.split(' ');
    const start = cursor;
    cursor += words.length + (tail ? 1 : 0);

    if (!mark) {
      return words.map((word, n) => (
        // eslint-disable-next-line react/no-array-index-key
        <Word key={`${start}-${n}`} word={word} custom={start + n} gap />
      ));
    }

    const swatch = SWATCHES[markCount % SWATCHES.length];
    markCount += 1;

    return (
      <span key={start} className='inline'>
        {/* nowrap keeps the swatch in one piece on a single line */}
        <span
          className={`relative isolate inline-block whitespace-nowrap align-top ${
            tail ? '' : 'me-2'
          }`}
        >
          <span
            aria-hidden='true'
            className='pointer-events-none absolute -z-10'
            style={{ ...swatch, backgroundColor: MARKER_BLUE }}
          />
          {words.map((word, n) => (
            <Word
              // eslint-disable-next-line react/no-array-index-key
              key={`${start}-${n}`}
              word={word}
              custom={start + n}
              gap={n < words.length - 1}
            />
          ))}
        </span>
        {tail && (
          <Word word={tail} custom={start + words.length} gap />
        )}
      </span>
    );
  });
}

/** Key phrase: brand-blue text on a soft tint. Wraps cleanly across lines. */
function Highlight({ children }) {
  return (
    <strong className='rounded-md bg-primary/10 px-1.5 py-0.5 font-normal text-primary box-decoration-clone'>
      {children}
    </strong>
  );
}

/** Small uppercase section label, same style as the menu "Navigation" label. */
function Label({ children }) {
  return (
    <h5 className='border-b border-solid pb-3 text-xs uppercase text-secondary-foreground lg:border-b-0 lg:pb-0 lg:pt-3'>
      {children}
    </h5>
  );
}

/** Where the Works circle goes: the pinned showcase on the home page */
const WORKS_HREF = '/#works';

/**
 * The home page's round "About us" button, as "Works": the very same circle
 * (size, shape, colours, magnetic hover), shared through ../circle-button. It
 * goes to the Works section of the home page. The navbar uses the same href:
 * the home page loads first, then (once its intro is done) the Transition
 * layout scrolls to #works, so the visitor lands on the showcase animation.
 */
function WorksButton() {
  const handleHashNav = useHashNav();

  return (
    <motion.div
      className='flex justify-end'
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Link
        href={WORKS_HREF}
        passHref
        className='shrink-0'
        onClick={event => handleHashNav(event, WORKS_HREF)}
      >
        <MagneticButton
          variant='ghost'
          size='xl'
          className={`${CIRCLE_SHAPE_BASE} ${CIRCLE_SIZE} ${CIRCLE_GUARD} ${CIRCLE_HOVER}`}
        >
          Works
        </MagneticButton>
      </Link>
    </motion.div>
  );
}

export function AboutHero() {
  return <PageHero label='About us' title={heroLine} inset balance />;
}

export function AboutBody() {
  return (
    <main className='container relative'>
      <section className='py-[clamp(4em,12vw,12em)]'>
        <div className='grid gap-8 lg:grid-cols-12 lg:gap-10' style={inset}>
          <div className='lg:col-span-3'>
            <Label>Overview</Label>
          </div>
          {/* The paragraph, and the Works circle on the free space under it,
              pushed to the right edge of the column (in the normal flow, so
              it can never overlap the text). */}
          <div className='flex flex-col gap-10 lg:col-span-9 lg:gap-14'>
            <h2 style={{ fontSize: 'clamp(1.5em, 2.2vw, 3em)', lineHeight: 1.45 }}>
              <MarkedReveal segments={intro} />
            </h2>
            <WorksButton />
          </div>
        </div>
      </section>

      <section className='border-t border-solid py-[clamp(3em,8vw,8em)]'>
        <div className='grid gap-8 lg:grid-cols-12 lg:gap-10' style={inset}>
          <div className='lg:col-span-3'>
            <Label>Approach</Label>
          </div>
          <div className='flex flex-col gap-8 lg:col-span-9 lg:gap-10'>
            {/* Lead statement */}
            <ParallaxFade>
              <p className='text-2xl leading-snug text-foreground lg:text-3xl lg:leading-snug'>
                To be in this time of artificial intelligence, and now we call
                it <Highlight>super intelligence</Highlight>, it&apos;s hard to
                not test the waters of automation.
              </p>
            </ParallaxFade>

            {/* Supporting copy */}
            <ParallaxFade>
              <p className='text-lg leading-relaxed text-foreground/70 lg:text-xl lg:leading-relaxed'>
                That said, we are here to push the{' '}
                <Highlight>boundary through orchestration</Highlight>, extracting
                the highest possible value per token. Prioritizing{' '}
                <Highlight>quality over slop</Highlight>, and remaining adaptable
                rather than confined to a single domain, we dig deep for the
                insights and expertise required to execute deliverables.
              </p>
            </ParallaxFade>

            {/* Closing pull-quote */}
            <ParallaxFade>
              <blockquote className='border-l-2 border-solid border-primary pl-6 lg:pl-8'>
                <p className='text-xl leading-snug text-foreground lg:text-2xl lg:leading-snug'>
                  This places us in a unique position, one where we believe
                  adaptability is no longer just leverage, but{' '}
                  <Highlight>an absolute prerequisite</Highlight>.
                </p>
              </blockquote>
            </ParallaxFade>
          </div>
        </div>
      </section>
    </main>
  );
}
