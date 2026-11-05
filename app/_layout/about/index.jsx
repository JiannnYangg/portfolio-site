'use client';

import { ParallaxFade, ParallaxReveal } from '@/components';

import { PageHero } from '../page-hero';

const heroLine = 'We help brands thrive.';

const intro =
  'We started our content creation journey in 2021 through Cliver Visions. With 5+ years of experience in content production, and our expertise in data analytics, marketing, and disruptive AI technologies, this unique combination focuses not only on delivering better results, but on optimizing them through iterative analytics.';

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

export function AboutHero() {
  return <PageHero label='About us' title={heroLine} />;
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
          <Label>Approach</Label>
        </div>
        <div className='flex flex-col gap-8 lg:col-span-7 lg:gap-10'>
          {/* Lead statement */}
          <ParallaxFade>
            <p className='text-2xl leading-snug text-foreground lg:text-3xl lg:leading-snug'>
              To be in this time of artificial intelligence, and now we call it{' '}
              <Highlight>super intelligence</Highlight>, it&apos;s hard to not
              test the waters of automation.
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
      </section>
    </main>
  );
}
