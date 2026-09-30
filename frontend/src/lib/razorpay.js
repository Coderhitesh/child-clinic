'use client';

let loading = null;

export function loadRazorpay() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
  return loading;
}

// Opens the gateway checkout for an order created by the backend.
// The backend webhook is what actually confirms the appointment.
export async function openRazorpayCheckout({ order, amount, user, onClose }) {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!key) return { opened: false, reason: 'no_key' };
  const ok = await loadRazorpay();
  if (!ok) return { opened: false, reason: 'script_failed' };

  const rz = new window.Razorpay({
    key,
    amount: Math.round((amount || 0) * 100),
    currency: 'INR',
    name: 'Normal Child Clinic',
    description: 'Consultation fee',
    order_id: order?.orderId,
    prefill: { name: user?.name, email: user?.email, contact: user?.phone },
    theme: { color: '#0c8a84' },
    modal: { ondismiss: () => onClose?.('dismissed') },
    handler: () => onClose?.('paid'),
  });
  rz.open();
  return { opened: true };
}
