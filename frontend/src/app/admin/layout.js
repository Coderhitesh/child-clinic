'use client';
import AppShell from '@/components/admin/app-shell';
import { adminNavFor } from '@/config/nav';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({ children }) {
  const user = useAuthStore((s) => s.user);
  return (
    <AppShell nav={user ? adminNavFor(user.role) : []} title="Clinic console">
      {children}
    </AppShell>
  );
}
