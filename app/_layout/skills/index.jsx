'use client';

import { Fragment } from 'react';

import { motion } from 'framer-motion';

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

function Group({ index, title, note, tags }) {
  return (
    <section className='container relative'>
      <div
        className='grid gap-6 py-[clamp(2.5em,6vw,5em)] lg:grid-cols-12 lg:gap-10'
        style={{ paddingInline: INSET }}
      >
        <div className='flex flex-col gap-2 lg:col-span-3 lg:pt-3'>
          <h5 className='text-xs uppercase text-secondary-foreground'>
            {index} / {note}
          </h5>
          <h3
            className='font-medium leading-none tracking-tight'
            style={{ fontSize: 'clamp(2rem, 3.4vw, 3.5rem)' }}
          >
            {title}
          </h3>
        </div>

        <ul className='flex flex-wrap gap-3 lg:col-span-9'>
          {tags.map((tag, i) => (
            <motion.li
              key={tag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className='flex cursor-default items-center gap-3 rounded-full border border-solid px-6 py-3 text-base transition-colors duration-300 ease-in-expo hover:bg-foreground hover:text-background lg:text-xl'
            >
              <span
                aria-hidden='true'
                className='h-1.5 w-1.5 rounded-full bg-primary'
              />
              {tag}
            </motion.li>
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
