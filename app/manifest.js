/** @returns {import('next').MetadataRoute.Manifest} */
export default function manifest() {
  return {
    name: 'Satyam Gupta',
    short_name: 'Satyam',
    description: 'I help brands thrive.',
    start_url: '/',
    display: 'standalone',
    background_color: '#14152b',
    theme_color: '#14152b',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
