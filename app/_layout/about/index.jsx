'use client';

import { motion } from 'framer-motion';

import { ParallaxFade, ParallaxReveal } from '@/components';

import { PageHero } from '../page-hero';

const heroLine = 'I help brands thrive.';

const intro =
  'My expertise in data analytics, marketing, content production, and agentic workflows creates a unique combination that focuses not just on delivering better results, but on optimizing them through iterative analytics.';

const tags = [
  'SEO',
  'GEO',
  'Meta Ads',
  'GA4',
  'Databases',
  'ML',
  'Modeling',
  'Agentic Loops',
];

const closing =
  "To be in this time of artificial intelligence, and now we call it super intelligence, it's hard to not test the waters of what an individual can achieve. That said, I am here to push the boundary of automation through orchestration, extracting the highest possible value per token. Prioritizing quality over slop, and remaining adaptable rather than confined to a single domain, I dig deep for the insights and expertise required to execute deliverables. This places me in a unique position, one where I believe adaptability is no longer just leverage, but an absolute prerequisite.";

/** Small uppercase section label, same style as the menu "Navigation" label. */
function Label({ children }) {
  return (
    <h5 className='border-b border-solid pb-3 text-xs uppercase text-secondary-foreground lg:border-b-0 lg:pb-0 lg:pt-3'>
      {children}
    </h5>
  );
}

export function AboutHero() {
  return <PageHero label='About me' title={heroLine} />;
}

export function AboutBody() {
  return (
    <main className='container relative'>
      <section className='grid gap-8 py-[clamp(4em,12vw,12em)] lg:grid-cols-12 lg:gap-10'>
        <div className='lg:col-span-3'>
          <Label>Overview</Label>
        </div>
        <h2
          className='lg:col-span-9'
          style={{ fontSize: 'clamp(1.5em, 2.2vw, 3em)', lineHeight: 1.45 }}
        >
          <ParallaxReveal paragraph={intro} />
        </h2>
      </section>

      <section className='grid gap-8 border-t border-solid py-[clamp(3em,8vw,8em)] lg:grid-cols-12 lg:gap-10'>
        <div className='lg:col-span-3'>
          <Label>Expertise</Label>
        </div>
        <ul className='flex flex-wrap gap-3 lg:col-span-9'>
          {tags.map((tag, index) => (
            <motion.li
              key={tag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
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
      </section>

      <section className='grid gap-8 border-t border-solid py-[clamp(3em,8vw,8em)] lg:grid-cols-12 lg:gap-10'>
        <div className='lg:col-span-3'>
          <Label>Approach</Label>
        </div>
        <div className='lg:col-span-7'>
          <ParallaxFade>
            <p className='text-lg leading-relaxed text-foreground/80 lg:text-xl lg:leading-relaxed'>
              {closing}
            </p>
          </ParallaxFade>
        </div>
      </section>
    </main>
  );
}
