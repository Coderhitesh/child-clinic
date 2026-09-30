'use client';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SLOTS, FOODS, emptyMedicine } from './shared';

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active ? 'border-brand-600 bg-brand-600 text-white' : 'border-border bg-white text-ink hover:bg-brand-50'
      )}
    >
      {active ? '✓ ' : ''}{children}
    </button>
  );
}

// medicines: [{name,dosage,timings[],food,durationDays,instructions}]
export default function MedicineEditor({ medicines, onChange }) {
  const set = (i, patch) => onChange(medicines.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const toggleSlot = (i, key) => {
    const cur = medicines[i].timings || [];
    set(i, { timings: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key] });
  };

  return (
    <div className="space-y-3">
      {medicines.map((m, i) => (
        <div key={i} className="rounded-xl border border-border bg-slate-50/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medicine {i + 1}</span>
            {medicines.length > 1 && (
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-red-600" onClick={() => onChange(medicines.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_200px]">
            <div>
              <Label className="mb-1 block text-xs">Medicine name</Label>
              <Input placeholder="e.g. Paracetamol Syrup" value={m.name} onChange={(e) => set(i, { name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Dose</Label>
              <Input placeholder="e.g. 5 ml / 1 tab" value={m.dosage} onChange={(e) => set(i, { dosage: e.target.value })} />
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs">When to take</Label>
              <div className="flex flex-wrap gap-2">
                {SLOTS.map((s) => (
                  <Chip key={s.key} active={(m.timings || []).includes(s.key)} onClick={() => toggleSlot(i, s.key)}>{s.label}</Chip>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Food</Label>
              <div className="flex flex-wrap gap-2">
                {FOODS.map((f) => (
                  <Chip key={f.key} active={m.food === f.key} onClick={() => set(i, { food: m.food === f.key ? '' : f.key })}>{f.label}</Chip>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[160px_1fr]">
            <div>
              <Label className="mb-1.5 block text-xs">For how many days</Label>
              <Input type="number" min="1" placeholder="e.g. 5" value={m.durationDays} onChange={(e) => set(i, { durationDays: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Note (optional)</Label>
              <Input placeholder="e.g. Shake well before use" value={m.instructions} onChange={(e) => set(i, { instructions: e.target.value })} />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...medicines, emptyMedicine()])}>
        <Plus className="h-4 w-4" /> Add another medicine
      </Button>
    </div>
  );
}
