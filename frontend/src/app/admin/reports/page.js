'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, CalendarRange, IndianRupee, Stethoscope, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { reportApi, clinicApi } from '@/services';
import { useAuthStore, isSuperAdmin } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import StatCard from '@/components/admin/stat-card';
import DataTable from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageLoader } from '@/components/ui/spinner';
import { inr, prettyDate, titleCase, getErr } from '@/lib/utils';

const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const [from, setFrom] = useState(monthAgo());
  const [to, setTo] = useState(today());
  const [clinic, setClinic] = useState('');
  const [clinics, setClinics] = useState([]);
  const [data, setData] = useState({ appointments: null, revenue: null, doctors: [], patients: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin(user)) clinicApi.list().then((d) => setClinics(d || [])).catch(() => {});
  }, [user]);

  const params = () => ({ from, to, ...(clinic ? { clinic } : {}) });

  const load = () => {
    setLoading(true);
    const p = params();
    Promise.all([
      reportApi.appointments(p).catch(() => null),
      reportApi.revenue(p).catch(() => null),
      reportApi.doctorPerformance(p).catch(() => []),
      reportApi.patients({ from, to }).catch(() => null),
    ])
      .then(([appointments, revenue, doctors, patients]) => setData({ appointments, revenue, doctors: doctors || [], patients }))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const download = async (kind) => {
    try {
      const res = await reportApi.downloadCsv(kind, kind === 'patients' ? { from, to } : params());
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind}_${from}_to_${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { toast.error(getErr(e)); }
  };

  const revenueSeries = (data.revenue?.byDay || []).map((d) => ({ day: d._id?.slice(5), amount: d.sum }));
  const patientSeries = (data.patients?.byDay || []).map((d) => ({ day: d._id?.slice(5), count: d.count }));
  const statusSeries = (data.appointments?.byStatus || []).map((s) => ({ status: titleCase(s._id || ''), count: s.count }));

  return (
    <>
      <PageHeader title="Reports" sub="Appointments, revenue, doctor performance and patient growth — with CSV export." />

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <Label className="mb-1.5 block">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[160px]" />
          </div>
          <div>
            <Label className="mb-1.5 block">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[160px]" />
          </div>
          {isSuperAdmin(user) && (
            <div>
              <Label className="mb-1.5 block">Clinic</Label>
              <SimpleSelect
                value={clinic} onChange={setClinic} allowEmpty emptyLabel="All clinics" placeholder="All clinics"
                options={clinics.map((c) => ({ value: c._id, label: c.name }))} className="w-[200px]"
              />
            </div>
          )}
          <Button onClick={load}><CalendarRange className="h-4 w-4" />Apply</Button>
        </CardContent>
      </Card>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Appointments" value={data.appointments?.total ?? 0} icon={CalendarRange} />
            <StatCard label="Revenue" value={inr(data.revenue?.totalRevenue || 0)} icon={IndianRupee} tone="emerald" />
            <StatCard label="Doctors active" value={data.doctors.length} icon={Stethoscope} tone="sky" />
            <StatCard label="New patients" value={data.patients?.total ?? 0} icon={Users} tone="amber" />
          </div>

          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="doctors">Doctors</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Collected per day</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => download('revenue')}><Download className="h-4 w-4" />CSV</Button>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e6eef0" vertical={false} />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <Tooltip formatter={(v) => inr(v)} />
                        <Line type="monotone" dataKey="amount" stroke="#12a89f" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <SmallTable
                      title="By method"
                      rows={(data.revenue?.byMethod || []).map((m) => ({ label: m._id === 'pay_online' ? 'Online (old records)' : 'At clinic', value: inr(m.sum), sub: `${m.count} payment(s)` }))}
                    />
                    <SmallTable
                      title="By clinic"
                      rows={(data.revenue?.byClinic || []).map((c) => ({ label: c.clinicName, value: inr(c.sum), sub: `${c.count} payment(s)` }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>By status</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => download('appointments')}><Download className="h-4 w-4" />CSV</Button>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e6eef0" vertical={false} />
                        <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#12a89f" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6">
                    <SmallTable
                      title="By clinic"
                      rows={(data.appointments?.byClinic || []).map((c) => ({ label: c.clinicName, value: c.count, sub: 'appointments' }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="doctors">
              <div className="mb-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => download('doctor-performance')}><Download className="h-4 w-4" />CSV</Button>
              </div>
              <DataTable
                rows={data.doctors}
                searchKeys={['doctorName']}
                searchPlaceholder="Search doctors"
                emptyTitle="No appointments in this range"
                columns={[
                  { key: 'doctorName', header: 'Doctor' },
                  { key: 'total', header: 'Total' },
                  { key: 'completed', header: 'Completed' },
                  { key: 'cancelled', header: 'Cancelled' },
                  { key: 'noShow', header: 'No show' },
                  { key: 'revenue', header: 'Fees billed', render: (r) => inr(r.revenue) },
                ]}
              />
            </TabsContent>

            <TabsContent value="patients">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>New patient registrations</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => download('patients')}><Download className="h-4 w-4" />CSV</Button>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={patientSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e6eef0" vertical={false} />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#fb7a5c" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {data.patients?.total ?? 0} patients registered between {prettyDate(from)} and {prettyDate(to)}.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}

function SmallTable({ title, rows }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      {!rows.length ? (
        <p className="text-sm text-muted-foreground">Nothing in this range.</p>
      ) : (
        <div className="divide-y rounded-xl border">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.sub}</p>
              </div>
              <p className="text-sm font-semibold">{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
