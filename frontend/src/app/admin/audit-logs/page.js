'use client';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { auditApi } from '@/services';
import PageHeader from '@/components/admin/page-header';
import DataTable from '@/components/admin/data-table';
import { SimpleSelect } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { prettyDateTime, getErr, titleCase } from '@/lib/utils';

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState('');

  useEffect(() => {
    auditApi.list()
      .then((d) => setRows(d || []))
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, []);

  const resourceTypes = useMemo(
    () => Array.from(new Set(rows.map((r) => r.resourceType).filter(Boolean))),
    [rows]
  );
  const filtered = useMemo(
    () => (resource ? rows.filter((r) => r.resourceType === resource) : rows),
    [rows, resource]
  );

  return (
    <>
      <PageHeader title="Audit log" sub="Every sensitive read and write, with who did it and from where." />

      <DataTable
        loading={loading}
        rows={filtered}
        searchKeys={['action', 'path', 'user.name', 'user.email']}
        searchPlaceholder="Search by action, path or user"
        toolbar={
          <SimpleSelect
            value={resource} onChange={setResource} allowEmpty emptyLabel="All resources" placeholder="Resource"
            options={resourceTypes.map((t) => ({ value: t, label: titleCase(t) }))} className="w-[180px]"
          />
        }
        emptyTitle="Nothing logged yet"
        columns={[
          { key: 'createdAt', header: 'When', render: (r) => prettyDateTime(r.createdAt) },
          { key: 'user', header: 'Who', render: (r) => (
            <div>
              <p className="font-medium">{r.user?.name || 'System'}</p>
              <p className="text-xs text-muted-foreground">{r.role ? titleCase(r.role.replace('_', ' ')) : '—'}</p>
            </div>
          ) },
          { key: 'action', header: 'Action', render: (r) => <Badge tone="muted">{r.action}</Badge> },
          { key: 'resourceType', header: 'Resource', render: (r) => r.resourceType || '—' },
          { key: 'path', header: 'Endpoint', render: (r) => <span className="font-mono text-xs">{r.method} {r.path}</span> },
          { key: 'ip', header: 'IP', render: (r) => r.ip || '—' },
        ]}
      />
    </>
  );
}
