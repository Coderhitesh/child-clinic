'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { popupApi } from '@/services';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function SitePopup() {
  const pathname = usePathname();
  const [popup, setPopup] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const page = pathname === '/' ? 'home' : pathname.split('/')[1];
    let timer;
    popupApi
      .active({ page })
      .then((list) => {
        const p = (list || [])[0];
        if (!p) return;
        const seen = sessionStorage.getItem(`popup:${p._id}`);
        if (p.showOnce && seen) return;
        timer = setTimeout(() => {
          setPopup(p);
          setOpen(true);
          sessionStorage.setItem(`popup:${p._id}`, '1');
        }, (p.delaySeconds || 3) * 1000);
      })
      .catch(() => {});
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!popup) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {popup.image && <img src={popup.image} alt="" className="h-44 w-full object-cover" />}
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>{popup.title}</DialogTitle>
          </DialogHeader>
          {popup.content && <p className="text-sm text-muted-foreground">{popup.content}</p>}
          {popup.link && (
            <Button asChild className="mt-5 w-full">
              <a href={popup.link}>{popup.buttonText || 'Learn more'}</a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
