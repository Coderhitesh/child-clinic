'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Wallet, CreditCard, Globe, Building2 } from 'lucide-react';
import { paymentModeApi, clinicApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { SimpleSelect } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Spinner, PageLoader } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

export default function PaymentModesPage() {
  const [globalSetting, setGlobalSetting] = useState({ payAtClinicEnabled: true, payOnlineEnabled: true });
  const [clinics, setClinics] = useState([]);
  const [clinicId, setClinicId] = useState('');
  const [clinicSetting, setClinicSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');

  useEffect(() => {
    Promise.all([paymentModeApi.get(), clinicApi.list()])
      .then(([g, c]) => { if (g) setGlobalSetting(g); setClinics(c || []); })
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!clinicId) { setClinicSetting(null); return; }
    paymentModeApi.get(clinicId)
      .then((d) => setClinicSetting(d || { payAtClinicEnabled: true, payOnlineEnabled: true }))
      .catch((e) => toast.error(getErr(e)));
  }, [clinicId]);

  const saveGlobal = async () => {
    setSaving('global');
    try {
      await paymentModeApi.setGlobal({
        payAtClinicEnabled: globalSetting.payAtClinicEnabled,
        payOnlineEnabled: globalSetting.payOnlineEnabled,
      });
      toast.success('Default payment modes saved');
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(''); }
  };

  const saveClinic = async () => {
    setSaving('clinic');
    try {
      await paymentModeApi.setForClinic(clinicId, {
        payAtClinicEnabled: clinicSetting.payAtClinicEnabled,
        payOnlineEnabled: clinicSetting.payOnlineEnabled,
      });
      toast.success('Clinic override saved');
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(''); }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader title="Payment modes" sub="What patients may choose at checkout — set a default, then override per clinic." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4" />Default for every clinic</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ModeRow
              icon={CreditCard}
              title="Pay online"
              sub="Card, UPI and netbanking through the gateway."
              checked={globalSetting.payOnlineEnabled}
              onChange={(v) => setGlobalSetting((s) => ({ ...s, payOnlineEnabled: v }))}
            />
            <ModeRow
              icon={Wallet}
              title="Pay at the clinic"
              sub="Reception collects the fee on arrival."
              checked={globalSetting.payAtClinicEnabled}
              onChange={(v) => setGlobalSetting((s) => ({ ...s, payAtClinicEnabled: v }))}
            />
            <Button onClick={saveGlobal} disabled={saving === 'global'}>
              {saving === 'global' && <Spinner />}Save default
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" />Per-clinic override</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Clinic</Label>
              <SimpleSelect
                value={clinicId} onChange={setClinicId} placeholder="Choose a clinic"
                options={clinics.map((c) => ({ value: c._id, label: c.name }))}
              />
            </div>

            {clinicSetting ? (
              <>
                <ModeRow
                  icon={CreditCard}
                  title="Pay online"
                  checked={clinicSetting.payOnlineEnabled}
                  onChange={(v) => setClinicSetting((s) => ({ ...s, payOnlineEnabled: v }))}
                />
                <ModeRow
                  icon={Wallet}
                  title="Pay at the clinic"
                  checked={clinicSetting.payAtClinicEnabled}
                  onChange={(v) => setClinicSetting((s) => ({ ...s, payAtClinicEnabled: v }))}
                />
                <Button onClick={saveClinic} disabled={saving === 'clinic'}>
                  {saving === 'clinic' && <Spinner />}Save override
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Pick a clinic to see or create its override.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ModeRow({ icon: Icon, title, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-brand-50 p-2 text-brand-600"><Icon className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      <Switch checked={Boolean(checked)} onCheckedChange={onChange} />
    </div>
  );
}
