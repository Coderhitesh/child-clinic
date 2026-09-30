'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { IndianRupee, Wallet, RotateCcw } from 'lucide-react';
import { appointmentApi, paymentApi } from '@/services';
import { useAuthStore, can } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import StatCard from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { SimpleSelect } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/badge';
import { inr, prettyDate, getErr, toDateKey } from '@/lib/utils';

const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return toDateKey(d); };
// quick ranges on the visit date; 'custom' uses the two date boxes
const rangeFor = (k) => {
  const today = toDateKey(new Date());
  if (k === 'today') return [today, today];
  if (k === 'yesterday') return [addDays(-1), addDays(-1)];
  if (k === 'week') return [addDays(-6), today];
  if (k === 'month') { const d = new Date(); return [toDateKey(new Date(d.getFullYear(), d.getMonth(), 1)), today]; }
  return ['', ''];
};
const PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'This month' },
  { value: 'custom', label: 'Custom range' },
];

export default function PaymentsPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [preset, setPreset] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const pickPreset = (v) => {
    setPreset(v);
    if (v && v !== 'custom') { const [f, t] = rangeFor(v); setFrom(f); setTo(t); }
    if (!v) { setFrom(''); setTo(''); }
  };

  const load = () => {
    setLoading(true);
    appointmentApi.list()
      .then((a) => setRows(a || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(
    () => rows.filter((r) => {
      if (status && (r.payment?.status || 'pending') !== status) return false;
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      return true;
    }),
    [rows, status, from, to]
  );

  const collect = async (paymentId) => {
    try {
      await paymentApi.collect(paymentId);
      toast.success('Payment marked collected');
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  // totals follow the filters, so they always match the table below
  const collectedTotal = filtered
    .filter((r) => r.payment?.status === 'collected_at_clinic')
    .reduce((sum, r) => sum + (r.payableAmount ?? r.consultationFee ?? 0), 0);
  const pendingCount = filtered.filter((r) => (r.payment?.status || 'pending') === 'pending' && r.status !== 'cancelled').length;

  return (
    <>
      <PageHeader title="Payments" sub="Fees are collected at the clinic. Mark each one collected once the patient has paid." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total collected" value={inr(collectedTotal)} icon={IndianRupee} tone="emerald" />
        <StatCard label="Payments shown" value={filtered.length} icon={Wallet} />
        <StatCard label="Awaiting payment" value={pendingCount} icon={RotateCcw} tone="amber" />
      </div>

      <DataTable
        loading={loading}
        rows={filtered}
        searchKeys={['patient.patientId', 'patient.name', 'doctor.name', 'clinic.name']}
        searchPlaceholder="Search by patient, doctor or clinic"
        toolbar={
          <div className="flex flex-wrap gap-2">
            <SimpleSelect
              value={status} onChange={setStatus} allowEmpty emptyLabel="All statuses" placeholder="Status"
              options={['pending', 'collected_at_clinic'].map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))}
              className="w-[170px]"
            />
            <SimpleSelect
              value={preset} onChange={pickPreset} allowEmpty emptyLabel="All dates" placeholder="Date"
              options={PRESETS} className="w-[150px]"
            />
            {preset && (
              <>
                <Input type="date" value={from} max={to || undefined} className="w-[150px]"
                  onChange={(e) => { setFrom(e.target.value); setPreset('custom'); }} aria-label="From date" />
                <Input type="date" value={to} min={from || undefined} className="w-[150px]"
                  onChange={(e) => { setTo(e.target.value); setPreset('custom'); }} aria-label="To date" />
              </>
            )}
          </div>
        }
        emptyTitle="No payments match these filters"
        columns={[
          { key: 'date', header: 'Visit date', render: (r) => prettyDate(r.date) },
          { key: 'patient.name', header: 'Patient', render: (r) => <span>{r.patient?.name} <PatientId id={r.patient?.patientId} className="ml-1" /></span> },
          { key: 'clinic.name', header: 'Clinic' },
          { key: 'amount', header: 'Amount', render: (r) => inr(r.payableAmount ?? r.consultationFee) },
          { key: 'payment.status', header: 'Status', render: (r) => <StatusBadge value={r.payment?.status || 'pending'} /> },
          { key: 'actions', header: '', className: 'text-right', render: (r) => (
            <div className="flex justify-end gap-1">
              {can(user, 'payments', 'collect') && r.payment?.status === 'pending' && r.status !== 'cancelled' && (
                <Button variant="outline" size="sm" onClick={() => collect(r.payment._id)}>Mark collected</Button>
              )}
              <Button asChild variant="ghost" size="sm"><Link href={`/admin/appointments/${r._id}`}>Open</Link></Button>
            </div>
          ) },
        ]}
      />
    </>
  );
}
