import { FileText, Github, Linkedin } from 'lucide-react';

/**
 * Footer / menu socials. Set `href` to null while a link is not ready:
 * the item is shown but is not clickable.
 */
export const socialMedias = [
  {
    href: 'https://github.com/JiannnYangg',
    title: 'GitHub',
    icon: Github,
  },
  {
    href: 'https://www.linkedin.com/in/satyam-gupta-6b8758440',
    title: 'LinkedIn',
    icon: Linkedin,
  },
  {
    href: '/research-papers',
    title: 'Research Papers',
    icon: FileText,
    inMenu: false, // shown in the footer only, not in the side menu
  },
];
