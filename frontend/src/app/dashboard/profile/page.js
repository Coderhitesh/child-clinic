'use client';
import PatientId from '@/components/ui/patient-id';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogOut, Save, KeyRound, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi, patientApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner, PageLoader } from '@/components/ui/spinner';
import { ROLE_LABEL } from '@/lib/constants';
import { initials, prettyDate, getErr } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, hydrated, refreshUser, logout } = useAuthStore();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState('');

  useEffect(() => { refreshUser?.(); }, [refreshUser]);
  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);
  useEffect(() => {
    patientApi.list().then((d) => setPatients(d || [])).catch((e) => toast.error(getErr(e)));
  }, []);

  if (!hydrated && !user) return <PageLoader />;

  const saveDetails = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.email.trim() && !form.phone.trim()) { toast.error('Keep at least an email or a phone number'); return; }
    setSaving('details');
    try {
      await authApi.updateMe({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      await refreshUser?.();
      toast.success('Profile updated');
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(''); }
  };

  const hasPassword = user?.hasPassword !== false;

  const savePassword = async () => {
    if (hasPassword && !pw.currentPassword) { toast.error('Enter your current password'); return; }
    if (!pw.newPassword) { toast.error('Enter the new password'); return; }
    if (pw.newPassword.length < 8) { toast.error('Use at least 8 characters'); return; }
    if (pw.newPassword !== pw.confirm) { toast.error('The two new passwords do not match'); return; }
    setSaving('password');
    try {
      await authApi.updateMe({
        currentPassword: hasPassword ? pw.currentPassword : undefined,
        newPassword: pw.newPassword,
      });
      await refreshUser?.();
      toast.success(hasPassword ? 'Password changed — sign in again on your other devices' : 'Password set');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(''); }
  };

  const signOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      <PageHeader title="Profile" sub="Your account details, password and who you book for." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarFallback className="text-lg">{initials(user?.name)}</AvatarFallback></Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                  <Badge tone="muted" className="mt-1">{ROLE_LABEL[user?.role] || user?.role}</Badge>
                  {user?.phone && <p className="mt-1 text-sm text-muted-foreground">{user.phone}</p>}
                </div>
              </div>

              <Separator className="my-5" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block">Full name</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={saveDetails} disabled={saving === 'details'}>
                  {saving === 'details' ? <Spinner /> : <Save className="h-4 w-4" />}Save details
                </Button>
                <Button variant="outline" onClick={signOut}><LogOut className="h-4 w-4" />Sign out</Button>
              </div>

              {user?.createdAt && (
                <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />With us since {prettyDate(user.createdAt)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />{hasPassword ? 'Change password' : 'Set a password'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasPassword && (
                <p className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-900">
                  Your account was created with an OTP, so it has no password yet. Setting one is optional — OTP sign-in keeps working either way.
                </p>
              )}
              <div className={`grid gap-4 ${hasPassword ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                {hasPassword && (
                <div>
                  <Label className="mb-1.5 block">Current</Label>
                  <Input type="password" value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} />
                </div>
                )}
                <div>
                  <Label className="mb-1.5 block">New</Label>
                  <Input type="password" value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Confirm new</Label>
                  <Input type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">At least 8 characters. Saving it signs you out of other devices.</p>
              <Button onClick={savePassword} disabled={saving === 'password'}>
                {saving === 'password' && <Spinner />}{hasPassword ? 'Update password' : 'Set password'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader><CardTitle>You book for</CardTitle></CardHeader>
          <CardContent>
            {!patients.length ? (
              <p className="text-sm text-muted-foreground">No patient records yet.</p>
            ) : (
              <div className="space-y-2">
                {patients.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(p.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name} <PatientId id={p.patientId} className="ml-1" /></p>
                      <p className="text-xs text-muted-foreground">
                        {[p.age ? `${p.age} yrs` : p.dob ? prettyDate(p.dob) : null, p.contact?.phone || p.guardianDetails?.phone].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button asChild variant="ghost" className="mt-3 w-full"><Link href="/dashboard/family">Manage family members</Link></Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
