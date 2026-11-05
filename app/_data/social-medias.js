/**
 * Footer / menu socials.
 *
 * `id` picks the footer icon (see layout/contact/components/social-links).
 * `href: null` means "not ready yet": the footer simply leaves that item out
 * until a link is filled in, so there is never a dead button on the live
 * site. The side menu only lists items that have `inMenu` not set to false.
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
    id: 'github',
    href: 'https://github.com/JiannnYangg',
    title: 'GitHub',
  },
  {
    id: 'zenodo',
    href: '/research-papers',
    title: 'Zenodo',
    inMenu: false,
  },
  {
    id: 'twitter',
    href: null, // TODO: https://x.com/<your-handle>
    title: 'Twitter',
    inMenu: false,
  },
];
