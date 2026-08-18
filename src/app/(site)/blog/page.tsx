import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { getBlogPosts } from '@/lib/data/content';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Blog' };

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container-lake py-16">
      <p className="eyebrow">Journal</p>

      <h1 className="mt-2 font-display text-4xl text-ink">
        Stories from LakeSprings
      </h1>

      {posts.length > 0 ? (
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <div className="aspect-[4/3] rounded-lg bg-mist" />

              <p className="mt-4 eyebrow">
                {post.blog_categories?.name ?? 'Hotel News'}
              </p>

              <h2 className="mt-1 font-display text-xl text-ink group-hover:text-brass">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm text-ink/60">
                  {post.excerpt}
                </p>
              )}

              {post.published_at && (
                <p className="mt-2 text-xs text-ink/40">
                  {formatDate(
                    post.published_at.split('T')[0] ?? post.published_at
                  )}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            icon={Newspaper}
            title="No articles yet"
            description="New stories from the hotel team will appear here."
          />
        </div>
      )}
    </div>
  );
}
