import Link from 'next/link';
import { Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import Logo from './logo';

const QUICK = [
  ['Home', '/'], ['Find Doctors', '/doctors'], ['Our Clinics', '/clinics'],
  ['Specialities', '/specialities'], ['About Us', '/about'], ['Contact', '/contact'],
];
const SERVICES = [
  ['Consultations', '/specialities'], ['Find a Doctor', '/doctors'], ['Book Appointment', '/book'],
  ['Health Tips', '/blogs'], ['Digital Prescriptions', '/dashboard/prescriptions'], ['Video Guidance', '/dashboard/videos'],
];
const SUPPORT = [
  ['Help Center', '/contact'], ['Privacy Policy', '/p/privacy-policy'], ['Terms & Conditions', '/p/terms-conditions'],
  ['Refund Policy', '/p/refund-policy'], ['FAQs', '/faqs'],
];

export default function SiteFooter({ settings }) {
  const s = settings || {};
  const social = s.socialLinks || {};
  return (
    <footer className="footer-wash mt-16 text-white/80">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo dark settings={settings} />
          <p className="mt-4 max-w-[220px] text-sm">
            {s.footerText || 'Trusted healthcare partner for healthier families.'}
          </p>
          <div className="mt-5 flex gap-3">
            {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>}
            {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>}
            {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube className="h-4 w-4" /></a>}
            {social.twitter && <a href={social.twitter} aria-label="Twitter" target="_blank" rel="noreferrer"><Twitter className="h-4 w-4" /></a>}
            {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>}
          </div>
        </div>

        <FooterCol title="Quick Links" links={QUICK} />
        <FooterCol title="Our Services" links={SERVICES} />
        <FooterCol title="Support" links={SUPPORT} />

        <div>
          <h4 className="mb-4 text-sm font-semibold text-white">Reach us</h4>
          <ul className="space-y-2 text-sm">
            {s.contactPhone && <li><a href={`tel:${s.contactPhone}`}>{s.contactPhone}</a></li>}
            {s.contactEmail && <li><a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></li>}
            {s.address && <li className="max-w-[220px]">{s.address}</li>}
          </ul>
          {/* {(s.playStoreUrl || s.appStoreUrl) && (
            <div className="mt-5 flex flex-col gap-2">
              {s.appStoreUrl && <a href={s.appStoreUrl} className="rounded-lg border border-white/25 px-3 py-2 text-xs">Download on the App Store</a>}
              {s.playStoreUrl && <a href={s.playStoreUrl} className="rounded-lg border border-white/25 px-3 py-2 text-xs">Get it on Google Play</a>}
            </div>
          )} */}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {s.siteName || 'Normal Child Clinic'}. All rights reserved.</span>
          <span className="flex items-center gap-4">
            <Link href="/clinic-login" className="hover:text-white">Clinic &amp; staff login</Link>
            <span className="hidden sm:inline">Care today. A healthier tomorrow.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold text-white">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href + label}>
            <Link href={href} className="hover:text-white">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
