'use client';
import { onboardingApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';

// Ionicons names — what the app renders when a slide has no artwork
const ICONS = [
  'search-outline', 'calendar-outline', 'people-outline', 'document-text-outline',
  'heart-outline', 'medkit-outline', 'shield-checkmark-outline', 'wallet-outline',
  'play-circle-outline', 'sparkles-outline',
].map((v) => ({ value: v, label: v.replace('-outline', '') }));

export default function OnboardingPage() {
  return (
    <ResourceManager
      title="App onboarding"
      sub="The first-run carousel in the mobile app. Reorder, rewrite or switch slides off without shipping a build."
      api={onboardingApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add slide"
      defaults={{ order: 0, isActive: true, icon: 'sparkles-outline', accentFrom: '#ecfbf9', accentTo: '#d2f4ef' }}
      searchKeys={['title', 'body']}
      columns={[
        { key: 'order', header: '#' },
        { key: 'title', header: 'Headline' },
        { key: 'body', header: 'Body', className: 'max-w-[360px]', render: (r) => (
          <span className="line-clamp-2 text-muted-foreground">{r.body}</span>
        ) },
        { key: 'icon', header: 'Icon', render: (r) => (
          r.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={r.image} alt="" className="h-9 w-14 rounded-md object-cover" />
            : <span className="text-xs text-muted-foreground">{r.icon}</span>
        ) },
        { key: 'isActive', header: 'Status', render: (r) => (
          <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Live' : 'Off'} />
        ) },
      ]}
      fields={[
        { name: 'title', label: 'Headline', required: true, placeholder: 'Find the right doctor' },
        { name: 'body', label: 'Body', type: 'textarea', rows: 3, placeholder: 'Browse by speciality, clinic or fee — and see who is free today.' },
        { name: 'image', label: 'Artwork', type: 'image', help: 'Optional. Without it the app draws the icon below on a soft gradient.' },
        { name: 'icon', label: 'Icon', type: 'select', options: ICONS },
        { name: 'accentFrom', label: 'Gradient from', placeholder: '#ecfbf9' },
        { name: 'accentTo', label: 'Gradient to', placeholder: '#d2f4ef' },
        { name: 'ctaText', label: 'Button text', help: 'Only used on the last slide. Defaults to "Get started".' },
        { name: 'order', label: 'Order', type: 'number' },
        { name: 'isActive', label: 'Shown in the app', type: 'switch' },
      ]}
      deleteLabel="Deactivate"
    />
  );
}
