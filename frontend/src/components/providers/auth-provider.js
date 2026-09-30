'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// Rehydrates the session once per full page load. Everything else reads the store.
export default function AuthProvider({ children }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return children;
}
