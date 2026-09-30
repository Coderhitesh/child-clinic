'use client';
import { categoryApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';
import { slugify, titleCase } from '@/lib/utils';

export default function CategoriesPage() {
  return (
    <ResourceManager
      title="Categories"
      sub="Shared categories for blogs, videos and services."
      api={categoryApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add category"
      defaults={{ type: 'general', order: 0, isActive: true, seo: {} }}
      searchKeys={['name', 'slug', 'type']}
      transformOut={(f) => ({ ...f, slug: f.slug || slugify(f.name || '') })}
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'slug', header: 'Slug' },
        { key: 'type', header: 'Used for', render: (r) => titleCase(r.type) },
        { key: 'order', header: 'Order' },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Live' : 'Off'} /> },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'slug', label: 'Slug', help: 'Generated from the name when left blank.' },
        { name: 'type', label: 'Used for', type: 'select', options: ['blog', 'video', 'service', 'general'].map((t) => ({ value: t, label: titleCase(t) })) },
        { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { name: 'image', label: 'Image', type: 'image' },
        { name: 'order', label: 'Order', type: 'number' },
        { name: 'isActive', label: 'Active', type: 'switch' },
        { type: 'section', label: 'Search engine listing' },
        { name: 'seo.metaTitle', label: 'Meta title' },
        { name: 'seo.metaDescription', label: 'Meta description', type: 'textarea', rows: 2 },
      ]}
    />
  );
}
