/** @type {import('next').NextConfig} */

// Static files in /public are otherwise sent with `max-age=0`, so browsers
// re-check every one of them on every visit. These are safe to keep for 30
// days. If you ever replace one of these files, give the new file a new name
// (for example footer-bg-v2.webp) so visitors do not see the old copy.
const STATIC_CACHE = [
  {
    key: 'Cache-Control',
    value: 'public, max-age=2592000, stale-while-revalidate=86400',
  },
];

const nextConfig = {
  images: {
    // AVIF first (smaller than WebP at the same quality), WebP as fallback
    formats: ['image/avif', 'image/webp'],
    // Next's default is 60 seconds, which re-optimizes images far too often
    minimumCacheTTL: 2592000,
  },
  async headers() {
    return [
      { source: '/images/:path*', headers: STATIC_CACHE },
      { source: '/hero-logos/:path*', headers: STATIC_CACHE },
      { source: '/showcase/:path*', headers: STATIC_CACHE },
      { source: '/logo-light.png', headers: STATIC_CACHE },
      { source: '/logo-social.svg', headers: STATIC_CACHE },
    ];
  },
  async redirects() {
    return [
      { source: '/work', destination: '/research-papers', permanent: true },
      { source: '/contact', destination: '/#contact-footer', permanent: true },
    ];
  },
};

module.exports = nextConfig;
