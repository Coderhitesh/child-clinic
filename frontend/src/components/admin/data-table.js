'use client';
import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

// Columns: [{ key, header, render?(row), className? }]
export default function DataTable({
  columns, rows = [], loading, searchKeys = [], searchPlaceholder = 'Search',
  pageSize = 12, toolbar, emptyTitle = 'Nothing here yet', emptyDescription,
  onRowClick,
}) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term || !searchKeys.length) return rows;
    return rows.filter((r) =>
      searchKeys.some((k) => {
        const v = k.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), r);
        return String(v ?? '').toLowerCase().includes(term);
      })
    );
  }, [rows, q, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="rounded-xl border border-border bg-white">
      {(searchKeys.length > 0 || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          {searchKeys.length > 0 && (
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      {loading ? (
        <div className="space-y-3 p-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
        </div>
      ) : slice.length === 0 ? (
        <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} className="border-0" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => <TableHead key={c.key} className={c.className}>{c.header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((row, i) => (
                <TableRow
                  key={row._id || i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render ? c.render(row) : pluck(row, c.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(current - 1)} disabled={current === 1}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(current + 1)} disabled={current === pages}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function pluck(row, path) {
  const v = path.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), row);
  if (v == null || v === '') return <span className="text-muted-foreground">—</span>;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.length ? v.map((x) => x?.name || x).join(', ') : '—';
  if (typeof v === 'object') return v.name || '—';
  return String(v);
}
