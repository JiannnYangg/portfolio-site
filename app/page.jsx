import { Partition } from '@/components';
import {
  Contact,
  Description,
  Header,
  Navbar,
  Showcase,
  Skills,
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
        <Partition name='Skills' index='02' />
        <Skills />
        {/* "Works" nav target: scrolls so the Works partition line sits at the
            top of the screen and the pinned showcase fills it. */}
        <div id='works' data-scroll-align='start'>
          <Partition name='Works' index='03' />
        </div>
        <Showcase />
      </main>
      <Partition name='Contact' index='04' />
      <Contact />
    </Transition>
  );
}
