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

/** Key phrase: brand-blue text on a soft tint. Wraps cleanly across lines. */
function Highlight({ children }) {
  return (
    <strong className='rounded-md bg-primary/10 px-1.5 py-0.5 font-normal text-primary box-decoration-clone'>
      {children}
    </strong>
  );
}

/** Secondary emphasis: full-contrast text with a brand-blue underline. */
function Underline({ children }) {
  return (
    <strong className='font-normal text-foreground underline decoration-primary decoration-2 underline-offset-4'>
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
        <div className='flex flex-col gap-8 lg:col-span-7 lg:gap-10'>
          {/* Lead statement */}
          <ParallaxFade>
            <p className='text-2xl leading-snug text-foreground lg:text-3xl lg:leading-snug'>
              To be in this time of artificial intelligence, and now we call it{' '}
              <Highlight>super intelligence</Highlight>, it&apos;s hard to not
              test the waters of{' '}
              <Underline>what an individual can achieve</Underline>.
            </p>
          </ParallaxFade>

          {/* Supporting copy */}
          <ParallaxFade>
            <p className='text-lg leading-relaxed text-foreground/70 lg:text-xl lg:leading-relaxed'>
              That said, I am here to push the boundary of{' '}
              <Highlight>automation through orchestration</Highlight>,
              extracting the <Highlight>highest possible value per token</Highlight>.
              Prioritizing <Underline>quality over slop</Underline>, and
              remaining <Underline>adaptable</Underline> rather than confined to
              a single domain, I dig deep for the insights and expertise
              required to execute deliverables.
            </p>
          </ParallaxFade>

          {/* Closing pull-quote */}
          <ParallaxFade>
            <blockquote className='border-l-2 border-solid border-primary pl-6 lg:pl-8'>
              <p className='text-xl leading-snug text-foreground lg:text-2xl lg:leading-snug'>
                This places me in a unique position, one where I believe{' '}
                <Highlight>adaptability</Highlight> is no longer just leverage,
                but <Highlight>an absolute prerequisite</Highlight>.
              </p>
            </blockquote>
          </ParallaxFade>
        </div>
      </section>
    </main>
  );
}
