'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ShieldCheck, Smartphone, RotateCw } from 'lucide-react';
import { authApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

/**
 * No-account booking. The visitor never sees a register form — they enter the phone
 * number (or email) the visit should be tied to, prove it with an OTP, and the API
 * creates a patient account for them on the spot if there isn't one already.
 */
export default function GuestVerify({ onVerified }) {
  const adopt = useAuthStore((s) => s.adoptSession);
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState('identify'); // identify | code
  const [accountExists, setAccountExists] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async () => {
    const id = identifier.trim();
    if (!id) { toast.error('Enter your mobile number'); return; }
    if (!id.includes('@') && id.replace(/\D/g, '').length < 10) {
      toast.error('That mobile number looks incomplete');
      return;
    }
    setBusy(true);
    try {
      const res = await authApi.requestOtp({ identifier: id });
      setAccountExists(Boolean(res?.accountExists));
      setStage('code');
      setCooldown(30);
      toast.success(`OTP sent to ${id}`);
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };

  const verify = async () => {
    if (otp.trim().length < 4) { toast.error('Enter the code you received'); return; }
    setBusy(true);
    try {
      const data = await authApi.verifyOtp({
        identifier: identifier.trim(),
        otp: otp.trim(),
        name: accountExists ? undefined : name.trim() || undefined,
      });
      const signedIn = adopt(data);
      toast.success(data.isNewAccount ? 'Number verified — account created' : 'Welcome back');
      await onVerified?.(signedIn);
    } catch (e) { toast.error(getErr(e)); } finally { setBusy(false); }
  };

  return (
    <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50/60 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
          {stage === 'identify' ? <Smartphone className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">
            {stage === 'identify' ? 'Your mobile number' : `Enter the code sent to ${identifier}`}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {stage === 'identify'
              ? 'No account needed. We send a one-time code, and your booking is saved against that number.'
              : accountExists
                ? 'This number already has an account — the code signs you in.'
                : 'Almost there. Your account is created once the code checks out.'}
          </p>

          {stage === 'identify' ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="98XXXXXXXX or you@example.com"
                className="max-w-xs bg-white"
                autoFocus
              />
              <Button onClick={send} disabled={busy}>{busy && <Spinner />}Send code</Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {!accountExists && (
                <div className="max-w-xs">
                  <Label className="mb-1.5 block">Your name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="As it should appear on records" className="bg-white" />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && verify()}
                  placeholder="6-digit code"
                  inputMode="numeric"
                  className="max-w-[160px] bg-white tracking-[0.3em]"
                  autoFocus
                />
                <Button onClick={verify} disabled={busy}>{busy && <Spinner />}Verify & continue</Button>
                <Button variant="ghost" onClick={send} disabled={busy || cooldown > 0}>
                  <RotateCw className="h-4 w-4" />{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                </Button>
              </div>
              <button type="button" onClick={() => { setStage('identify'); setOtp(''); }} className="text-xs text-brand-700 hover:underline">
                Use a different number
              </button>
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Already have a password? <Link href={`/login?next=/book`} className="font-medium text-brand-700 hover:underline">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
