'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from './page-header';
import DataTable from './data-table';
import DynamicForm from './dynamic-form';
import ConfirmDialog from './confirm-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { getErr } from '@/lib/utils';

// Generic list + create/edit/deactivate screen driven by a field schema.
// Used for every simple content resource so the admin covers the whole API.
export default function ResourceManager({
  title,
  sub,
  api,                 // { list, create, update, remove }
  listParams,
  columns,
  fields,
  defaults = {},
  searchKeys = [],
  lookups = {},
  canWrite = true,
  canCreate,
  addLabel = 'Add new',
  deleteLabel = 'Deactivate',
  deleteDescription = 'This hides the record from the website. You can recreate it later.',
  transformIn,         // (record) => formValue
  transformOut,        // (formValue) => payload
  extraToolbar,
  emptyTitle,
  emptyDescription,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .list(listParams)
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(listParams)]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaults);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(transformIn ? transformIn(row) : normalize(row, fields));
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = transformOut ? transformOut(form) : form;
      if (editing) {
        await api.update(editing._id, payload);
        toast.success(`${title.replace(/s$/, '')} updated`);
      } else {
        await api.create(payload);
        toast.success(`${title.replace(/s$/, '')} created`);
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(getErr(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.remove(toDelete._id);
      toast.success(`${deleteLabel}d`);
      load();
    } catch (e) {
      toast.error(getErr(e));
    }
  };

  const actionColumn = {
    key: '__actions',
    header: '',
    className: 'w-[120px] text-right',
    render: (row) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        {api.remove && (
          <Button variant="ghost" size="icon" onClick={() => setToDelete(row)} aria-label={deleteLabel}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        )}
      </div>
    ),
  };

  return (
    <>
      <PageHeader
        title={title}
        sub={sub}
        actions={(canCreate ?? canWrite) ? <Button onClick={openCreate}><Plus className="h-4 w-4" />{addLabel}</Button> : null}
      />

      <DataTable
        columns={canWrite ? [...columns, actionColumn] : columns}
        rows={rows}
        loading={loading}
        searchKeys={searchKeys}
        toolbar={extraToolbar}
        emptyTitle={emptyTitle || `No ${title.toLowerCase()} yet`}
        emptyDescription={emptyDescription || ((canCreate ?? canWrite) ? `Use ${addLabel} to create the first one.` : undefined)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title.replace(/s$/, '').toLowerCase()}` : addLabel}</DialogTitle>
            <DialogDescription>Fields marked with * are required by the API.</DialogDescription>
          </DialogHeader>

          <DynamicForm fields={fields} value={form} onChange={setForm} lookups={lookups} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Spinner />}{editing ? 'Save changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`${deleteLabel} “${toDelete?.name || toDelete?.title || toDelete?.question || toDelete?.code || 'this record'}”?`}
        description={deleteDescription}
        confirmLabel={deleteLabel}
        onConfirm={remove}
      />
    </>
  );
}

// Turns a populated API record back into plain form values (ObjectIds as strings).
function normalize(row, fields) {
  const out = JSON.parse(JSON.stringify(row));
  fields.forEach((f) => {
    if (!f.name) return;
    const parts = f.name.split('.');
    let cur = out;
    for (let i = 0; i < parts.length - 1; i += 1) {
      cur = cur?.[parts[i]];
      if (!cur) return;
    }
    const key = parts[parts.length - 1];
    const v = cur?.[key];
    if (v && typeof v === 'object' && v._id) cur[key] = v._id;
    if (Array.isArray(v)) cur[key] = v.map((x) => (x && typeof x === 'object' && x._id ? x._id : x));
    if (f.type === 'date' && v) cur[key] = String(v).slice(0, 10);
  });
  return out;
}
