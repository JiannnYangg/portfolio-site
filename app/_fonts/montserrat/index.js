import { Montserrat } from 'next/font/google';

//? Medium (500) for body-weight headline text, ExtraBold (800) + italic for emphasis
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '800'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
  display: 'swap',
});
