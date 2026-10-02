import { siteUrl } from './_config/site-url';

/** @returns {import('next').MetadataRoute.Sitemap} */
export default function sitemap() {
  return ['', '/about', '/research-papers'].map(path => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));
}
