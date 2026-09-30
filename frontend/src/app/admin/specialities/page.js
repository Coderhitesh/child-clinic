'use client';
import { specialityApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';
import { slugify } from '@/lib/utils';

export default function SpecialitiesPage() {
  return (
    <ResourceManager
      title="Specialities"
      sub="The care categories patients pick from when booking."
      api={specialityApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add speciality"
      defaults={{ isActive: true, seo: {} }}
      searchKeys={['name', 'slug']}
      transformOut={(f) => ({ ...f, slug: f.slug || slugify(f.name || '') })}
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'slug', header: 'Slug' },
        { key: 'description', header: 'Description', className: 'max-w-[320px] truncate' },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} /> },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true, placeholder: 'Pediatrics' },
        { name: 'slug', label: 'URL slug', placeholder: 'pediatrics', help: 'Left blank, it is generated from the name.' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'image', label: 'Icon or image', type: 'image' },
        { name: 'isActive', label: 'Visible on the website', type: 'switch' },
        { type: 'section', label: 'Search engine listing' },
        { name: 'seo.metaTitle', label: 'Meta title' },
        { name: 'seo.metaDescription', label: 'Meta description', type: 'textarea', rows: 2 },
        { name: 'seo.metaKeywords', label: 'Meta keywords' },
        { name: 'seo.canonicalUrl', label: 'Canonical URL' },
        { name: 'seo.ogImage', label: 'Share image', type: 'image' },
        { name: 'seo.robots', label: 'Robots', type: 'select', options: ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'].map((v) => ({ value: v, label: v })) },
      ]}
    />
  );
}
