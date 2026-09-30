'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { headerNotificationApi } from '@/services';

export default function NotificationBar() {
  const [items, setItems] = useState([]);
  const [closed, setClosed] = useState([]);

  useEffect(() => {
    headerNotificationApi.active().then(setItems).catch(() => setItems([]));
  }, []);

  const visible = items.filter((n) => !closed.includes(n._id));
  if (!visible.length) return null;
  const n = visible[0];

  return (
    <div className="w-full px-4 py-2 text-center text-sm" style={{ background: n.bgColor || '#0d6e6a', color: n.textColor || '#fff' }}>
      <span>{n.message}</span>
      {n.link && (
        <a href={n.link} className="ml-2 font-semibold underline underline-offset-2">
          {n.linkText || 'Read more'}
        </a>
      )}
      {n.dismissible !== false && (
        <button
          onClick={() => setClosed((c) => [...c, n._id])}
          className="absolute right-4 opacity-80 hover:opacity-100"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
