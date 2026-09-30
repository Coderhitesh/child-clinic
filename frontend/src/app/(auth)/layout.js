import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hero-wash hidden flex-col justify-between p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Normal Child Clinic" className="h-11 w-11 rounded-full bg-white object-cover" />
          <span className="text-lg font-extrabold text-brand-700">Normal Child Clinic</span>
        </Link>

        <div>
          <p className="hand-note text-3xl">Care today.<br />A healthier tomorrow.</p>
          <h2 className="mt-6 max-w-[18ch] text-3xl font-extrabold leading-tight">
            One account for your whole family&apos;s care
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-ink-soft">
            <li>• Book and reschedule appointments in seconds</li>
            <li>• Keep prescriptions and reports in one place</li>
            <li>• Add family members and switch between them</li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">Your information is encrypted and never shared.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
