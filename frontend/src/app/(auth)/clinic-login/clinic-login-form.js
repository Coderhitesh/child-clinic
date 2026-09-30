'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Building2, ShieldCheck } from 'lucide-react';
import { useAuthStore, isStaff } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { ROLE_LABEL } from '@/lib/constants';
import { getErr } from '@/lib/utils';

/**
 * Staff door: clinic admins, receptionists and doctors. Same credentials endpoint as
 * the patient form — the difference is where it lands you and what it says when a
 * patient account signs in here by mistake.
 */
export default function ClinicLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      if (!isStaff(user)) {
        toast.message('That is a patient account', {
          description: 'Taking you to your appointments instead.',
        });
        router.replace('/dashboard');
        router.refresh();
        return;
      }
      toast.success(`Welcome back, ${user.name.split(' ')[0]} · ${ROLE_LABEL[user.role] || user.role}`);
      router.replace(params.get('next') || '/admin');
      router.refresh();
    } catch (err) {
      toast.error(getErr(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
        <Building2 className="h-3.5 w-3.5" />Clinic console
      </span>

      <h1 className="text-2xl font-extrabold">Clinic &amp; staff sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        For clinic admins, receptionists and doctors. Patients sign in{' '}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">here</Link>.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5 block">Work email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="reception@clinic.com" autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password" className="mb-1.5 block">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-brand-700 hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" size="lg" variant="brand" className="w-full" disabled={busy}>
          {busy && <Spinner />} Sign in to the console
        </Button>
      </form>

      <div className="mt-7 flex gap-3 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Staff accounts are created by the clinic admin from the console — there is no self-signup here.
          Locked out? Ask your admin to reset the password from Staff accounts.
        </p>
      </div>
    </>
  );
}
