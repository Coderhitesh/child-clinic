import { sList } from '@/lib/server-api';
import FaqList from '@/components/site/faq-list';

export const metadata = { title: 'Frequently asked questions' };
export const revalidate = 300;

export default async function FaqsPage() {
  const faqs = await sList('/faqs');
  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">Frequently asked questions</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-ink-soft">Answers about booking, payments, prescriptions and visits.</p>
        </div>
      </section>
      <section className="section container max-w-3xl">
        {faqs.length ? (
          <FaqList faqs={faqs} />
        ) : (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No FAQs published yet.</p>
        )}
      </section>
    </>
  );
}
