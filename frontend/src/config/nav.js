import {
  LayoutDashboard, CalendarDays, CalendarClock, Users, FileText, CreditCard, Video,
  Building2, Stethoscope, Layers, UserCog, Ticket, Inbox, BarChart3, Image as ImageIcon,
  MessageSquareQuote, Megaphone, FolderTree, Newspaper, HelpCircle, Handshake, FileCog,
  Settings, ScrollText, Wallet, UserRound, UserPlus, Smartphone, BellRing,
} from 'lucide-react';
import { ROLES } from '@/lib/constants';

const all = [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST];

// Every admin route, tagged with the roles allowed to see it.
const ADMIN_NAV = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, roles: all },
      { href: '/admin/my-day', label: 'My day', icon: Stethoscope, roles: [ROLES.DOCTOR, ROLES.RECEPTIONIST] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/appointments', label: 'Appointments', icon: CalendarDays, roles: all },
      { href: '/admin/appointments/new', label: 'Walk-in booking', icon: UserPlus, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR] },
      { href: '/admin/slots', label: 'Slots & schedule', icon: CalendarClock, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST] },
      { href: '/admin/patients', label: 'Patients', icon: Users, roles: all },
      { href: '/admin/prescriptions', label: 'Prescriptions', icon: FileText, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.DOCTOR] },
      { href: '/admin/payments', label: 'Payments', icon: CreditCard, roles: all },
      // { href: '/admin/videos', label: 'Care videos', icon: Video, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.DOCTOR] },
    ],
  },
  {
    label: 'Network',
    items: [
      { href: '/admin/clinics', label: 'Clinics', icon: Building2, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
      { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
      { href: '/admin/specialities', label: 'Specialities', icon: Layers, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/staff', label: 'Staff accounts', icon: UserCog, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
    ],
  },
  {
    label: 'Growth',
    items: [
      { href: '/admin/coupons', label: 'Coupons', icon: Ticket, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
      { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
      { href: '/admin/reports', label: 'Reports', icon: BarChart3, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
    ],
  },
  {
    label: 'Website',
    items: [
      // { href: '/admin/cms/onboarding', label: 'App onboarding', icon: Smartphone, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/cms/banners', label: 'Banners', icon: ImageIcon, roles: [ROLES.SUPERADMIN] },
      // { href: '/admin/cms/popups', label: 'Popups', icon: Megaphone, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/cms/testimonials', label: 'Testimonials', icon: MessageSquareQuote, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/cms/categories', label: 'Categories', icon: FolderTree, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/cms/blogs', label: 'Articles', icon: Newspaper, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/cms/faqs', label: 'FAQs', icon: HelpCircle, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/cms/partners', label: 'Partners', icon: Handshake, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/announcements', label: 'Header announcements', icon: Megaphone, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/pages', label: 'Policy pages', icon: FileCog, roles: [ROLES.SUPERADMIN] },
    ],
  },
  {
    label: 'System',
    items: [
      // { href: '/admin/app-settings', label: 'Mobile app', icon: Smartphone, roles: [ROLES.SUPERADMIN] },
      // { href: '/admin/notifications', label: 'App notifications', icon: BellRing, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
      { href: '/admin/settings', label: 'Website settings', icon: Settings, roles: [ROLES.SUPERADMIN] },
      { href: '/admin/audit-logs', label: 'Audit log', icon: ScrollText, roles: [ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN] },
    ],
  },
];

export const adminNavFor = (role) =>
  ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter((g) => g.items.length);

export const PATIENT_NAV = [
  {
    label: 'My care',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
      { href: '/dashboard/family', label: 'Family members', icon: Users },
      { href: '/dashboard/prescriptions', label: 'Prescriptions', icon: FileText },
      { href: '/dashboard/videos', label: 'Care videos', icon: Video },
    ],
  },
  {
    label: 'Account',
    items: [{ href: '/dashboard/profile', label: 'Profile', icon: UserRound }],
  },
];
