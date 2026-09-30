'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Pencil, KeyRound } from 'lucide-react';
import { authApi, userApi, clinicApi } from '@/services';
import { useAuthStore, isSuperAdmin } from '@/store/authStore';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SimpleSelect } from '@/components/ui/select';
import { StatusBadge, Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { ROLE_LABEL } from '@/lib/constants';
import { prettyDate, getErr, titleCase } from '@/lib/utils';

const blank = { name: '', email: '', phone: '', password: '', role: 'receptionist', clinics: [], isActive: true };

export default function StaffPage() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const roles = isSuperAdmin(user)
    ? ['superadmin', 'clinic_admin', 'doctor', 'receptionist', 'patient']
    : ['doctor', 'receptionist'];

  const load = () => {
    setLoading(true);
    userApi.list(roleFilter ? { role: roleFilter } : undefined)
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { clinicApi.list().then((d) => setClinics(d || [])).catch(() => {}); }, []);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => { setEditing(null); setForm(blank); setOpen(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      ...blank,
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role,
      clinics: (u.clinics || []).map((c) => c?._id || c),
      isActive: u.isActive !== false,
      password: '',
    });
    setOpen(true);
  };

  const toggleClinic = (id) => {
    const has = form.clinics.includes(id);
    set({ clinics: has ? form.clinics.filter((c) => c !== id) : [...form.clinics, id] });
  };

  const save = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (!editing && !form.password) { toast.error('A temporary password is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const payload = { name: form.name, email: form.email, phone: form.phone, clinics: form.clinics, isActive: form.isActive };
        if (isSuperAdmin(user)) payload.role = form.role;
        if (form.password) payload.password = form.password;
        await userApi.update(editing._id, payload);
        toast.success('Account updated');
      } else {
        await authApi.createStaff({
          name: form.name, email: form.email, phone: form.phone,
          password: form.password, role: form.role, clinics: form.clinics,
        });
        toast.success(`${ROLE_LABEL[form.role] || form.role} account created`);
      }
      setOpen(false);
      load();
    } catch (e) { toast.error(getErr(e)); } finally { setSaving(false); }
  };

  const toggleActive = async (u) => {
    try {
      await userApi.update(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'Account disabled' : 'Account enabled');
      load();
    } catch (e) { toast.error(getErr(e)); }
  };

  return (
    <>
      <PageHeader
        title="Staff accounts"
        sub="Logins for clinic admins, doctors and receptionists — with clinic access and password resets."
        actions={<Button onClick={openCreate}><UserPlus className="h-4 w-4" />New account</Button>}
      />

      <DataTable
        loading={loading}
        rows={rows}
        searchKeys={['name', 'email', 'phone']}
        searchPlaceholder="Search by name, email or phone"
        toolbar={
          <SimpleSelect
            value={roleFilter} onChange={setRoleFilter} allowEmpty emptyLabel="All roles" placeholder="Role" className="w-[170px]"
            options={roles.map((r) => ({ value: r, label: ROLE_LABEL[r] || titleCase(r) }))}
          />
        }
        emptyTitle="No accounts yet"
        columns={[
          { key: 'name', header: 'Name', render: (r) => (
            <div>
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.email}</p>
            </div>
          ) },
          { key: 'role', header: 'Role', render: (r) => <Badge tone="muted">{ROLE_LABEL[r.role] || r.role}</Badge> },
          { key: 'phone', header: 'Phone', render: (r) => r.phone || '—' },
          { key: 'clinics', header: 'Clinics', render: (r) => (r.clinics || []).map((c) => c?.name).filter(Boolean).join(', ') || '—' },
          { key: 'lastLoginAt', header: 'Last login', render: (r) => (r.lastLoginAt ? prettyDate(r.lastLoginAt) : 'Never') },
          { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'confirmed' : 'cancelled'} label={r.isActive ? 'Active' : 'Disabled'} /> },
          { key: '__a', header: '', className: 'text-right w-[170px]', render: (r) => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => toggleActive(r)}>{r.isActive ? 'Disable' : 'Enable'}</Button>
            </div>
          ) },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : 'New staff account'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Leaving the password blank keeps the current one. Setting it signs them out everywhere.'
                : 'Share the temporary password with them and ask them to change it after signing in.'}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Full name *</Label>
                <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Role *</Label>
                <SimpleSelect
                  value={form.role}
                  onChange={(v) => set({ role: v })}
                  options={roles.map((r) => ({ value: r, label: ROLE_LABEL[r] || titleCase(r) }))}
                  disabled={Boolean(editing) && !isSuperAdmin(user)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1.5 block">Phone</Label>
                <Input value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" />{editing ? 'New password' : 'Temporary password *'}</Label>
                <Input value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder={editing ? 'Leave blank to keep the current password' : ''} />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Clinic access</Label>
              <div className="flex flex-wrap gap-2">
                {clinics.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => toggleClinic(c._id)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${form.clinics.includes(c._id) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'hover:bg-muted'}`}
                  >
                    {c.name}
                  </button>
                ))}
                {!clinics.length && <p className="text-sm text-muted-foreground">No clinics yet.</p>}
              </div>
            </div>

            {editing && (
              <div className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="text-sm font-medium">Account active</p>
                  <p className="text-xs text-muted-foreground">A disabled account cannot sign in.</p>
                </div>
                <Switch checked={form.isActive} onCheckedChange={(v) => set({ isActive: v })} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Spinner />}{editing ? 'Save changes' : 'Create account'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
