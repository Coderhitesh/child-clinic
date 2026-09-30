'use client';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { STATUS_TONE } from '@/lib/constants';
import { titleCase } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        default: 'border-transparent bg-brand-50 text-brand-700',
        success: 'border-transparent bg-emerald-50 text-emerald-700',
        warning: 'border-transparent bg-amber-50 text-amber-700',
        danger: 'border-transparent bg-red-50 text-red-700',
        info: 'border-transparent bg-sky-50 text-sky-700',
        muted: 'border-transparent bg-slate-100 text-slate-600',
        outline: 'border-border text-ink',
        coral: 'border-transparent bg-coral-50 text-coral-700',
      },
    },
    defaultVariants: { tone: 'default' },
  }
);

export function Badge({ className, tone, ...props }) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function StatusBadge({ value, label, className }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <Badge tone={STATUS_TONE[value] || 'muted'} className={className}>{titleCase(label || value)}</Badge>;
}

export { badgeVariants };
