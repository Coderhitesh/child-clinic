'use client';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Send, Smartphone, BellOff, BellRing, Users } from 'lucide-react';
import { deviceApi } from '@/services';
import { useAuthStore, isSuperAdmin } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import StatCard from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { prettyDateTime, titleCase, getErr } from '@/lib/utils';

// must match the channels the app creates and the map in the backend push service
const TYPES = [
  { value: 'promotion', label: 'Offers (quiet channel)' },
  { value: 'booking_confirm', label: 'Appointments' },
  { value: 'reminder', label: 'Visit reminders' },
  { value: 'payment_success', label: 'Payments' },
  { value: 'prescription_ready', label: 'Prescriptions' },
  { value: 'general', label: 'General' },
];

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState('');
  const [permission, setPermission] = useState('');

  const [form, setForm] = useState({ title: '', body: '', type: 'promotion', audience: 'all', userId: '', token: '' });
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      deviceApi.list({ ...(platform ? { platform } : {}), ...(permission ? { permission } : {}) }),
      deviceApi.stats().catch(() => null),
    ])
      .then(([d, s]) => { setRows(d || []); setStats(s); })
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [platform, permission]); // eslint-disable-line react-hooks/exhaustive-deps

  const androidCount = useMemo(
    () => stats?.byPlatform?.find((p) => p._id === 'android')?.count || 0,
    [stats]
  );
  const iosCount = useMemo(
    () => stats?.byPlatform?.find((p) => p._id === 'ios')?.count || 0,
    [stats]
  );

  const send = async () => {
    if (!form.title || !form.body) { toast.error('A title and a message are needed'); return; }
    setSending(true);
    try {
      const res = await deviceApi.broadcast(form);
      toast.success(
        res?.targeted != null
          ? `Sent to ${res.sent} of ${res.targeted} device(s)`
          : `Sent to ${res?.sent ?? 0} device(s)`
      );
      setForm((f) => ({ ...f, title: '', body: '' }));
    } catch (e) { toast.error(getErr(e)); } finally { setSending(false); }
  };

  return (
    <>
      <PageHeader
        title="App notifications"
        sub="Who can be reached on push, and a composer to send to them."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Installs" value={stats?.devices ?? 0} icon={Smartphone} />
        <StatCard label="Notifications allowed" value={stats?.permissionGranted ?? 0} icon={BellRing} tone="emerald" />
        <StatCard label="Permission off" value={stats?.permissionDenied ?? 0} icon={BellOff} tone="amber" />
        <StatCard
          label="Patients reachable"
          value={`${stats?.usersReachable ?? 0} (${stats?.coverage ?? 0}%)`}
          icon={Users}
          tone="sky"
        />
      </div>

      {isSuperAdmin(user) && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-4 w-4" />Send a notification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Title</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Sunday OPD is now open" />
              </div>
              <div>
                <Label className="mb-1.5 block">Channel</Label>
                <SimpleSelect
                  value={form.type}
                  onChange={(v) => setForm((f) => ({ ...f, type: v }))}
                  options={TYPES}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block">Message</Label>
                <Textarea
                  rows={3}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Book a slot at our Noida clinic this Sunday, 9am to 2pm."
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Audience</Label>
                <SimpleSelect
                  value={form.audience}
                  onChange={(v) => setForm((f) => ({ ...f, audience: v }))}
                  options={[
                    { value: 'all', label: 'Everyone with notifications on' },
                    { value: 'user', label: 'One patient (all their devices)' },
                    { value: 'device', label: 'A single device' },
                  ]}
                />
              </div>
              {form.audience === 'user' && (
                <div>
                  <Label className="mb-1.5 block">Patient user id</Label>
                  <Input
                    value={form.userId}
                    onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                    placeholder="Copy it from the table below"
                  />
                </div>
              )}
              {form.audience === 'device' && (
                <div>
                  <Label className="mb-1.5 block">Device token</Label>
                  <Input
                    value={form.token}
                    onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
                    placeholder="Copy it from the table below"
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              The channel decides how the phone treats it — offers stay quiet, reminders buzz. Devices with the
              permission switched off are skipped.
            </p>

            <Button onClick={send} disabled={sending}>{sending ? <Spinner /> : <Send className="h-4 w-4" />}Send</Button>
          </CardContent>
        </Card>
      )}

      <DataTable
        loading={loading}
        rows={rows}
        searchKeys={['user.name', 'user.phone', 'deviceName', 'appVersion']}
        searchPlaceholder="Search by patient, device or version"
        toolbar={
          <div className="flex flex-wrap gap-2">
            <SimpleSelect
              value={platform} onChange={setPlatform} allowEmpty emptyLabel="All platforms" placeholder="Platform" className="w-[160px]"
              options={[{ value: 'android', label: `Android (${androidCount})` }, { value: 'ios', label: `iOS (${iosCount})` }]}
            />
            <SimpleSelect
              value={permission} onChange={setPermission} allowEmpty emptyLabel="Any permission" placeholder="Permission" className="w-[180px]"
              options={[{ value: 'granted', label: 'Notifications on' }, { value: 'denied', label: 'Notifications off' }]}
            />
          </div>
        }
        emptyTitle="No app installs yet"
        emptyDescription="Devices appear here the first time someone opens the app and allows notifications."
        columns={[
          { key: 'user', header: 'Patient', render: (r) => (
            r.user ? (
              <div>
                <p className="font-medium">{r.user.name}</p>
                <p className="text-xs text-muted-foreground">{r.user.phone || r.user.email}</p>
              </div>
            ) : <span className="text-muted-foreground">Signed out</span>
          ) },
          { key: 'platform', header: 'Platform', render: (r) => <Badge tone="muted">{titleCase(r.platform)}</Badge> },
          { key: 'deviceName', header: 'Device', render: (r) => r.deviceName || '—' },
          { key: 'appVersion', header: 'App version', render: (r) => r.appVersion || '—' },
          { key: 'permissionGranted', header: 'Notifications', render: (r) => (
            <StatusBadge
              value={r.permissionGranted ? 'confirmed' : 'cancelled'}
              label={r.permissionGranted ? 'Allowed' : 'Blocked'}
            />
          ) },
          { key: 'lastSeenAt', header: 'Last opened', render: (r) => prettyDateTime(r.lastSeenAt) },
          { key: 'userId', header: '', className: 'text-right', render: (r) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(r.user?._id || r.token);
                toast.success(r.user?._id ? 'User id copied' : 'Device token copied');
              }}
            >
              Copy id
            </Button>
          ) },
        ]}
      />
    </>
  );
}
