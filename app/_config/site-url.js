/**
 * Public address of the site (used for SEO, sitemap and share previews).
 * Priority: NEXT_PUBLIC_SITE_URL (your custom domain) > Vercel production
 * domain > Vercel preview URL > localhost.
 */
const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelHost ? `https://${vercelHost}` : 'http://localhost:3000');
