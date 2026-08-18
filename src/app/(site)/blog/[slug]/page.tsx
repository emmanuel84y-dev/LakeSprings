import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/data/content';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) return {};

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) notFound();

  return (
    <article className="container-lake max-w-2xl py-16">
      <p className="eyebrow">
        {post.blog_categories?.name ?? 'Hotel News'}
      </p>

      <h1 className="mt-2 font-display text-4xl text-ink">
        {post.title}
      </h1>

      {post.published_at && (
        <p className="mt-2 text-sm text-ink/40">
          {formatDate(
            post.published_at.split('T')[0] ?? post.published_at
          )}
        </p>
      )}

      <div className="prose prose-neutral mt-8 max-w-none leading-relaxed text-ink/80">
        {post.content.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-mist px-3 py-1 text-xs text-ink/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
