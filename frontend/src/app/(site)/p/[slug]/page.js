import { notFound } from 'next/navigation';
import { sOne } from '@/lib/server-api';

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const page = await sOne(`/cms-pages/slug/${params.slug}`);
  return {
    title: page?.seo?.metaTitle || page?.title || 'Page',
    description: page?.seo?.metaDescription,
  };
}

export default async function CmsPage({ params }) {
  const page = await sOne(`/cms-pages/slug/${params.slug}`);
  if (!page) notFound();
  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">{page.title}</h1>
        </div>
      </section>
      <article className="container max-w-3xl py-10">
        <div
          className="text-[15px] leading-7 text-ink-soft [&_a]:text-brand-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:my-1 [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: page.content || '' }}
        />
      </article>
    </>
  );
}
