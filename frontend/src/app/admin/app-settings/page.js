'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Smartphone, Wrench, Bell } from 'lucide-react';
import { appSettingApi, deviceApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import DynamicForm from '@/components/admin/dynamic-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner, PageLoader } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

const fields = [
  { type: 'section', label: 'Maintenance mode' },
  { name: 'maintenance.enabled', label: 'Put the app into maintenance', type: 'switch', help: 'Every app launch shows the maintenance screen instead of the home tab.' },
  { name: 'maintenance.title', label: 'Headline' },
  { name: 'maintenance.message', label: 'Message', type: 'textarea', rows: 3 },
  { name: 'maintenance.until', label: 'Expected back by', type: 'datetime' },
  { name: 'maintenance.allowBrowsing', label: 'Let people still browse', type: 'switch', help: 'Shows a banner rather than a wall — booking stays blocked by the API.' },

  { type: 'section', label: 'Android build' },
  { name: 'android.latestVersion', label: 'Latest version', placeholder: '1.2.0', help: 'Older installs are offered an update.' },
  { name: 'android.minSupportedVersion', label: 'Minimum supported version', placeholder: '1.0.0', help: 'Below this the update cannot be dismissed.' },
  { name: 'android.storeUrl', label: 'Play Store URL' },
  { name: 'android.releaseNotes', label: 'What is new', type: 'textarea', rows: 3 },

  { type: 'section', label: 'iOS build' },
  { name: 'ios.latestVersion', label: 'Latest version', placeholder: '1.2.0' },
  { name: 'ios.minSupportedVersion', label: 'Minimum supported version', placeholder: '1.0.0' },
  { name: 'ios.storeUrl', label: 'App Store URL' },
  { name: 'ios.releaseNotes', label: 'What is new', type: 'textarea', rows: 3 },

  { type: 'section', label: 'In-app support' },
  { name: 'supportPhone', label: 'Support phone' },
  { name: 'supportEmail', label: 'Support email', type: 'email' },
];

export default function AppSettingsPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    appSettingApi.get()
      .then((d) => setForm(d || { maintenance: {}, android: {}, ios: {} }))
      .catch((e) => { toast.error(getErr(e)); setForm({ maintenance: {}, android: {}, ios: {} }); });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await appSettingApi.update(form);
      toast.success('App settings saved — live on the next app launch');
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(false); }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const res = await deviceApi.test({ title: 'Test from the console', body: 'Push notifications are wired up correctly.' });
      toast.success(res?.skipped ? 'Push is not configured on the server' : `Sent to ${res?.sent ?? 0} device(s)`);
    } catch (e) { toast.error(getErr(e)); } finally { setTesting(false); }
  };

  if (!form) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Mobile app"
        sub="Maintenance mode, the version each install should be on, and a push test."
        actions={<Button onClick={save} disabled={saving}>{saving ? <Spinner /> : <Save className="h-4 w-4" />}Save</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className={form.maintenance?.enabled ? 'border-amber-300 bg-amber-50' : undefined}>
          <CardContent className="flex items-start gap-3 p-4">
            <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div className="text-sm">
              <p className="font-medium">
                {form.maintenance?.enabled ? 'Maintenance mode is ON' : 'App is live'}
              </p>
              <p className="text-muted-foreground">
                {form.maintenance?.enabled
                  ? 'Apps show the maintenance screen at launch.'
                  : 'Turn this on before a deploy that breaks the mobile API.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div className="text-sm">
              <p className="font-medium">Android {form.android?.latestVersion || '—'}</p>
              <p className="text-muted-foreground">
                Forced below {form.android?.minSupportedVersion || '—'} · iOS {form.ios?.latestVersion || '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <DynamicForm fields={fields} value={form} onChange={setForm} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" />Push notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Sends a test push to every device signed into <em>your</em> account. The app creates channels for
            appointments, reminders, payments, prescriptions and promotions — each notification type maps to one.
          </p>
          <Button variant="outline" onClick={sendTest} disabled={testing}>
            {testing && <Spinner />}Send a test to my devices
          </Button>
        </CardContent>
      </Card>

      <div className="mt-5 flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? <Spinner /> : <Save className="h-4 w-4" />}Save settings</Button>
      </div>
    </>
  );
}
