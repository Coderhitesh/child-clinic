import { cn } from '@/lib/utils';
import { Button } from './button';

export function EmptyState({ icon: Icon, title, description, action, onAction, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white px-6 py-14 text-center', className)}>
      {Icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action &&
        (typeof action === 'string'
          ? <Button className="mt-5" onClick={onAction}>{action}</Button>
          : <div className="mt-5">{action}</div>)}
    </div>
  );
}
