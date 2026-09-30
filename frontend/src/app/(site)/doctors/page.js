import { sList } from '@/lib/server-api';
import DoctorsBrowser from './doctors-browser';

export const metadata = { title: 'Find a doctor you can trust' };
export const revalidate = 120;

export default async function DoctorsPage({ searchParams }) {
  const [specialities, clinics] = await Promise.all([sList('/specialities'), sList('/clinics')]);
  return (
    <>
      <section className="hero-wash border-b border-border">
        <div className="container py-10">
          <h1 className="text-3xl font-extrabold md:text-4xl">Find a doctor you can trust</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-ink-soft">
            Search experienced, verified doctors across our clinics. Quality care for you and your family.
          </p>
        </div>
      </section>
      <DoctorsBrowser
        specialities={specialities}
        clinics={clinics}
        initial={{
          speciality: searchParams?.speciality || '',
          clinic: searchParams?.clinic || '',
          q: searchParams?.q || '',
        }}
      />
    </>
  );
}
