import { AndroidImportance } from '@notifee/react-native';

/**
 * Android channels. The server tags every push with a `type`, which maps to one of
 * these ids — keep this list in step with TYPE_TO_CHANNEL in the backend's
 * pushService. Channels must exist before a notification names them, so they are
 * created once at startup.
 */
export const CHANNELS = [
  {
    id: 'appointments',
    name: 'Appointments',
    description: 'Bookings, reschedules and cancellations',
    importance: AndroidImportance.HIGH,
    vibration: true,
  },
  {
    id: 'reminders',
    name: 'Visit reminders',
    description: 'A nudge the day before your appointment',
    importance: AndroidImportance.HIGH,
    vibration: true,
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Payment receipts, failures and refunds',
    importance: AndroidImportance.DEFAULT,
  },
  {
    id: 'prescriptions',
    name: 'Prescriptions & reports',
    description: 'When a doctor shares a prescription or report',
    importance: AndroidImportance.DEFAULT,
  },
  {
    id: 'promotions',
    name: 'Offers',
    description: 'Health camps, coupons and clinic news',
    importance: AndroidImportance.LOW,
    vibration: false,
  },
  {
    id: 'general',
    name: 'General',
    description: 'Everything else',
    importance: AndroidImportance.DEFAULT,
  },
];

export const CHANNEL_IDS = CHANNELS.map((c) => c.id);

const TYPE_TO_CHANNEL = {
  booking_confirm: 'appointments',
  appointment_cancelled: 'appointments',
  reminder: 'reminders',
  payment_success: 'payments',
  payment_failed: 'payments',
  prescription_ready: 'prescriptions',
  follow_up_due: 'reminders',
  promotion: 'promotions',
};

export const channelIdFor = (type) => TYPE_TO_CHANNEL[type] || 'general';

// where a tapped notification should land
export const routeForMessage = (data = {}) => {
  if (data.appointmentId) return `/appointment/${data.appointmentId}`;
  if (data.prescriptionId) return '/prescriptions';
  if (data.route) return data.route;
  switch (data.type) {
    case 'promotion':
      return '/(tabs)/doctors';
    case 'prescription_ready':
      return '/prescriptions';
    default:
      return '/(tabs)/appointments';
  }
};
