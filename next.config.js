/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF first (smaller than WebP at the same quality), WebP as fallback
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      { source: '/work', destination: '/research-papers', permanent: true },
      { source: '/contact', destination: '/#contact-footer', permanent: true },
    ];
  },
};

module.exports = nextConfig;
