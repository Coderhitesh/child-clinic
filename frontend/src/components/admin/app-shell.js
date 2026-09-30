'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Menu, X, LogOut, ExternalLink, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { PageLoader } from '@/components/ui/spinner';
import { cn, initials } from '@/lib/utils';
import { ROLE_LABEL, ROLES, STAFF_ROLES } from '@/lib/constants';

export default function AppShell({ nav = [], title = 'Console', children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, hydrated, logout } = useAuthStore();
  const { sidebarOpen, setSidebar } = useUiStore();

  useEffect(() => { setSidebar(false); }, [pathname, setSidebar]);

  if (!hydrated && !user) return <PageLoader label="Opening your workspace" />;
  if (hydrated && !user) {
    if (typeof window !== 'undefined') router.replace('/login');
    return <PageLoader label="Redirecting to sign in" />;
  }

  const groups = nav.filter((g) => g.items.length > 0);
  // clinic staff work inside the console only; the public site is for patients and the super admin
  const isClinicStaff = STAFF_ROLES.includes(user?.role) && user?.role !== ROLES.SUPERADMIN;
  const homeHref = isClinicStaff ? '/admin' : '/';
  const loginHref = STAFF_ROLES.includes(user?.role) ? '/clinic-login' : '/login';

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto border-r border-border bg-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href={homeHref} className="flex items-center gap-2 text-lg font-extrabold text-brand-700">
            <img src="/images/logo.png" alt="" className="h-8 w-8 rounded-full object-cover" />
            Normal Child Clinic
          </Link>
          <button className="lg:hidden" onClick={() => setSidebar(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-muted'
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        <span className="truncate">{item.label}</span>
                        {active && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setSidebar(false)} />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebar(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          <p className="truncate font-semibold text-ink">{title}</p>

          <div className="ml-auto flex items-center gap-2">
            {!isClinicStaff && (
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link href="/" target="_blank">View site <ExternalLink className="h-3.5 w-3.5" /></Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 hover:bg-muted">
                  <Avatar className="h-7 w-7"><AvatarFallback>{initials(user?.name || '')}</AvatarFallback></Avatar>
                  <span className="hidden text-sm font-medium sm:block">{user?.name?.split(' ')[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email || user?.phone}</DropdownMenuLabel>
                <DropdownMenuLabel className="pt-0 text-brand-700">{ROLE_LABEL[user?.role]}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout().then(() => router.replace(loginHref))}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
