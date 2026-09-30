// Small monospace chip showing the patient's unique id (renders nothing when there is none).
export default function PatientId({ id, className = '' }) {
  if (!id) return null;
  return (
    <span className={`inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-wide text-slate-700 ${className}`}>
      {id}
    </span>
  );
}
