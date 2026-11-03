import { Partition } from '@/components';
import {
  Contact,
  Navbar,
  ResearchHero,
  ResearchList,
  Transition,
} from '@/layout';

/** @type {import('next').Metadata} */
export const metadata = {
  title: 'Research Papers',
  description:
    'Research papers by Satyam Gupta on media studies and GUI native video editing agents.',
};

export default function ResearchPapers() {
  return (
    <Transition>
      <Navbar tone='dark' />
      <ResearchHero />
      <Partition name='Papers' index='01' />
      <ResearchList />
      <Partition name='Contact' index='02' />
      <Contact />
    </Transition>
  );
}
