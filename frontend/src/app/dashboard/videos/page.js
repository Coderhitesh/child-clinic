'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Video, PlayCircle } from 'lucide-react';
import { loadMyVideos } from '@/lib/my-videos';
import PageHeader from '@/components/admin/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/spinner';
import { titleCase, getErr, youtubeId } from '@/lib/utils';

export default function CareVideos() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    loadMyVideos()
      .then(setRows)
      .catch((e) => toast.error(getErr(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader title="Care videos" sub="Guidance your doctor has shared — exercises, feeding, aftercare." />

      {!rows.length ? (
        <EmptyState icon={Video} title="Nothing shared yet" description="Videos assigned to you after a consultation will appear here." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((v) => {
            const vid = youtubeId(v.youtubeUrl);
            const open = playing === v._id;
            return (
              <Card key={v._id} className="overflow-hidden">
                <div className="relative aspect-video bg-ink/5">
                  {open && vid ? (
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button type="button" onClick={() => (vid ? setPlaying(v._id) : window.open(v.youtubeUrl, '_blank'))} className="group relative h-full w-full">
                      {vid && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`} alt={v.title} className="h-full w-full object-cover" />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-ink/25 transition group-hover:bg-ink/35">
                        <PlayCircle className="h-12 w-12 text-white" />
                      </span>
                    </button>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge tone="muted">{titleCase(v.category || 'general')}</Badge>
                    {v.speciality?.name && <span className="text-xs text-muted-foreground">{v.speciality.name}</span>}
                  </div>
                  <p className="font-medium">{v.title}</p>
                  {v.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{v.description}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
