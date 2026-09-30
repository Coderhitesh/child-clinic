const crypto = require('crypto');
const env = require('../config/env');
const { v4: uuidv4 } = require('uuid');

// Stub gateway adapters. Swap internals for real Razorpay/Cashfree SDK calls.
// Interface kept stable so controllers never care which gateway is active.

const createOrder = async ({ gateway, amount, currency = 'INR', receipt }) => {
  // Real impl: call razorpay.orders.create(...) or cashfree order API.
  const orderId = `${gateway}_order_${uuidv4()}`;
  return { orderId, amount, currency, receipt, gateway };
};

const verifyWebhookSignature = ({ gateway, rawBody, signatureHeader }) => {
  const secret =
    gateway === 'razorpay' ? env.RAZORPAY_WEBHOOK_SECRET : env.CASHFREE_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader || ''));
  } catch {
    return false;
  }
};

const initiateRefund = async ({ gateway, gatewayPaymentId, amount }) => {
  // Real impl: call gateway refund API.
  return { refundId: `${gateway}_refund_${uuidv4()}`, status: 'processed', amount };
};

module.exports = { createOrder, verifyWebhookSignature, initiateRefund };
