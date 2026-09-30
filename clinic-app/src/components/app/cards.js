import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import { Badge, StatusBadge } from '../ui/Badge';
import { colors, font, radius } from '../../lib/theme';
import { inr, prettyDate, to12h, shortDate } from '../../lib/utils';

export function SectionHead({ title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHead}>
      <View style={{ flex: 1 }}>
        <Text style={font.h2}>{title}</Text>
        {!!subtitle && <Text style={[font.body, { marginTop: 2 }]}>{subtitle}</Text>}
      </View>
      {!!actionLabel && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: colors.brand700, fontWeight: '700', fontSize: 13 }}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function DoctorCard({ doctor, onPress, wide = false }) {
  const router = useRouter();
  const go = onPress || (() => router.push(`/doctor/${doctor._id}`));
  return (
    <Card onPress={go} style={wide ? undefined : { width: 240 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Avatar name={doctor.name} uri={doctor.photo} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={font.h3} numberOfLines={1}>{doctor.name}</Text>
          <Text style={font.small} numberOfLines={1}>
            {doctor.speciality?.name || 'Specialist'}
          </Text>
          <Text style={[font.small, { marginTop: 2 }]} numberOfLines={1}>
            {doctor.qualification || `${doctor.experienceYears || 0} yrs experience`}
          </Text>
        </View>
      </View>
      <View style={styles.cardFoot}>
        <Text style={{ color: colors.ink, fontWeight: '800' }}>{inr(doctor.consultationFee)}</Text>
        <Badge label={`${doctor.experienceYears || 0} yrs`} />
      </View>
    </Card>
  );
}

export function ClinicCard({ clinic, onPress }) {
  const router = useRouter();
  const a = clinic.address || {};
  return (
    <Card onPress={onPress || (() => router.push(`/clinic/${clinic._id}`))}>
      <Text style={font.h3} numberOfLines={1}>{clinic.name}</Text>
      <View style={styles.iconRow}>
        <Ionicons name="location-outline" size={14} color={colors.muted} />
        <Text style={[font.small, { flex: 1 }]} numberOfLines={2}>
          {[a.line1, a.city, a.pincode].filter(Boolean).join(', ') || 'Address on request'}
        </Text>
      </View>
      {!!clinic.timings?.openTime && (
        <View style={styles.iconRow}>
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text style={font.small}>
            {to12h(clinic.timings.openTime)} – {to12h(clinic.timings.closeTime)}
          </Text>
        </View>
      )}
    </Card>
  );
}

export function SpecialityTile({ speciality, onPress }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={onPress || (() => router.push(`/speciality/${speciality.slug || speciality._id}`))}
      style={styles.tile}
    >
      <View style={styles.tileIcon}>
        {speciality.image ? (
          <Image source={{ uri: speciality.image }} style={{ width: 26, height: 26, borderRadius: 6 }} />
        ) : (
          <Ionicons name="medkit-outline" size={20} color={colors.brand600} />
        )}
      </View>
      <Text style={styles.tileText} numberOfLines={2}>{speciality.name}</Text>
    </Pressable>
  );
}

export function AppointmentCard({ appointment, onPress }) {
  const router = useRouter();
  const a = appointment;
  return (
    <Card onPress={onPress || (() => router.push(`/appointment/${a._id}`))}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{shortDate(a.date).split(' ')[0]}</Text>
          <Text style={styles.dateMonth}>{shortDate(a.date).split(' ')[1]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={font.h3} numberOfLines={1}>{a.doctor?.name}</Text>
          <Text style={font.small} numberOfLines={1}>
            {a.speciality?.name} · {a.clinic?.name}
          </Text>
          <View style={[styles.iconRow, { marginTop: 6 }]}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={font.small}>{to12h(a.startTime)}</Text>
            <Ionicons name="person-outline" size={14} color={colors.muted} style={{ marginLeft: 8 }} />
            <Text style={font.small} numberOfLines={1}>{a.patient?.name}</Text>
          </View>
        </View>
        <StatusBadge value={a.status} />
      </View>
      <View style={styles.cardFoot}>
        <Text style={font.small}>{prettyDate(a.date)}</Text>
        <Text style={{ color: colors.ink, fontWeight: '800' }}>
          {inr(a.payableAmount ?? a.consultationFee)}
        </Text>
      </View>
    </Card>
  );
}

export function BlogCard({ blog, onPress }) {
  const router = useRouter();
  return (
    <Card onPress={onPress || (() => router.push(`/blog/${blog.slug}`))} padded={false} style={{ width: 260, overflow: 'hidden' }}>
      {!!blog.coverImage && (
        <Image source={{ uri: blog.coverImage }} style={{ width: '100%', height: 120 }} />
      )}
      <View style={{ padding: 14 }}>
        <Text style={font.h3} numberOfLines={2}>{blog.title}</Text>
        {!!blog.excerpt && (
          <Text style={[font.small, { marginTop: 4 }]} numberOfLines={2}>{blog.excerpt}</Text>
        )}
      </View>
    </Card>
  );
}

export function Row({ label, value, last = false }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={[font.body, { flex: 1 }]}>{label}</Text>
      <Text style={{ color: colors.ink, fontWeight: '600', fontSize: 14, flexShrink: 1, textAlign: 'right' }}>
        {value || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 12, marginTop: 24 },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  tile: {
    width: 96,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { fontSize: 12, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  dateBox: {
    width: 52,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.brand50,
    alignItems: 'center',
  },
  dateDay: { fontSize: 18, fontWeight: '800', color: colors.brand700 },
  dateMonth: { fontSize: 11, fontWeight: '700', color: colors.brand600, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
