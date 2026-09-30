'use client';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Link2, X } from 'lucide-react';
import { uploadApi } from '@/services';
import { Button } from './button';
import { Input } from './input';
import { Spinner } from './spinner';
import DoctorPhoto from './doctor-photo';
import { getErr } from '@/lib/utils';

const OK = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 5;

// Photo picker: upload from device (main) or paste a link (optional). Live round preview.
export function PhotoUpload({ value, onChange, name }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState(false);
  const [url, setUrl] = useState('');

  const pick = async (file) => {
    if (!file) return;
    if (!OK.includes(file.type)) return toast.error('Please choose a JPG, PNG or WEBP image');
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`Image must be under ${MAX_MB} MB`);
    setBusy(true);
    try {
      const res = await uploadApi.file(file);
      onChange(res.url);
      toast.success('Photo uploaded');
    } catch (e) {
      toast.error(getErr(e));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  const addLink = () => {
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) return toast.error('Enter a full link starting with http:// or https://');
    onChange(u);
    setUrl('');
    setLink(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <DoctorPhoto name={name} photo={value} className="h-20 w-20 rounded-full border border-border text-xl" />
        <div className="flex flex-wrap items-center gap-2">
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={busy}>
            {busy ? <Spinner /> : <Upload className="h-4 w-4" />}{busy ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}><X className="h-4 w-4" />Remove</Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => setLink((v) => !v)}><Link2 className="h-4 w-4" />Use a link instead</Button>
        </div>
      </div>
      {link && (
        <div className="flex gap-2">
          <Input value={url} placeholder="https://example.com/photo.jpg" onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }} />
          <Button type="button" onClick={addLink} disabled={!url.trim()}>Add</Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">JPG, PNG or WEBP, up to {MAX_MB} MB. Square photos look best.</p>
    </div>
  );
}

export default PhotoUpload;
