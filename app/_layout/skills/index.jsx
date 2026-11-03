'use client';

import { Fragment } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { PARTITION_LINE } from '@/components';

/**
 * Skill groups, in the order a project actually flows:
 * Create (make the thing) -> Grow (get it seen and converting) -> Build (the
 * AI systems behind it). Inside each group the tags follow the same flow:
 * strategy -> writing -> production -> post, acquisition -> conversion ->
 * measurement, models -> training -> evaluation -> agents.
 */
const GROUPS = [
  {
    index: '01',
    title: 'Create',
    note: 'Content & creativity',
    tags: [
      'Content Strategy',
      'Brand Storytelling',
      'Copywriting',
      'UGC',
      'Short-form Reels',
      'Cinematography',
      'Motion Graphics',
      'SFX',
    ],
  },
  {
    index: '02',
    title: 'Grow',
    note: 'Digital marketing',
    tags: [
      'SEO',
      'GEO',
      'Google Ads',
      'Meta Ads',
      'Cold Mails',
      'Lead Gen',
      'Funnels',
      'Marketing Automation',
      'GTM',
      'GA4',
    ],
  },
  {
    index: '03',
    title: 'Build',
    note: 'AI & systems',
    tags: [
      'Modelling',
      'GraphRAG',
      'QLoRA',
      'Full Fine-tuning',
      'Distillation',
      'Evals',
      'Agentic Workflows',
      'Agentic Loops',
    ],
  },
];

/** Same colour and dash rhythm as the site-wide <Partition /> line */
const DASHES = `repeating-linear-gradient(to right, ${PARTITION_LINE} 0 7px, transparent 7px 13px)`;

/**
 * Same inset the intro box above uses (Description), so the text sits inside
 * the dashed guides instead of touching them.
 */
const INSET = 'clamp(2.5em, 4vw, 8em)';

/**
 * The word reveal used by the intro paragraph (Description): every word sits
 * in its own mask and slides up from below it (y 100% -> 0%, 0.5s, tiny
 * per-word delay). Like the intro, it replays when the text scrolls out of
 * view and back in.
 */
const WORD = {
  initial: { y: '100%' },
  open: delay => ({
    y: '0%',
    transition: { duration: 0.5, delay },
  }),
};

/** Mask: carries only the in-view trigger and hands the labels to its word */
const MASK = { initial: {}, open: {} };

/** Gap between words, relative to the font size so it matches every size */
const WORD_GAP = '0.3em';

/**
 * Extra room inside the mask, cancelled out by an equal negative margin, so
 * descenders (g, y, p) and tall capitals are never clipped by the mask while
 * the line box keeps its normal height.
 */
const MASK_PAD = '0.14em';

/** Longest stagger between tags, so a long list never feels slow */
const MAX_STAGGER_STEPS = 10;
const TAG_STAGGER = 0.05;

/**
 * Text that pops up word by word, exactly like the intro paragraph.
 *
 * - The scroll trigger lives on the mask (a normal in-flow box), not on the
 *   moving word, so it fires reliably even though the word starts fully
 *   hidden underneath the mask.
 * - Users who prefer reduced motion get the plain text, no movement.
 * - Empty or non-string text renders nothing instead of crashing.
 */
function RevealText({ text, delay = 0, step = 0.01 }) {
  const reduceMotion = useReducedMotion();

  if (typeof text !== 'string') return null;

  const words = text.split(/\s+/).filter(Boolean);

  if (words.length === 0) return null;
  if (reduceMotion) return text;

  return words.map((word, n) => (
    <motion.span
      // eslint-disable-next-line react/no-array-index-key
      key={`${word}-${n}`}
      className='inline-flex overflow-hidden align-baseline'
      style={{
        paddingBlock: MASK_PAD,
        marginBlock: `-${MASK_PAD}`,
        marginInlineEnd: n < words.length - 1 ? WORD_GAP : 0,
      }}
      variants={MASK}
      initial='initial'
      whileInView='open'
    >
      <motion.span custom={delay + n * step} variants={WORD}>
        {word}
      </motion.span>
    </motion.span>
  ));
}

/** Full-width dashed line between groups: the site's dashed partition style
 *  (no labels), drawing itself in from the left like the others. */
function DashedDivider() {
  return (
    <div
      aria-hidden='true'
      className='pointer-events-none relative h-0.5 w-full select-none'
    >
      <motion.span
        className='absolute inset-0 block origin-left'
        style={{ backgroundImage: DASHES }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      />
    </div>
  );
}

/** One tag pill: the pill fades in, its dot pops, its words slide up. */
function Tag({ tag, position }) {
  const reduceMotion = useReducedMotion();
  const delay = Math.min(position, MAX_STAGGER_STEPS) * TAG_STAGGER;

  const pillMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        transition: { duration: 0.4, delay },
      };

  const dotMotion = reduceMotion
    ? {}
    : {
        initial: { scale: 0 },
        whileInView: { scale: 1 },
        transition: {
          type: 'spring',
          stiffness: 520,
          damping: 16,
          delay: delay + 0.12,
        },
      };

  return (
    <motion.li
      {...pillMotion}
      className='flex cursor-default items-center gap-3 rounded-full border border-solid px-6 py-3 text-base transition-colors duration-300 ease-in-expo hover:bg-foreground hover:text-background lg:text-xl'
    >
      <motion.span
        aria-hidden='true'
        {...dotMotion}
        className='h-1.5 w-1.5 shrink-0 rounded-full bg-primary'
      />
      <span>
        <RevealText text={tag} delay={delay + 0.1} />
      </span>
    </motion.li>
  );
}

function Group({ index, title, note, tags = [] }) {
  return (
    <section className='container relative'>
      <div
        className='grid gap-6 py-[clamp(2.5em,6vw,5em)] lg:grid-cols-12 lg:gap-10'
        style={{ paddingInline: INSET }}
      >
        <div className='flex flex-col gap-2 lg:col-span-3 lg:pt-3'>
          <h5 className='text-xs uppercase text-secondary-foreground'>
            <RevealText text={`${index} / ${note}`} />
          </h5>
          <h3
            className='font-medium leading-none tracking-tight'
            style={{ fontSize: 'clamp(2rem, 3.4vw, 3.5rem)' }}
          >
            <RevealText text={title} delay={0.1} />
          </h3>
        </div>

        <ul className='flex flex-wrap gap-3 lg:col-span-9'>
          {tags.map((tag, i) => (
            <Tag key={tag} tag={tag} position={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Skills() {
  return (
    <>
      {GROUPS.map((group, i) => (
        <Fragment key={group.title}>
          {i > 0 && <DashedDivider />}
          <Group {...group} />
        </Fragment>
      ))}
    </>
  );
}
