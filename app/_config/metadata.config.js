import { siteUrl } from './site-url';

/** @type {import('next').Metadata} */
export const rootMetadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: './' },
  title: {
    template: '%s | Satyam Gupta',
    default: 'Satyam Gupta | Portfolio',
  },
  description:
    'I help brands thrive. Data analytics, marketing, content production and agentic workflows, optimized through iterative analytics.',
  generator: 'Next.js',
  applicationName: 'Satyam Gupta',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Satyam Gupta',
    'SEO',
    'GEO',
    'Meta Ads',
    'GA4',
    'Data Analytics',
    'Agentic Workflows',
    'Research Papers',
  ],
  authors: [{ name: 'Satyam Gupta' }],
  creator: 'Satyam Gupta',
  publisher: 'Satyam Gupta',
  openGraph: {
    type: 'website',
    siteName: 'Satyam Gupta',
    title: 'Satyam Gupta | Portfolio',
    description:
      'I help brands thrive. Data analytics, marketing, content production and agentic workflows, optimized through iterative analytics.',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Satyam Gupta',
    description:
      'I help brands thrive. Data analytics, marketing, content production and agentic workflows, optimized through iterative analytics.',
  },
  robots: {
    index: true,
    follow: true,
  },
};
