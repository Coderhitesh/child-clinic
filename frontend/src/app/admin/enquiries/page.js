'use client';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Mail, Ban, Reply } from 'lucide-react';
import { contactApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { prettyDateTime, getErr } from '@/lib/utils';

export default function EnquiriesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [spamming, setSpamming] = useState(null);

  const load = () => {
    setLoading(true);
    contactApi.list()
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => (status ? rows.filter((r) => r.status === status) : rows), [rows, status]);

  const respond = async () => {
    if (!note.trim()) { toast.error('Write a note about how this was answered'); return; }
    setSaving(true);
    try {
      await contactApi.respond(open._id, note.trim());
      toast.success('Marked as responded');
      setOpen(null);
      setNote('');
      load();
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(false); }
  };

  const markSpam = async () => {
    try {
      await contactApi.markSpam(spamming._id);
      toast.success('Moved to spam');
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  return (
    <>
      <PageHeader title="Enquiries" sub="Messages from the website contact form." />

      <DataTable
        loading={loading}
        rows={filtered}
        searchKeys={['name', 'email', 'subject', 'message']}
        searchPlaceholder="Search enquiries"
        toolbar={
          <SimpleSelect
            value={status} onChange={setStatus} allowEmpty emptyLabel="All" placeholder="Status" className="w-[150px]"
            options={['new', 'read', 'responded', 'spam'].map((s) => ({ value: s, label: s }))}
          />
        }
        emptyTitle="No enquiries yet"
        columns={[
          { key: 'createdAt', header: 'Received', render: (r) => prettyDateTime(r.createdAt) },
          { key: 'name', header: 'From', render: (r) => (
            <div>
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
            </div>
          ) },
          { key: 'subject', header: 'Subject', render: (r) => r.subject || '—' },
          { key: 'message', header: 'Message', className: 'max-w-[320px]', render: (r) => <span className="line-clamp-2 text-muted-foreground">{r.message}</span> },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status === 'responded' ? 'completed' : r.status === 'spam' ? 'cancelled' : 'pending'} label={r.status} /> },
          { key: '__a', header: '', className: 'text-right w-[170px]', render: (r) => (
            <div className="flex justify-end gap-1">
              <Button variant="outline" size="sm" onClick={() => { setOpen(r); setNote(r.responseNote || ''); }}>
                <Reply className="h-3.5 w-3.5" />Respond
              </Button>
              {r.status !== 'spam' && (
                <Button variant="ghost" size="icon" onClick={() => setSpamming(r)} aria-label="Mark spam"><Ban className="h-4 w-4" /></Button>
              )}
            </div>
          ) },
        ]}
      />

      <Dialog open={Boolean(open)} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="h-4 w-4" />{open?.name}</DialogTitle>
            <DialogDescription>{open?.email}{open?.phone ? ` · ${open.phone}` : ''}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              {open?.subject && <p className="mb-1 font-medium">{open.subject}</p>}
              <p className="whitespace-pre-wrap text-muted-foreground">{open?.message}</p>
            </div>
            <div>
              <Label className="mb-1.5 block">Response note</Label>
              <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Called back and booked her for Thursday 4pm." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
            <Button onClick={respond} disabled={saving}>{saving && <Spinner />}Mark responded</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(spamming)}
        onOpenChange={(v) => !v && setSpamming(null)}
        title="Move this enquiry to spam?"
        description="It stays in the list under the spam filter."
        confirmLabel="Mark spam"
        onConfirm={markSpam}
      />
    </>
  );
}
