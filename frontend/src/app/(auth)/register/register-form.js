'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

export default function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password needs at least 8 characters');
    setBusy(true);
    try {
      const payload = { ...form, email: form.email.trim(), phone: form.phone.trim(), role: 'patient' };
      if (!payload.email) delete payload.email;
      await register(payload);
      toast.success('Account created');
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(getErr(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">One account covers everyone in your family.</p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div>
          <Label htmlFor="name" className="mb-1.5 block">Full name</Label>
          <Input id="name" value={form.name} onChange={set('name')} required placeholder="Your name" />
        </div>
        <div>
          <Label htmlFor="email" className="mb-1.5 block">Email <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-1.5 block">Mobile number</Label>
          <Input id="phone" value={form.phone} onChange={set('phone')} required placeholder="10-digit mobile" />
        </div>
        <div>
          <Label htmlFor="password" className="mb-1.5 block">Password</Label>
          <Input id="password" type="password" value={form.password} onChange={set('password')} required minLength={8} placeholder="At least 8 characters" />
        </div>

        <Button type="submit" size="lg" variant="brand" className="w-full" disabled={busy}>
          {busy && <Spinner />} Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered? <Link href="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link>
      </p>
    </>
  );
}
