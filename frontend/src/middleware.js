import { NextResponse } from 'next/server';

const ACCESS = 'cl_access';
const ROLE = 'cl_role';

const STAFF = ['superadmin', 'clinic_admin', 'doctor', 'receptionist'];

// Admin sections that only some staff roles may open. Anything not listed is
// open to every staff role; the API still enforces the real rules.
const ADMIN_SECTION_ROLES = [
  ['/admin/my-day', ['doctor', 'receptionist', 'superadmin', 'clinic_admin']],
  ['/admin/app-settings', ['superadmin']],
  ['/admin/notifications', ['superadmin', 'clinic_admin']],
  ['/admin/cms/onboarding', ['superadmin']],
  ['/admin/specialities', ['superadmin']],
  ['/admin/clinics', ['superadmin', 'clinic_admin']],
  ['/admin/slots', ['superadmin', 'clinic_admin', 'receptionist']],
  ['/admin/coupons', ['superadmin', 'clinic_admin']],
  ['/admin/reports', ['superadmin', 'clinic_admin']],
  ['/admin/audit-logs', ['superadmin', 'clinic_admin']],
  ['/admin/staff', ['superadmin', 'clinic_admin']],
  ['/admin/enquiries', ['superadmin', 'clinic_admin']],
  ['/admin/cms', ['superadmin']],
  ['/admin/pages', ['superadmin']],
  ['/admin/announcements', ['superadmin']],
  ['/admin/settings', ['superadmin']],
];

export function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(ACCESS)?.value;
  const role = req.cookies.get(ROLE)?.value;
  const loggedIn = Boolean(token);

  const isAuthPage = ['/login', '/register', '/otp-login', '/clinic-login'].some((p) => pathname.startsWith(p));
  const isAdmin = pathname.startsWith('/admin');
  const isDashboard = pathname.startsWith('/dashboard');

  if (isAuthPage && loggedIn) {
    const to = STAFF.includes(role) ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(to, req.url));
  }

  // /book is deliberately open: a visitor picks a slot first and proves their phone
  // number with an OTP at the last step, which creates the account for them.
  if ((isAdmin || isDashboard) && !loggedIn) {
    // staff land on the clinic door, patients on the normal one
    const url = new URL(isAdmin ? '/clinic-login' : '/login', req.url);
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  if (isAdmin && loggedIn) {
    if (!STAFF.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    const rule = ADMIN_SECTION_ROLES.find(([prefix]) => pathname.startsWith(prefix));
    if (rule && !rule[1].includes(role)) {
      return NextResponse.redirect(new URL('/admin?denied=1', req.url));
    }
  }

  if (isDashboard && loggedIn && STAFF.includes(role)) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register', '/otp-login', '/clinic-login'],
};
