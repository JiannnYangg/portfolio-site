import { Partition } from '@/components';
import {
  Contact,
  Description,
  Header,
  Navbar,
  Project,
  Thumbnail,
  Transition,
} from '@/layout';

/** @type {import('next').Metadata} */
export const metadata = {
  title: { absolute: 'Satyam Gupta | Portfolio' },
  description:
    'I help brands thrive. Data analytics, marketing, content production and agentic workflows, optimized through iterative analytics.',
};

export default function Home() {
  return (
    <Transition>
      <Navbar tone='dark' partition={{ name: 'Home', index: '00' }} />
      <Header />
      <main>
        <Partition name='About' index='01' />
        <Description />
        <Partition name='Work' index='02' />
        <Thumbnail />
        <Partition name='Gallery' index='03' />
        <Project />
      </main>
      <Partition name='Contact' index='04' />
      <Contact />
    </Transition>
  );
}
