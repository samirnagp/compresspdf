import type { MetadataRoute } from 'next';
import { pages } from '@/lib/tools';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ['', '/about', '/privacy', '/terms', '/contact'];
  return [...fixed, ...pages.map((p) => `/${p.slug}`)].map((path) => ({ url: `${SITE_URL}${path}` }));
}
