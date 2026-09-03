import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakespringshotels.com.ng').replace(/\/$/, '');

const staticRoutes: MetadataRoute.Sitemap = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/rooms', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/gallery', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/offers', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/visit', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/booking', priority: 0.9, changeFrequency: 'weekly' },
].map(({ path, priority, changeFrequency }) => ({
  url: `${siteUrl}${path}`,
  priority,
  changeFrequency,
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const [{ data: rooms }, { data: posts }] = await Promise.all([
    supabase
      .from('rooms')
      .select('slug, updated_at')
      .eq('active', true)
      .eq('archived', false),
    supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true),
  ]);

  const roomRoutes: MetadataRoute.Sitemap = (rooms ?? [])
    .filter((room) => Boolean(room.slug))
    .map((room) => ({
      url: `${siteUrl}/rooms/${encodeURIComponent(room.slug)}`,
      lastModified: room.updated_at ? new Date(room.updated_at) : undefined,
      priority: 0.8,
      changeFrequency: 'weekly',
    }));

  const postRoutes: MetadataRoute.Sitemap = (posts ?? [])
    .filter((post) => Boolean(post.slug))
    .map((post) => ({
      url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
      priority: 0.7,
      changeFrequency: 'monthly',
    }));

  return [...staticRoutes, ...roomRoutes, ...postRoutes];
}
