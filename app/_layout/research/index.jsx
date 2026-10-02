'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import { MagneticButton } from '@/components';
import { researchPapers } from '@/data';

import { PageHero } from '../page-hero';

export function ResearchHero() {
  return <PageHero label='Publications' title='Research Papers' />;
}

function Pill({ children }) {
  return (
    <span className='rounded-full border border-solid px-4 py-1.5 text-sm'>
      {children}
    </span>
  );
}

export function ResearchList() {
  return (
    <main className='container relative py-[clamp(4em,10vw,10em)]'>
      <ul className='group'>
        {researchPapers.map(
          (
            { title, published, version, type, access, authors, href },
            index,
          ) => (
            <motion.li
              key={href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className='grid gap-6 border-t border-solid py-[clamp(2em,5vw,4.5em)] transition-opacity duration-300 last-of-type:border-b group-hover:opacity-60 hover:!opacity-100 lg:grid-cols-12 lg:gap-10'
            >
              <div className='flex flex-row items-baseline gap-4 lg:col-span-3 lg:flex-col lg:gap-3'>
                <span className='text-xs uppercase text-secondary-foreground'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className='text-base'>Published {published}</p>
                <p className='text-sm text-muted-foreground'>
                  Version {version}
                </p>
              </div>

              <div className='flex flex-col gap-6 lg:col-span-9'>
                <div className='flex flex-wrap gap-2'>
                  <Pill>{type}</Pill>
                  <Pill>{access}</Pill>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(1.5em, 2.6vw, 3.25em)',
                    lineHeight: 1.25,
                  }}
                >
                  {title}
                </h2>

                <p className='text-base text-muted-foreground'>
                  <span className='uppercase tracking-wide'>Author</span>
                  <span className='ms-3 text-foreground'>{authors}</span>
                </p>

                <div className='mt-2'>
                  <a
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`Read paper: ${title}`}
                  >
                    <MagneticButton
                      variant='outline'
                      className='gap-2 px-8 py-6 text-base before:-top-1/2 hover:text-background'
                    >
                      Read paper
                      <ArrowUpRight size={18} strokeWidth={1.5} />
                    </MagneticButton>
                  </a>
                </div>
              </div>
            </motion.li>
          ),
        )}
      </ul>
    </main>
  );
}
