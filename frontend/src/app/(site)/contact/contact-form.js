'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { contactApi } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

const blank = { name: '', email: '', phone: '', subject: '', message: '', clinicId: '' };

export default function ContactForm({ clinics = [] }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await contactApi.submit({ ...form, clinicId: form.clinicId || undefined });
      setSent(true);
      setForm(blank);
      toast.success('Message sent. Our team will reply shortly.');
    } catch (err) {
      toast.error(getErr(err));
    } finally {
      setSaving(false);
    }
  };

  if (sent) {
    return (
      <div className="soft-card flex flex-col items-center justify-center p-10 text-center">
        <p className="text-lg font-semibold text-ink">Message sent</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Our care team reads every message and usually replies within one working day.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>Send another message</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="soft-card grid gap-4 p-6 sm:grid-cols-2">
      <Field label="Your name" required>
        <Input value={form.name} onChange={set('name')} required placeholder="Full name" />
      </Field>
      <Field label="Email" required>
        <Input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" />
      </Field>
      <Field label="Phone">
        <Input value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" />
      </Field>
      <Field label="Clinic">
        <SimpleSelect
          value={form.clinicId}
          onChange={(v) => setForm((f) => ({ ...f, clinicId: v }))}
          allowEmpty
          emptyLabel="Not specific"
          placeholder="Choose a clinic"
          options={clinics.map((c) => ({ value: c._id, label: c.name }))}
        />
      </Field>
      <Field label="Subject" className="sm:col-span-2">
        <Input value={form.subject} onChange={set('subject')} placeholder="What is this about?" />
      </Field>
      <Field label="Message" required className="sm:col-span-2">
        <Textarea value={form.message} onChange={set('message')} required rows={5} placeholder="Tell us how we can help" />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={saving}>
          {saving && <Spinner />} Send message
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children, required, className = '' }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">
        {label} {required && <span className="text-coral-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
