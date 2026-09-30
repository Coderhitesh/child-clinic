'use client';
import { useEffect, useState } from 'react';
import { couponApi, clinicApi, specialityApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { StatusBadge } from '@/components/ui/badge';
import { inr, prettyDate } from '@/lib/utils';

export default function CouponsPage() {
  const [clinics, setClinics] = useState([]);
  const [specialities, setSpecialities] = useState([]);

  useEffect(() => {
    clinicApi.list().then((d) => setClinics(d || [])).catch(() => {});
    specialityApi.list().then((d) => setSpecialities(d || [])).catch(() => {});
  }, []);

  const expired = (r) => new Date(r.validTo) < new Date();

  return (
    <ResourceManager
      title="Coupons"
      sub="Discounts patients can apply at the payment step. Leave clinics and specialities empty to allow everywhere."
      api={couponApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add coupon"
      defaults={{ discountType: 'percentage', discountValue: 10, minAppointmentAmount: 0, usageLimitPerUser: 1, isActive: true, applicableClinics: [], applicableSpecialities: [] }}
      searchKeys={['code', 'description']}
      lookups={{
        clinics: clinics.map((c) => ({ value: c._id, label: c.name })),
        specialities: specialities.map((s) => ({ value: s._id, label: s.name })),
      }}
      transformOut={(f) => ({ ...f, code: (f.code || '').toUpperCase().trim() })}
      columns={[
        { key: 'code', header: 'Code' },
        { key: 'discountValue', header: 'Discount', render: (r) => (r.discountType === 'percentage' ? `${r.discountValue}%${r.maxDiscountAmount ? ` (max ${inr(r.maxDiscountAmount)})` : ''}` : inr(r.discountValue)) },
        { key: 'minAppointmentAmount', header: 'Min bill', render: (r) => inr(r.minAppointmentAmount || 0) },
        { key: 'usedCount', header: 'Used', render: (r) => `${r.usedCount || 0}${r.usageLimitTotal ? ` / ${r.usageLimitTotal}` : ''}` },
        { key: 'validTo', header: 'Valid till', render: (r) => prettyDate(r.validTo) },
        { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={!r.isActive ? 'cancelled' : expired(r) ? 'no_show' : 'confirmed'} label={!r.isActive ? 'Off' : expired(r) ? 'Expired' : 'Live'} /> },
      ]}
      fields={[
        { name: 'code', label: 'Code', required: true, placeholder: 'FIRSTVISIT', help: 'Saved in capitals. Patients type this at checkout.' },
        { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { name: 'discountType', label: 'Discount type', type: 'select', required: true, options: [{ value: 'percentage', label: 'Percentage off' }, { value: 'flat', label: 'Flat amount off' }] },
        { name: 'discountValue', label: 'Discount value', type: 'number', required: true },
        { name: 'maxDiscountAmount', label: 'Maximum discount (₹)', type: 'number', help: 'Caps a percentage coupon.' },
        { name: 'minAppointmentAmount', label: 'Minimum bill (₹)', type: 'number' },
        { type: 'section', label: 'Where it works' },
        { name: 'applicableClinics', label: 'Clinics', type: 'multiselect', optionsFrom: 'clinics', help: 'Empty means every clinic.' },
        { name: 'applicableSpecialities', label: 'Specialities', type: 'multiselect', optionsFrom: 'specialities' },
        { type: 'section', label: 'Limits and validity' },
        { name: 'usageLimitTotal', label: 'Total uses', type: 'number', help: 'Empty means unlimited.' },
        { name: 'usageLimitPerUser', label: 'Uses per patient', type: 'number' },
        { name: 'validFrom', label: 'Valid from', type: 'date' },
        { name: 'validTo', label: 'Valid till', type: 'date', required: true },
        { name: 'isActive', label: 'Active', type: 'switch' },
      ]}
      deleteLabel="Deactivate"
    />
  );
}
