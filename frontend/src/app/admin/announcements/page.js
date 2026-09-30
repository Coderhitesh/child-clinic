'use client';
import { headerNotificationApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';
import { prettyDate } from '@/lib/utils';

export default function AnnouncementsPage() {
  return (
    <ResourceManager
      title="Announcements"
      sub="The strip above the website header — holiday hours, new clinic openings, camp notices."
      api={headerNotificationApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add announcement"
      defaults={{ bgColor: '#0f3d56', textColor: '#ffffff', dismissible: true, isActive: true }}
      searchKeys={['message']}
      columns={[
        { key: 'preview', header: 'Preview', render: (r) => (
          <span className="inline-block rounded-md px-3 py-1 text-xs" style={{ background: r.bgColor, color: r.textColor }}>
            {r.message}
          </span>
        ) },
        { key: 'linkText', header: 'Link', render: (r) => r.linkText || '—' },
        { key: 'dismissible', header: 'Dismissible', render: (r) => (r.dismissible ? 'Yes' : 'No') },
        { key: 'window', header: 'Runs', render: (r) => (r.startDate || r.endDate ? `${r.startDate ? prettyDate(r.startDate) : '—'} → ${r.endDate ? prettyDate(r.endDate) : '—'}` : 'Always') },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Live' : 'Off'} /> },
      ]}
      fields={[
        { name: 'message', label: 'Message', required: true, placeholder: 'Sunday OPD now open at our Noida clinic' },
        { name: 'link', label: 'Link' },
        { name: 'linkText', label: 'Link text', placeholder: 'Book now' },
        { name: 'bgColor', label: 'Background colour', placeholder: '#0f3d56' },
        { name: 'textColor', label: 'Text colour', placeholder: '#ffffff' },
        { name: 'dismissible', label: 'Visitors can close it', type: 'switch' },
        { name: 'startDate', label: 'Starts', type: 'date' },
        { name: 'endDate', label: 'Ends', type: 'date' },
        { name: 'isActive', label: 'Active', type: 'switch' },
      ]}
    />
  );
}
