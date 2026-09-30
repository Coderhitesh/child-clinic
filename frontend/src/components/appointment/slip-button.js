'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { appointmentApi } from '@/services';
import { Button } from '@/components/ui/button';

export const slipReady = (status) => ['confirmed', 'completed'].includes(status);

// The server only issues the slip once the clinic has confirmed the appointment.
export default function SlipButton({ appointment, size, variant = 'default', className }) {
  const [busy, setBusy] = useState(false);
  if (!appointment || !slipReady(appointment.status)) return null;

  const download = async () => {
    setBusy(true);
    try {
      const blob = await appointmentApi.slip(appointment._id);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `appointment-slip-${String(appointment._id).slice(-8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {
      // error bodies arrive as a blob, so read the message out of it
      let msg = 'Could not download the slip';
      try { msg = JSON.parse(await e.response.data.text()).message || msg; } catch { /* keep default */ }
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size={size} variant={variant} className={className} onClick={download} disabled={busy}>
      <Download className="h-4 w-4" />{busy ? 'Preparing…' : 'Download slip'}
    </Button>
  );
}
