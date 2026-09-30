'use client';
import Link from 'next/link';
import { cmsPageApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { CMS_PAGE_TYPES } from '@/lib/constants';
import { slugify, titleCase } from '@/lib/utils';

export default function CmsPagesPage() {
  return (
    <ResourceManager
      title="Pages"
      sub="Policy and information pages served at /p/[slug]. Content accepts HTML."
      api={cmsPageApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add page"
      defaults={{ type: 'other', isActive: true, seo: {} }}
      searchKeys={['title', 'slug']}
      transformOut={(f) => ({ ...f, slug: f.slug || slugify(f.title || '') })}
      columns={[
        { key: 'title', header: 'Title' },
        { key: 'slug', header: 'Slug', render: (r) => `/p/${r.slug}` },
        { key: 'type', header: 'Type', render: (r) => titleCase(r.type.replace(/_/g, ' ')) },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Live' : 'Off'} /> },
        { key: 'view', header: '', render: (r) => (
          <Button asChild variant="ghost" size="sm"><Link href={`/p/${r.slug}`} target="_blank">View</Link></Button>
        ) },
      ]}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'slug', label: 'Slug', help: 'Generated from the title when left blank.' },
        { name: 'type', label: 'Type', type: 'select', options: CMS_PAGE_TYPES.map((t) => ({ value: t, label: titleCase(t.replace(/_/g, ' ')) })) },
        { name: 'content', label: 'Content', type: 'html', rows: 14, required: true },
        { name: 'isActive', label: 'Active', type: 'switch' },
        { type: 'section', label: 'Search engine listing' },
        { name: 'seo.metaTitle', label: 'Meta title' },
        { name: 'seo.metaDescription', label: 'Meta description', type: 'textarea', rows: 2 },
        { name: 'seo.canonicalUrl', label: 'Canonical URL' },
      ]}
      deleteLabel="Delete"
    />
  );
}
