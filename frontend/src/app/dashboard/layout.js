'use client';
import AppShell from '@/components/admin/app-shell';
import { PATIENT_NAV } from '@/config/nav';

export default function DashboardLayout({ children }) {
  return (
    <AppShell nav={PATIENT_NAV} title="My care">
      {children}
    </AppShell>
  );
}
