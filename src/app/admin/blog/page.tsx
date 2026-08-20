import { getAdminResource } from '@/lib/data/admin-resources';
import { ResourceForm } from '../ResourceForm';
import { ResourceDelete } from '../ResourceDelete';

function dateTimeLocal(value: unknown) {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

export default async function Blog({ searchParams }: { searchParams?: { edit?: string } }) {
  const cats = await getAdminResource('blog_categories', 'name', true);
  const posts = await getAdminResource('blog_posts');
  const editId = searchParams?.edit;
  const editingPost = editId ? posts.find((p: any) => p.id === editId) : null;

  return (
    <div>
      <p className="eyebrow">Content</p>
      <h1 className="mt-1 font-display text-3xl">Blog</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ResourceForm
          resource="blog_categories"
          title="Add category"
          fields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'slug', label: 'Slug', required: true },
          ]}
        />
        <ResourceForm
          resource="blog_posts"
          title="Add post"
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'slug', label: 'Slug', required: true },
            { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
            { name: 'content', label: 'Content', type: 'textarea', required: true },
            { name: 'featured_image_path', label: 'Featured image path' },
            { name: 'category_id', label: 'Category', type: 'select', options: [{ value: '', label: 'Uncategorised' }, ...cats.map((c: any) => ({ value: c.id, label: c.name }))] },
            { name: 'tags', label: 'Tags (comma separated)' },
            { name: 'seo_title', label: 'SEO title' },
            { name: 'seo_description', label: 'SEO description', type: 'textarea' },
            { name: 'published_at', label: 'Publish date', type: 'datetime-local' },
            { name: 'published', label: 'Published', type: 'checkbox' },
          ]}
        />
      </div>

      {editingPost && (
        <div className="mt-8">
          <ResourceForm
            resource="blog_posts"
            id={editingPost.id}
            title={`Edit post: ${editingPost.title}`}
            fields={[
              { name: 'title', label: 'Title', required: true, value: editingPost.title },
              { name: 'slug', label: 'Slug', required: true, value: editingPost.slug },
              { name: 'excerpt', label: 'Excerpt', type: 'textarea', value: editingPost.excerpt ?? '' },
              { name: 'content', label: 'Content', type: 'textarea', required: true, value: editingPost.content ?? '' },
              { name: 'featured_image_path', label: 'Featured image path', value: editingPost.featured_image_path ?? '' },
              { name: 'category_id', label: 'Category', type: 'select', value: editingPost.category_id ?? '', options: [{ value: '', label: 'Uncategorised' }, ...cats.map((c: any) => ({ value: c.id, label: c.name }))] },
              { name: 'tags', label: 'Tags (comma separated)', value: Array.isArray(editingPost.tags) ? editingPost.tags.join(', ') : '' },
              { name: 'seo_title', label: 'SEO title', value: editingPost.seo_title ?? '' },
              { name: 'seo_description', label: 'SEO description', type: 'textarea', value: editingPost.seo_description ?? '' },
              { name: 'published_at', label: 'Publish date', type: 'datetime-local', value: dateTimeLocal(editingPost.published_at) },
              { name: 'published', label: 'Published', type: 'checkbox', value: Boolean(editingPost.published) },
            ]}
          />
        </div>
      )}

      <div className="mt-8 rounded-xl border border-sand bg-white">
        <div className="border-b border-sand p-5 font-medium">Posts</div>
        {posts.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between gap-4 border-b border-sand p-5 last:border-0">
            <div className="min-w-0">
              <b>{p.title}</b>
              <p className="text-xs text-ink/50">/{p.slug} · {p.published ? 'Published' : 'Draft'}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <a href={`/admin/blog?edit=${p.id}`} className="text-sm font-medium text-brass hover:underline">Edit</a>
              <ResourceDelete resource="blog_posts" id={p.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
