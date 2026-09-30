'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { blogApi, categoryApi, specialityApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { prettyDate, slugify } from '@/lib/utils';

export default function BlogsPage() {
  const [categories, setCategories] = useState([]);
  const [specialities, setSpecialities] = useState([]);

  useEffect(() => {
    categoryApi.list({ type: 'blog' }).then((d) => setCategories(d || [])).catch(() => {});
    specialityApi.list().then((d) => setSpecialities(d || [])).catch(() => {});
  }, []);

  return (
    <ResourceManager
      title="Blogs"
      sub="Articles on the website. Content accepts HTML."
      api={blogApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Write article"
      defaults={{ isPublished: false, tags: [], seo: {} }}
      searchKeys={['title', 'slug', 'excerpt']}
      lookups={{
        categories: categories.map((c) => ({ value: c._id, label: c.name })),
        specialities: specialities.map((s) => ({ value: s._id, label: s.name })),
      }}
      transformOut={(f) => ({
        ...f,
        slug: f.slug || slugify(f.title || ''),
        publishedAt: f.isPublished ? f.publishedAt || new Date().toISOString() : f.publishedAt,
      })}
      columns={[
        { key: 'title', header: 'Title', className: 'max-w-[300px] truncate' },
        { key: 'category.name', header: 'Category' },
        { key: 'views', header: 'Views', render: (r) => r.views || 0 },
        { key: 'publishedAt', header: 'Published', render: (r) => (r.publishedAt ? prettyDate(r.publishedAt) : '—') },
        { key: 'isPublished', header: 'Status', render: (r) => <StatusBadge value={r.isPublished ? 'confirmed' : 'pending'} label={r.isPublished ? 'Published' : 'Draft'} /> },
        { key: 'view', header: '', render: (r) => (
          r.isPublished ? <Button asChild variant="ghost" size="sm"><Link href={`/blogs/${r.slug}`} target="_blank">View</Link></Button> : null
        ) },
      ]}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'slug', label: 'Slug', help: 'Generated from the title when left blank.' },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2 },
        { name: 'coverImage', label: 'Cover image', type: 'image' },
        { name: 'category', label: 'Category', type: 'select', optionsFrom: 'categories' },
        { name: 'speciality', label: 'Speciality', type: 'select', optionsFrom: 'specialities' },
        { name: 'tags', label: 'Tags', type: 'tags' },
        { name: 'content', label: 'Content', type: 'html', required: true, rows: 12 },
        { name: 'isPublished', label: 'Published', type: 'switch' },
        { type: 'section', label: 'Search engine listing' },
        { name: 'seo.metaTitle', label: 'Meta title' },
        { name: 'seo.metaDescription', label: 'Meta description', type: 'textarea', rows: 2 },
        { name: 'seo.metaKeywords', label: 'Meta keywords' },
        { name: 'seo.ogImage', label: 'Share image', type: 'image' },
      ]}
      deleteLabel="Delete"
      deleteDescription="The article is removed from the website."
    />
  );
}
