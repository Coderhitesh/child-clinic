import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="hero-wash flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="hand-note text-3xl">Nothing here</p>
      <h1 className="mt-2 text-3xl font-bold">That page isn&apos;t part of Normal Child Clinic</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The link may be old or mistyped. Start from the home page or find a doctor directly.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild variant="brand"><Link href="/">Go to home</Link></Button>
        <Button asChild variant="outline"><Link href="/doctors">Find a doctor</Link></Button>
      </div>
    </div>
  );
}
