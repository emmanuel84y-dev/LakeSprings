import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const supabase = createClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    '', '/rooms', '/gallery', '/offers', '/about', '/blog', '/contact', '/visit', '/booking',
  ].map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date() }));

  const { data: rooms } = await supabase.from('rooms').select('slug, updated_at').eq('active', true).eq('archived', false);
  const roomRoutes: MetadataRoute.Sitemap = (rooms ?? []).map((r) => ({
    url: `${siteUrl}/rooms/${r.slug}`,
    lastModified: new Date(r.updated_at),
  }));

  const { data: posts } = await supabase.from('blog_posts').select('slug, updated_at').eq('published', true);
  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
  }));

  return [...staticRoutes, ...roomRoutes, ...postRoutes];
}
