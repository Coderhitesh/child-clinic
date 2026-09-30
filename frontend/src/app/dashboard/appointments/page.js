'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CalendarDays } from 'lucide-react';
import { appointmentApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { inr, prettyDate, to12h, getErr, toDateKey } from '@/lib/utils';
import SlipButton from '@/components/appointment/slip-button';
import DoctorPhoto from '@/components/ui/doctor-photo';

export default function MyAppointments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentApi.list()
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, []);

  const todayKey = toDateKey(new Date());
  const { upcoming, past } = useMemo(() => {
    const u = [], p = [];
    rows.forEach((a) => {
      if (a.date >= todayKey && ['pending', 'confirmed'].includes(a.status)) u.push(a);
      else p.push(a);
    });
    u.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    p.sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
    return { upcoming: u, past: p };
  }, [rows, todayKey]);

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="My appointments"
        sub="Everything booked under your account, including family members."
        actions={<Button asChild><Link href="/doctors">Book a visit</Link></Button>}
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">History ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <List rows={upcoming} emptyTitle="No upcoming visits" emptyDesc="Pick a doctor and a time that works for you." />
        </TabsContent>
        <TabsContent value="past">
          <List rows={past} emptyTitle="No past visits yet" emptyDesc="Completed and cancelled visits land here." />
        </TabsContent>
      </Tabs>
    </>
  );
}

function List({ rows, emptyTitle, emptyDesc }) {
  if (!rows.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={emptyTitle}
        description={emptyDesc}
        action={<Button asChild><Link href="/doctors">Find a doctor</Link></Button>}
      />
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((a) => (
        <Card key={a._id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex min-w-[220px] items-center gap-3">
              <DoctorPhoto name={a.doctor?.name} photo={a.doctor?.photo} className="h-12 w-12 rounded-full text-sm" />
              <div>
                <p className="font-semibold">{a.doctor?.name}</p>
                <p className="text-sm text-muted-foreground">{a.speciality?.name} · {a.clinic?.name}</p>
                <p className="mt-1 text-sm">{prettyDate(a.date)} · {to12h(a.startTime)}</p>
              </div>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">For</p>
              <p className="font-medium">{a.patient?.name}</p>
              <PatientId id={a.patient?.patientId} />
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">{inr(a.payableAmount ?? a.consultationFee)}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge value={a.status} />
              <SlipButton appointment={a} size="sm" variant="brand" />
              <Button asChild variant="outline" size="sm"><Link href={`/dashboard/appointments/${a._id}`}>Details</Link></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
