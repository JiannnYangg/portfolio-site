import { rootMetadata } from '@/config';
import { montserrat, neue_montreal } from '@/fonts';
import { Offcanvas } from '@/layout';
import { Providers } from '@/providers';
import './globals.css';

/** @type {import('next').Metadata} */
export const metadata = rootMetadata;

/** @type {import('next').Viewport} */
export const viewport = { themeColor: '#1f2024' };

/** @param {import('react').PropsWithChildren<unknown>} */
export default function RootLayout({ children }) {
  return (
    <html
      lang='en'
      dir='ltr'
      className={`${neue_montreal.variable} ${montserrat.variable}`}
    >
      <body className={neue_montreal.className}>
        <Providers>
          <Offcanvas />
          {children}
        </Providers>
      </body>
    </html>
  );
}
