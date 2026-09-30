'use client';
import { useEffect, useState } from 'react';
import { faqApi, categoryApi, specialityApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';

export default function FaqsPage() {
  const [categories, setCategories] = useState([]);
  const [specialities, setSpecialities] = useState([]);

  useEffect(() => {
    categoryApi.list().then((d) => setCategories(d || [])).catch(() => {});
    specialityApi.list().then((d) => setSpecialities(d || [])).catch(() => {});
  }, []);

  return (
    <ResourceManager
      title="FAQs"
      sub="Questions shown on the website and on speciality pages."
      api={faqApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add FAQ"
      defaults={{ order: 0, isActive: true }}
      searchKeys={['question', 'answer']}
      lookups={{
        categories: categories.map((c) => ({ value: c._id, label: c.name })),
        specialities: specialities.map((s) => ({ value: s._id, label: s.name })),
      }}
      columns={[
        { key: 'question', header: 'Question', className: 'max-w-[320px]' },
        { key: 'answer', header: 'Answer', className: 'max-w-[320px]', render: (r) => <span className="line-clamp-2 text-muted-foreground">{r.answer}</span> },
        { key: 'speciality.name', header: 'Speciality' },
        { key: 'order', header: 'Order' },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Live' : 'Off'} /> },
      ]}
      fields={[
        { name: 'question', label: 'Question', required: true },
        { name: 'answer', label: 'Answer', type: 'textarea', rows: 4, required: true },
        { name: 'category', label: 'Category', type: 'select', optionsFrom: 'categories' },
        { name: 'speciality', label: 'Speciality', type: 'select', optionsFrom: 'specialities' },
        { name: 'order', label: 'Order', type: 'number' },
        { name: 'isActive', label: 'Active', type: 'switch' },
      ]}
    />
  );
}
