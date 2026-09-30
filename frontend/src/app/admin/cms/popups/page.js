'use client';
import { popupApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';
import { prettyDate } from '@/lib/utils';

export default function PopupsPage() {
  return (
    <ResourceManager
      title="Popups"
      sub="Timed modals shown to website visitors. Use 'all' as a target page to show everywhere."
      api={popupApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add popup"
      defaults={{ showOnce: true, delaySeconds: 3, isActive: true, targetPages: ['home'] }}
      searchKeys={['title', 'content']}
      columns={[
        { key: 'title', header: 'Title', render: (r) => r.title || '—' },
        { key: 'targetPages', header: 'Shows on', render: (r) => (r.targetPages || []).join(', ') || 'home' },
        { key: 'delaySeconds', header: 'Delay', render: (r) => `${r.delaySeconds ?? 0}s` },
        { key: 'showOnce', header: 'Frequency', render: (r) => (r.showOnce ? 'Once per session' : 'Every visit') },
        { key: 'window', header: 'Runs', render: (r) => (r.startDate || r.endDate ? `${r.startDate ? prettyDate(r.startDate) : '—'} → ${r.endDate ? prettyDate(r.endDate) : '—'}` : 'Always') },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Live' : 'Off'} /> },
      ]}
      fields={[
        { name: 'title', label: 'Title' },
        { name: 'content', label: 'Content', type: 'textarea', rows: 4 },
        { name: 'image', label: 'Image', type: 'image' },
        { name: 'link', label: 'Button link' },
        { name: 'buttonText', label: 'Button text' },
        { name: 'targetPages', label: 'Target pages', type: 'tags', help: 'Page slugs, or a single "all".' },
        { name: 'delaySeconds', label: 'Delay before showing (seconds)', type: 'number' },
        { name: 'showOnce', label: 'Only once per session', type: 'switch' },
        { name: 'startDate', label: 'Starts', type: 'date' },
        { name: 'endDate', label: 'Ends', type: 'date' },
        { name: 'isActive', label: 'Active', type: 'switch' },
      ]}
    />
  );
}
