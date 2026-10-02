import { Center, MagneticButton } from '@/components';

/** @param {import('react').PropsWithChildren<unknown>} */
export function ThumbnailAction({ children }) {
  return (
    <Center>
      <a
        href='https://mail.google.com/mail/?view=cm&fs=1&to=satyamgupta.social@gmail.com'
        target='_blank'
        rel='noopener noreferrer'
      >
        <MagneticButton
          variant='outline'
          className='px-10 py-8 text-base before:-top-1/2 hover:text-background'
        >
          {children}
        </MagneticButton>
      </a>
    </Center>
  );
}
