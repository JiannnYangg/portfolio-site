/**
 * Footer / menu socials, in the order they appear in the footer:
 * Instagram, Twitter, GitHub, YouTube, Zenodo.
 *
 * `id` picks the footer icon (see layout/contact/components/social-links).
 * `href: null` means "link not ready yet": the footer still shows the item,
 * but as a dimmed, non-clickable "coming soon" chip, so there is never a dead
 * link. Fill in the `href` and it becomes a normal link, no other change
 * needed. The side menu only lists items that have `inMenu` not set to false
 * (and it uses its own order of the items that qualify).
 *
 * Zenodo points at the research papers page for now (the papers are hosted
 * on Zenodo); swap in the Zenodo profile URL whenever you like.
 */
export const socialMedias = [
  {
    id: 'instagram',
    href: null, // TODO: https://www.instagram.com/<your-handle>
    title: 'Instagram',
    inMenu: false,
  },
  {
    id: 'twitter',
    href: null, // TODO: https://x.com/<your-handle>
    title: 'Twitter',
    inMenu: false,
  },
  {
    id: 'github',
    href: 'https://github.com/JiannnYangg',
    title: 'GitHub',
  },
  {
    id: 'youtube',
    href: null, // TODO: https://www.youtube.com/@<your-channel>
    title: 'YouTube',
    inMenu: false,
  },
  {
    id: 'zenodo',
    href: '/research-papers',
    title: 'Zenodo',
    inMenu: false,
  },
];
