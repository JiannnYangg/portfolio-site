'use client';

import { motion } from 'framer-motion';
import { ArrowDownLeft } from 'lucide-react';

import { MagneticButton } from '@/components';

import { Container, MainTitle, Row } from './index.styled';

/**
 * @param {Object} props
 * @param {import('framer-motion').MotionValue<number>} props.transformX
 */
export function UserDetails({ transformX }) {
  return (
    <Container>
      <Row>
        <div className='flex items-center gap-8'>
          <MainTitle>Let’s work</MainTitle>
        </div>
        <div className='flex items-center justify-between'>
          <MainTitle>together</MainTitle>
          <div>
            <ArrowDownLeft size={28} strokeWidth={1.25} />
          </div>
        </div>
      </Row>

      <Row>
        <div className='relative w-full'>
          <div className='h-[1px] bg-muted-foreground' />
          <div className='absolute right-0 top-0 z-20 -translate-x-1/2 -translate-y-1/2'>
            <motion.div style={{ x: transformX }}>
              <a
                href='https://mail.google.com/mail/?view=cm&fs=1&to=satyamgupta.social@gmail.com'
                target='_blank'
                rel='noopener noreferrer'
              >
                <MagneticButton variant='primary' size='lg'>
                  Get in touch
                </MagneticButton>
              </a>
            </motion.div>
          </div>
        </div>
      </Row>

      <Row>
        <div className='flex w-full flex-col gap-4 lg:flex-row'>
          <div>
            <a
              href='https://mail.google.com/mail/?view=cm&fs=1&to=satyamgupta.social@gmail.com'
              target='_blank'
              rel='noopener noreferrer'
            >
              <MagneticButton
                variant='outline'
                size='md'
                className='w-full border-muted-foreground'
              >
                satyamgupta.social@gmail.com
              </MagneticButton>
            </a>
          </div>
        </div>
      </Row>
    </Container>
  );
}
