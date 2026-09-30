'use client';
import { useEffect, useState } from 'react';
import { videoApi, specialityApi } from '@/services';
import ResourceManager from '@/components/admin/resource-manager';
import { Button } from '@/components/ui/button';
import { VIDEO_CATEGORIES } from '@/lib/constants';
import { titleCase } from '@/lib/utils';

export default function VideosPage() {
  const [specialities, setSpecialities] = useState([]);
  useEffect(() => { specialityApi.list().then((d) => setSpecialities(d || [])).catch(() => {}); }, []);

  return (
    <ResourceManager
      title="Care videos"
      sub="Add a YouTube video here, then open a patient → Assign video. The patient sees it under Care videos."
      api={videoApi}
      listParams={{ includeInactive: 'true' }}
      addLabel="Add video"
      defaults={{ category: 'general', isActive: true }}
      searchKeys={['title', 'category']}
      lookups={{ specialities: specialities.map((s) => ({ value: s._id, label: s.name })) }}
      columns={[
        { key: 'title', header: 'Title' },
        { key: 'category', header: 'Category', render: (r) => titleCase(r.category) },
        { key: 'assignedPatients', header: 'Assigned to', render: (r) => `${r.assignedPatients?.length || 0} patient(s)` },
        { key: 'watch', header: '', render: (r) => (
          <Button asChild variant="ghost" size="sm"><a href={r.youtubeUrl} target="_blank" rel="noreferrer">Watch</a></Button>
        ) },
      ]}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'youtubeUrl', label: 'YouTube URL', required: true, placeholder: 'https://youtube.com/watch?v=…' },
        { name: 'category', label: 'Category', type: 'select', required: true, options: VIDEO_CATEGORIES.map((c) => ({ value: c, label: titleCase(c) })) },
        { name: 'speciality', label: 'Speciality', type: 'select', optionsFrom: 'specialities' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'isActive', label: 'Visible to patients', type: 'switch' },
      ]}
    />
  );
}
