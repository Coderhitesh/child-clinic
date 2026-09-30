const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['pay_at_clinic', 'pay_online'], default: 'pay_at_clinic' }, // 'pay_online' = legacy records only
    gateway: { type: String, enum: ['razorpay', 'cashfree', null], default: null },
    gatewayOrderId: String,
    gatewayPaymentId: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'collected_at_clinic'],
      default: 'pending',
    },
    paidAt: Date,
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // desk staff, for cash collected at the clinic
    refundedAt: Date,
    failureReason: String,
    webhookEvents: [
      {
        event: String,
        receivedAt: { type: Date, default: Date.now },
        raw: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
