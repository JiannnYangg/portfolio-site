/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/work', destination: '/research-papers', permanent: true },
      { source: '/contact', destination: '/#contact-footer', permanent: true },
    ];
  },
};

module.exports = nextConfig;
