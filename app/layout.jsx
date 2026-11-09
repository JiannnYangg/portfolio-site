import { SiteBackdrop, SiteGuides, SmoothCursor } from '@/components';
import { rootMetadata } from '@/config';
import { INTRO_SKIP_SCRIPT } from '@/data';
import { inter_tight, neue_montreal } from '@/fonts';
import { Offcanvas } from '@/layout';
import { Providers } from '@/providers';
import './globals.css';

/** @type {import('next').Metadata} */
export const metadata = rootMetadata;

//? Same deep plum as the preloader (layout/transition/preloader), so the
//? mobile browser bar matches the intro screen
/** @type {import('next').Viewport} */
export const viewport = { themeColor: '#2b1233' };

/** @param {import('react').PropsWithChildren<unknown>} */
export default function RootLayout({ children }) {
  return (
    //? suppressHydrationWarning: the inline script in <head> may add
    //? data-intro to <html> before React hydrates (see INTRO_SKIP_SCRIPT)
    <html
      lang='en'
      dir='ltr'
      suppressHydrationWarning
      className={`${neue_montreal.variable} ${inter_tight.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SKIP_SCRIPT }} />
      </head>
      <body className={neue_montreal.className}>
        <Providers>
          <SiteBackdrop />
          <SiteGuides />
          <SmoothCursor />
          <Offcanvas />
          {children}
        </Providers>
      </body>
    </html>
  );
}
