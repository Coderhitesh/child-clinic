'use client';
import { partnerApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';
import { titleCase } from '@/lib/utils';

export default function PartnersPage() {
  return (
    <ResourceManager
      title="Partners"
      sub="Logos of insurers, labs and brands shown in the trust strip."
      api={partnerApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add partner"
      defaults={{ type: 'trusted_partner', order: 0, isActive: true }}
      searchKeys={['name']}
      columns={[
        { key: 'logo', header: 'Logo', render: (r) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.logo} alt={r.name} className="h-8 w-24 object-contain" />
        ) },
        { key: 'name', header: 'Name' },
        { key: 'type', header: 'Type', render: (r) => titleCase(r.type.replace('_', ' ')) },
        { key: 'order', header: 'Order' },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Live' : 'Off'} /> },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'logo', label: 'Logo', type: 'image', required: true },
        { name: 'link', label: 'Website' },
        { name: 'type', label: 'Type', type: 'select', options: [{ value: 'trusted_partner', label: 'Trusted partner' }, { value: 'brand', label: 'Brand' }] },
        { name: 'order', label: 'Order', type: 'number' },
        { name: 'isActive', label: 'Active', type: 'switch' },
      ]}
    />
  );
}
