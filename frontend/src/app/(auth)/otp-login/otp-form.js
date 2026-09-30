'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore, isStaff } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

export default function OtpForm() {
  const router = useRouter();
  const requestOtp = useAuthStore((s) => s.requestOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('request');
  const [name, setName] = useState('');
  const [accountExists, setAccountExists] = useState(true);
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await requestOtp(identifier.trim());
      setAccountExists(Boolean(res?.accountExists));
      setStage('verify');
      toast.success('OTP sent. It expires in a few minutes.');
    } catch (err) {
      toast.error(getErr(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await verifyOtp(identifier.trim(), otp.trim(), accountExists ? undefined : name.trim() || undefined);
      toast.success(accountExists ? 'Signed in' : 'Account created');
      router.replace(isStaff(user) ? '/admin' : '/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(getErr(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold">Sign in with an OTP</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {stage === 'request'
          ? 'No account yet? That is fine — verifying the number creates one.'
          : `Enter the code we sent to ${identifier}.`}
      </p>

      {stage === 'request' ? (
        <form onSubmit={send} className="mt-7 space-y-4">
          <div>
            <Label htmlFor="identifier" className="mb-1.5 block">Mobile or email</Label>
            <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="9876543210 or you@example.com" />
          </div>
          <Button type="submit" size="lg" variant="brand" className="w-full" disabled={busy}>
            {busy && <Spinner />} Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-7 space-y-4">
          {!accountExists && (
            <div>
              <Label htmlFor="name" className="mb-1.5 block">Your name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="As it should appear on records" />
            </div>
          )}
          <div>
            <Label htmlFor="otp" className="mb-1.5 block">OTP</Label>
            <Input
              id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required inputMode="numeric"
              placeholder="6-digit code" className="text-center text-lg tracking-[0.4em]"
            />
          </div>
          <Button type="submit" size="lg" variant="brand" className="w-full" disabled={busy}>
            {busy && <Spinner />} {accountExists ? 'Verify and sign in' : 'Verify and create account'}
          </Button>
          <div className="flex justify-between text-sm">
            <button type="button" onClick={() => setStage('request')} className="text-muted-foreground hover:underline">
              Change number
            </button>
            <button type="button" onClick={send} className="font-medium text-brand-700 hover:underline">Resend OTP</button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Prefer a password? <Link href="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link>
      </p>
    </>
  );
}
