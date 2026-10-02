/**
 * Recent work entries.
 * - `href`: omit (or set to null) for entries that should not link anywhere.
 * - `cursorLabel`: text in the hover bubble (defaults to 'View' / 'Soon').
 * - `image`: path inside /public. Omit while an image is not available yet;
 *   a placeholder is shown on hover instead.
 */
export const thumbnailOptions = [
  {
    href: 'https://arthakul.online',
    title: 'Arthakul',
    tag: 'SEO & GEO',
    image: '/images/projects/arthakul.webp',
  },
  {
    href: 'https://paninilabs.site',
    title: 'Panini Labs',
    tag: 'SaaS',
    image: '/images/projects/panini-labs.webp',
  },
  {
    href: 'https://youtube.com/@clivervision?si=TMMJLHT1ukP727tX',
    title: 'Cliver Visions',
    tag: 'Content Production',
    image: '/images/projects/cliver-visions.webp',
  },
  {
    href: null,
    title: 'Dopium',
    tag: 'Design & Development',
    image: '/images/projects/dopium.webp',
    cursorLabel: '',
  },
  {
    href: null,
    title: 'Fizz',
    tag: 'Social App',
    image: '/images/projects/fizz.webp',
    cursorLabel: 'Soon',
  },
];
