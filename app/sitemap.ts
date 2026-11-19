import type { MetadataRoute } from 'next';
import { pages } from '@/lib/tools';
import { guides } from '@/lib/guides';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ['', '/guides', '/about', '/privacy', '/terms', '/contact'];
  return [...fixed, ...pages.map((p) => `/${p.slug}`), ...guides.map((g) => `/guides/${g.slug}`)].map((path) => ({ url: `${SITE_URL}${path}` }));
}
