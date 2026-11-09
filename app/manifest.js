/** @returns {import('next').MetadataRoute.Manifest} */
export default function manifest() {
  return {
    name: 'Satyam Gupta',
    short_name: 'Satyam',
    description: 'I help brands thrive.',
    start_url: '/',
    display: 'standalone',
    // splash background is the beige paper; theme colour is the brand orange
    background_color: '#faf3e8',
    theme_color: '#ec6426',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
