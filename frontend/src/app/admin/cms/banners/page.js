'use client';
import { bannerApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';
import { prettyDate, titleCase } from '@/lib/utils';

export default function BannersPage() {
  return (
    <ResourceManager
      title="Banners"
      sub="Hero slides on the home page and banner strips on inner pages."
      api={bannerApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add banner"
      defaults={{ placement: 'home_hero', order: 0, isActive: true }}
      searchKeys={['title', 'pageSlug']}
      columns={[
        { key: 'image', header: 'Image', render: (r) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.image} alt={r.title || 'Banner'} className="h-10 w-20 rounded-md object-cover" />
        ) },
        { key: 'title', header: 'Title', render: (r) => r.title || '—' },
        { key: 'placement', header: 'Placement', render: (r) => titleCase(r.placement.replace('_', ' ')) },
        { key: 'pageSlug', header: 'Page', render: (r) => r.pageSlug || 'Home' },
        { key: 'order', header: 'Order' },
        { key: 'window', header: 'Runs', render: (r) => (r.startDate || r.endDate ? `${r.startDate ? prettyDate(r.startDate) : '—'} → ${r.endDate ? prettyDate(r.endDate) : '—'}` : 'Always') },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Live' : 'Off'} /> },
      ]}
      fields={[
        { name: 'title', label: 'Title' },
        { name: 'image', label: 'Desktop image', type: 'image', required: true },
        { name: 'mobileImage', label: 'Mobile image', type: 'image' },
        { name: 'placement', label: 'Placement', type: 'select', required: true, options: [{ value: 'home_hero', label: 'Home hero' }, { value: 'page_banner', label: 'Page banner' }] },
        { name: 'pageSlug', label: 'Page slug', help: 'Needed for a page banner — e.g. about, contact, pediatrics.' },
        { name: 'link', label: 'Links to' },
        { name: 'buttonText', label: 'Button text' },
        { name: 'order', label: 'Order', type: 'number' },
        { name: 'startDate', label: 'Starts', type: 'date' },
        { name: 'endDate', label: 'Ends', type: 'date' },
        { name: 'isActive', label: 'Active', type: 'switch' },
      ]}
    />
  );
}
