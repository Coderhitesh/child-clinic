'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

const Table = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto">
    <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
);
const TableHeader = ({ className, ...props }) => <thead className={cn('bg-muted/60', className)} {...props} />;
const TableBody = ({ className, ...props }) => <tbody className={cn('divide-y divide-border', className)} {...props} />;
const TableRow = ({ className, ...props }) => <tr className={cn('hover:bg-brand-50/40 transition-colors', className)} {...props} />;
const TableHead = ({ className, ...props }) => (
  <th className={cn('h-11 whitespace-nowrap px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground', className)} {...props} />
);
const TableCell = ({ className, ...props }) => (
  <td className={cn('px-4 py-3 align-middle text-ink', className)} {...props} />
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
