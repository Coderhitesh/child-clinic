import Link from 'next/link';
import { sList } from '@/lib/server-api';
import { prettyDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Health tips & articles' };
export const revalidate = 300;

export default async function BlogsPage({ searchParams }) {
  const [blogs, categories] = await Promise.all([
    sList(`/blogs${searchParams?.category ? `?category=${searchParams.category}` : ''}`),
    sList('/categories?type=blog'),
  ]);

  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">Health tips & articles</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-ink-soft">Practical advice from the doctors you already trust.</p>
        </div>
      </section>

      <section className="section container">
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link href="/blogs"><Badge tone={searchParams?.category ? 'outline' : 'default'}>All</Badge></Link>
            {categories.map((c) => (
              <Link key={c._id} href={`/blogs?category=${c._id}`}>
                <Badge tone={searchParams?.category === c._id ? 'default' : 'outline'}>{c.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <Link key={b._id} href={`/blogs/${b.slug}`} className="soft-card overflow-hidden transition-shadow hover:shadow-md">
              {b.coverImage ? (
                <img src={b.coverImage} alt="" className="h-44 w-full object-cover" />
              ) : (
                <div className="h-44 w-full bg-brand-50" />
              )}
              <div className="p-5">
                {b.category?.name && <Badge tone="coral">{b.category.name}</Badge>}
                <p className="mt-3 line-clamp-2 font-semibold text-ink">{b.title}</p>
                {b.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{b.excerpt}</p>}
                <p className="mt-4 text-xs text-muted-foreground">{prettyDate(b.publishedAt || b.createdAt)}</p>
              </div>
            </Link>
          ))}
          {!blogs.length && (
            <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No articles published yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
