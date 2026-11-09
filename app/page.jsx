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
        {/* The showcase comes right after the hero: scrolling the landing
            page leads straight into the work animation, and the rest of the
            page follows it.
            "Works" nav target (navbar, side menu, the About page's Works
            circle: all link to /#works): scrolls so the Works partition line
            sits at the top of the screen and the pinned showcase fills it. */}
        <div id='works' data-scroll-align='start'>
          <Partition name='Works' index='01' />
        </div>
        <Showcase />
        <Partition name='About' index='02' />
        <Description />
        <Partition name='Skills' index='03' />
        <Skills />
      </main>
      <Partition name='Contact' index='04' />
      <Contact />
    </Transition>
  );
}
