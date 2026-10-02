import { AboutBody, AboutHero, Contact, Navbar, Transition } from '@/layout';

/** @type {import('next').Metadata} */
export const metadata = {
  title: 'About',
  description:
    'I help brands thrive. Data analytics, marketing, content production and agentic workflows, optimized through iterative analytics.',
};

export default function About() {
  return (
    <Transition>
      <Navbar />
      <AboutHero />
      <AboutBody />
      <Contact />
    </Transition>
  );
}
