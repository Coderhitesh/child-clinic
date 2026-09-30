import RazorpayCheckout from 'react-native-razorpay';
import Constants from 'expo-constants';

const KEY_ID =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || Constants.expoConfig?.extra?.razorpayKeyId || '';

/**
 * Native Razorpay checkout. Needs a development build — the SDK is not in Expo Go.
 * The order is always created server-side; the app only opens the sheet and reports
 * back, and the webhook is what actually confirms the appointment.
 */
export const openCheckout = async ({ order, amount, user, patient, description }) => {
  if (!KEY_ID) {
    return { ok: false, reason: 'no_key', message: 'Razorpay key is not configured in the app build' };
  }
  const orderId = order?.orderId || order?.id;
  if (!orderId) {
    return { ok: false, reason: 'no_order', message: 'The server did not return a payment order' };
  }

  try {
    const result = await RazorpayCheckout.open({
      key: KEY_ID,
      order_id: orderId,
      amount: Math.round((order?.amount ?? amount ?? 0) * (order?.amount ? 1 : 100)),
      currency: order?.currency || 'INR',
      name: 'HealthBridge',
      description: description || 'Consultation fee',
      theme: { color: '#12a89f' },
      prefill: {
        name: patient?.name || user?.name || '',
        contact: patient?.contact?.phone || user?.phone || '',
        email: patient?.contact?.email || user?.email || '',
      },
    });
    return { ok: true, payment: result };
  } catch (err) {
    // the SDK throws on dismissal too, which is not an error worth shouting about
    const cancelled = err?.code === 0 || /cancel/i.test(err?.description || '');
    return {
      ok: false,
      reason: cancelled ? 'cancelled' : 'failed',
      message: err?.description || 'Payment could not be completed',
    };
  }
};
