import { Inter_Tight } from 'next/font/google';

//? Hero typeface. Inter Tight is Inter with display-size spacing, so it pairs
//? with Neue Montreal (same neo-grotesk family tree) and stays crisp at
//? headline size. It is loaded as a variable font (wght 100-900): one upright
//? and one italic file cover every weight, instead of a file per weight.
//? Used weights: SemiBold (600) for the sentence and the CTA label, ExtraBold
//? (800) + italic for the emphasis words. A real italic is required, which is
//? why fonts without one (Bricolage Grotesque, Manrope) were ruled out.
export const inter_tight = Inter_Tight({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-inter-tight',
  display: 'swap',
  //? Next already adds a metric-matched fallback (no layout shift on swap);
  //? this stack only matters if the font itself can't be used.
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
});
