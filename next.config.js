/** Seconds in one day, for the cache lifetimes below */
const DAY = 60 * 60 * 24;

/**
 * Files in /public are served by Next with `max-age=0`, so every repeat visit
 * re-checks every logo and picture. Their names are not content-hashed, so
 * they are not marked `immutable`: they are cached for a day and may be
 * served stale for a week while the browser quietly fetches the new copy.
 * Replacing a file therefore shows up within a day (a new file name shows up
 * at once).
 */
const PUBLIC_ASSET_CACHE = [
  {
    key: 'Cache-Control',
    value: `public, max-age=${DAY}, stale-while-revalidate=${DAY * 7}`,
  },
];

const PUBLIC_ASSET_SOURCES = [
  '/showcase/:path*',
  '/images/:path*',
  '/hero-logos/:path*',
  '/logo.png',
  '/logo-light.png',
  '/logo-social.svg',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  images: {
    // AVIF first, WebP for browsers without it (and the original format as the
    // last resort). Same picture, noticeably fewer bytes.
    formats: ['image/avif', 'image/webp'],
    // The default is 60 s, so optimised images were re-checked all the time.
    // A week keeps repeat visits instant. Rename a file when you replace it.
    minimumCacheTTL: DAY * 7,
  },

  experimental: {
    // Import only the icons / motion pieces that are used, not the whole barrel
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  async headers() {
    return PUBLIC_ASSET_SOURCES.map(source => ({
      source,
      headers: PUBLIC_ASSET_CACHE,
    }));
  },

  async redirects() {
    return [
      { source: '/work', destination: '/research-papers', permanent: true },
      { source: '/contact', destination: '/#contact-footer', permanent: true },
    ];
  },
};

module.exports = nextConfig;
