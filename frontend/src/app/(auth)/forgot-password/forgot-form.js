'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { authApi } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

export default function ForgotForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter the email on your account'); return; }
    setBusy(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) { toast.error(getErr(err)); } finally { setBusy(false); }
  };

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <MailCheck className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-semibold text-ink">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If {email} has an account, a reset link is on its way. It expires in 30 minutes.
        </p>
        <Button asChild variant="outline" className="mt-6"><Link href="/login">Back to sign in</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft className="h-4 w-4" />Back to sign in
      </Link>

      <h1 className="text-2xl font-semibold text-ink">Forgot your password?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we will send a link to set a new one.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label className="mb-1.5 block">Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Spinner />}Send reset link</Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Patients can also <Link href="/otp-login" className="font-medium text-brand-700 hover:underline">sign in with an OTP</Link> instead.
      </p>
    </div>
  );
}
