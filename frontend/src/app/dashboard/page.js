'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CalendarDays, Users, FileText, Video, ArrowRight, Plus } from 'lucide-react';
import { appointmentApi, patientApi } from '@/services';
import { loadMyVideos } from '@/lib/my-videos';
import { useAuthStore } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import StatCard from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/spinner';
import { inr, prettyDate, to12h, getErr } from '@/lib/utils';

export default function PatientOverview() {
  const user = useAuthStore((s) => s.user);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentApi.list().catch(() => []),
      patientApi.list().catch(() => []),
      loadMyVideos().catch(() => []),
    ])
      .then(([a, p, v]) => { setAppointments(a || []); setPatients(p || []); setVideos(v || []); })
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const todayKey = new Date().toISOString().slice(0, 10);
  const upcoming = appointments
    .filter((a) => a.date >= todayKey && ['pending', 'confirmed'].includes(a.status))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const past = appointments.filter((a) => !upcoming.includes(a)).slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Hello${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        sub="Your visits, your family's records and everything your doctor has shared."
        actions={<Button asChild><Link href="/doctors"><Plus className="h-4 w-4" />Book a visit</Link></Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming visits" value={upcoming.length} icon={CalendarDays} />
        <StatCard label="Family members" value={patients.length} icon={Users} tone="sky" />
        <StatCard label="Past visits" value={appointments.filter((a) => a.status === 'completed').length} icon={FileText} tone="emerald" />
        <StatCard label="Care videos" value={videos.length} icon={Video} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Coming up</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link href="/dashboard/appointments">All<ArrowRight className="h-3.5 w-3.5" /></Link></Button>
          </CardHeader>
          <CardContent>
            {!upcoming.length ? (
              <EmptyState
                icon={CalendarDays}
                title="Nothing booked yet"
                description="Find a doctor and pick a time that suits you."
                action={<Button asChild><Link href="/doctors">Find a doctor</Link></Button>}
              />
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 4).map((a) => (
                  <Link key={a._id} href={`/dashboard/appointments/${a._id}`} className="block rounded-xl border p-3 transition hover:border-brand-300 hover:bg-brand-50/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{a.doctor?.name}</p>
                        <p className="text-sm text-muted-foreground">{a.clinic?.name}</p>
                        <p className="mt-1 text-sm">{prettyDate(a.date)} · {to12h(a.startTime)}</p>
                      </div>
                      <StatusBadge value={a.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent history</CardTitle></CardHeader>
          <CardContent>
            {!past.length ? (
              <p className="text-sm text-muted-foreground">Your past visits will show up here.</p>
            ) : (
              <div className="divide-y">
                {past.map((a) => (
                  <div key={a._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{a.doctor?.name}</p>
                      <p className="text-xs text-muted-foreground">{prettyDate(a.date)} · {a.patient?.name}{a.patient?.patientId ? ` (${a.patient.patientId})` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{inr(a.payableAmount ?? a.consultationFee)}</span>
                      <StatusBadge value={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
