import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sOne, sList } from '@/lib/server-api';
import { prettyDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const revalidate = 120;

export async function generateMetadata({ params }) {
  const blog = await sOne(`/blogs/slug/${params.slug}`);
  return {
    title: blog?.seo?.metaTitle || blog?.title || 'Article',
    description: blog?.seo?.metaDescription || blog?.excerpt,
  };
}

export default async function BlogPage({ params }) {
  const blog = await sOne(`/blogs/slug/${params.slug}`);
  if (!blog) notFound();
  const more = await sList('/blogs');

  return (
    <article className="container py-10">
      <nav className="mb-5 text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">Home</Link> › <Link href="/blogs" className="hover:underline">Health Tips</Link>
      </nav>

      <div className="mx-auto max-w-3xl">
        {blog.category?.name && <Badge tone="coral">{blog.category.name}</Badge>}
        <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">{blog.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {prettyDate(blog.publishedAt || blog.createdAt)}
          {blog.author?.name ? ` · ${blog.author.name}` : ''}
        </p>

        {blog.coverImage && <img src={blog.coverImage} alt="" className="mt-6 w-full rounded-2xl object-cover" />}

        <div
          className="prose prose-slate mt-8 max-w-none text-[15px] leading-7 text-ink-soft [&_a]:text-brand-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:my-1 [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: blog.content || '' }}
        />

        {blog.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {blog.tags.map((t) => <Badge key={t} tone="outline">#{t}</Badge>)}
          </div>
        )}
      </div>

      {more.filter((b) => b._id !== blog._id).length > 0 && (
        <section className="mx-auto mt-14 max-w-5xl">
          <h2 className="section-title text-xl">More reading</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {more.filter((b) => b._id !== blog._id).slice(0, 3).map((b) => (
              <Link key={b._id} href={`/blogs/${b.slug}`} className="soft-card p-4 hover:shadow-md">
                <p className="line-clamp-2 text-sm font-semibold text-ink">{b.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">{prettyDate(b.publishedAt || b.createdAt)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
