import { colors } from './theme';

export const APPOINTMENT_STATUS = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export const STATUS_TONE = {
  pending: { bg: colors.warningSoft, fg: colors.warning },
  confirmed: { bg: colors.successSoft, fg: colors.success },
  completed: { bg: colors.infoSoft, fg: colors.info },
  cancelled: { bg: colors.dangerSoft, fg: colors.danger },
  no_show: { bg: colors.dangerSoft, fg: colors.danger },
  paid: { bg: colors.successSoft, fg: colors.success },
  collected_at_clinic: { bg: colors.successSoft, fg: colors.success },
  refunded: { bg: colors.infoSoft, fg: colors.info },
  failed: { bg: colors.dangerSoft, fg: colors.danger },
};

export const GENDERS = ['male', 'female', 'other'];

export const PAYMENT_METHODS = [
  { value: 'pay_at_clinic', label: 'Pay at the clinic', hint: 'Reception collects the fee when you arrive' },
  { value: 'pay_online', label: 'Pay online', hint: 'Card, UPI or netbanking' },
];

export const STORAGE = {
  ACCESS: 'cl_access',
  REFRESH: 'cl_refresh',
  USER: 'cl_user',
  ONBOARDED: 'cl_onboarded',
};
