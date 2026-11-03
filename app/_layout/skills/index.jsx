'use client';

import { motion } from 'framer-motion';

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

function Group({ index, title, note, tags, isFirst }) {
  return (
    <div
      className={`grid gap-6 py-[clamp(2.5em,6vw,5em)] lg:grid-cols-12 lg:gap-10 ${
        isFirst ? '' : 'border-t border-solid'
      }`}
    >
      <div className='flex items-baseline justify-between gap-4 border-b border-solid pb-3 lg:col-span-3 lg:flex-col lg:items-start lg:justify-start lg:gap-2 lg:border-b-0 lg:pb-0 lg:pt-3'>
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
  );
}

export function Skills() {
  return (
    <section className='container relative'>
      {GROUPS.map((group, i) => (
        <Group key={group.title} {...group} isFirst={i === 0} />
      ))}
    </section>
  );
}
