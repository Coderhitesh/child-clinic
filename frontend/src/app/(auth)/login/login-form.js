'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore, isStaff } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

export default function LoginForm() {
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
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      const next = params.get('next');
      router.replace(next || (isStaff(user) ? '/admin' : '/dashboard'));
      router.refresh();
    } catch (err) {
      toast.error(getErr(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Use the email (or mobile) and password on your Normal Child Clinic account.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Clinic staff? <Link href="/clinic-login" className="font-medium text-brand-700 hover:underline">Sign in to the console</Link>.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5 block">Email or mobile number</Label>
          <Input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com or 10-digit mobile" autoComplete="username" />
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
              placeholder="At least 8 characters"
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
          {busy && <Spinner />} Sign in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <Button asChild variant="outline" className="w-full"><Link href="/otp-login">Sign in with an OTP</Link></Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link href="/register" className="font-medium text-brand-700 hover:underline">Create an account</Link>
      </p>
    </>
  );
}
