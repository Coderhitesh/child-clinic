'use client';
import { useEffect, useState } from 'react';
import { testimonialApi, clinicApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';
import { Stars } from '@/components/site/bits';

export default function TestimonialsPage() {
  const [clinics, setClinics] = useState([]);
  useEffect(() => { clinicApi.list().then((d) => setClinics(d || [])).catch(() => {}); }, []);

  return (
    <ResourceManager
      title="Testimonials"
      sub="Patient words shown on the home page."
      api={testimonialApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add testimonial"
      defaults={{ rating: 5, order: 0, isActive: true }}
      searchKeys={['name', 'message']}
      lookups={{ clinics: clinics.map((c) => ({ value: c._id, label: c.name })) }}
      columns={[
        { key: 'name', header: 'Patient' },
        { key: 'designation', header: 'Caption', render: (r) => r.designation || '—' },
        { key: 'rating', header: 'Rating', render: (r) => <Stars value={r.rating} /> },
        { key: 'message', header: 'Message', className: 'max-w-[340px]', render: (r) => <span className="line-clamp-2 text-muted-foreground">{r.message}</span> },
        { key: 'order', header: 'Order' },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Live' : 'Off'} /> },
      ]}
      fields={[
        { name: 'name', label: 'Patient name', required: true },
        { name: 'designation', label: 'Caption', placeholder: 'Mother of two, Gurugram' },
        { name: 'photo', label: 'Photo', type: 'image' },
        { name: 'rating', label: 'Rating', type: 'select', options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n > 1 ? 's' : ''}` })) },
        { name: 'message', label: 'Message', type: 'textarea', rows: 4, required: true },
        { name: 'clinic', label: 'Clinic', type: 'select', optionsFrom: 'clinics' },
        { name: 'order', label: 'Order', type: 'number' },
        { name: 'isActive', label: 'Active', type: 'switch' },
      ]}
    />
  );
}
