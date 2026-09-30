import { videoApi, patientApi, appointmentApi } from '@/services';
import { youtubeId } from '@/lib/utils';

// Everything shared with this account: videos assigned to a family member
// plus the video a clinic attached to a visit.
export async function loadMyVideos() {
  const [patients, appointments] = await Promise.all([
    patientApi.list().catch(() => []),
    appointmentApi.list().catch(() => []),
  ]);
  const ids = (patients || []).map((p) => p._id);
  const assigned = ids.length ? await videoApi.list({ patients: ids.join(',') }).catch(() => []) : [];

  const fromVisits = (appointments || [])
    .filter((a) => youtubeId(a.youtubeUrl))
    .map((a) => ({
      _id: `appt-${a._id}`,
      title: a.videoTitle || `Video from ${a.clinic?.name || 'your clinic'}`,
      youtubeUrl: a.youtubeUrl,
      category: 'doctor_advice',
      description: a.patient?.name ? `For ${a.patient.name}` : '',
    }));

  const seen = new Set();
  return [...(assigned || []), ...fromVisits].filter((v) => {
    const key = youtubeId(v.youtubeUrl) || v._id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
