// Turns a model's `seo` block into Next.js metadata (all fields set in the admin panel).
export function buildMetadata(seo = {}, fallback = {}) {
  const title = seo?.metaTitle || fallback.title;
  const description = seo?.metaDescription || fallback.description;
  const image = seo?.ogImage || fallback.image;
  const robots = seo?.robots || 'index,follow';
  return {
    title,
    description,
    keywords: seo?.metaKeywords || undefined,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: { index: !robots.startsWith('noindex'), follow: !robots.endsWith('nofollow') },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: image ? [image] : undefined,
    },
  };
}
