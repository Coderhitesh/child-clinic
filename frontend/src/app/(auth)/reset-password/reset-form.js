'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';
import { authApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

export default function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const adopt = useAuthStore((s) => s.adoptSession);
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Use at least 8 characters'); return; }
    if (form.password !== form.confirm) { toast.error('The two passwords do not match'); return; }
    setBusy(true);
    try {
      const data = await authApi.resetPassword({ token, password: form.password });
      toast.success('Password updated');
      if (data?.accessToken && adopt) {
        adopt(data);
        router.replace(data.user?.role === 'patient' ? '/dashboard' : '/admin');
      } else {
        router.replace('/login');
      }
    } catch (err) { toast.error(getErr(err)); } finally { setBusy(false); }
  };

  if (!token) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-semibold text-ink">This link is incomplete</h1>
        <p className="mt-2 text-sm text-muted-foreground">Open the reset link from your email, or request a fresh one.</p>
        <Button asChild className="mt-6"><Link href="/forgot-password">Request a new link</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Set a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        At least 8 characters. Saving it signs you out of every other device.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label className="mb-1.5 block">New password</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} autoFocus />
        </div>
        <div>
          <Label className="mb-1.5 block">Confirm new password</Label>
          <Input type="password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Spinner />}Save password</Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it? <Link href="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
