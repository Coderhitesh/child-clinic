const ContactSubmission = require('../models/ContactSubmission');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const { enqueueNotification } = require('../queues/notificationQueue');
const env = require('../config/env');
const { isClinicScoped, ownClinicIds } = require('../utils/clinicAccess');

// clinic_admin only sees enquiries sent from its own clinic(s)
const scopeFilter = (req, base = {}) =>
  isClinicScoped(req.user) ? { ...base, clinic: { $in: ownClinicIds(req.user) } } : base;

// public: contact form submit
exports.submit = catchAsync(async (req, res) => {
  const { name, email, phone, subject, message, clinicId } = req.body;
  const submission = await ContactSubmission.create({
    name,
    email,
    phone,
    subject,
    message,
    clinic: clinicId,
    ip: req.ip,
  });

  // notify internal team — plug a real staff/admin inbox address in via env or WebsiteSetting.contactEmail
  await enqueueNotification('reminder', {
    email: env.ADMIN_NOTIFY_EMAIL,
    subject: `New contact form submission: ${subject || 'General enquiry'}`,
    text: `From ${name} (${email}${phone ? ', ' + phone : ''}): ${message}`,
  });

  res.status(201).json({ success: true, data: submission });
});

exports.list = catchAsync(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const submissions = await ContactSubmission.find(scopeFilter(req, filter)).sort('-createdAt');
  res.json({ success: true, data: submissions });
});

exports.getOne = catchAsync(async (req, res) => {
  const submission = await ContactSubmission.findOneAndUpdate(
    scopeFilter(req, { _id: req.params.id }),
    { $set: { status: 'read' } },
    { new: true }
  );
  if (!submission) throw new ApiError(404, 'Submission not found');
  res.json({ success: true, data: submission });
});

exports.respond = catchAsync(async (req, res) => {
  const { responseNote } = req.body;
  const submission = await ContactSubmission.findOneAndUpdate(
    scopeFilter(req, { _id: req.params.id }),
    { status: 'responded', responseNote, respondedBy: req.user._id, respondedAt: new Date() },
    { new: true }
  );
  if (!submission) throw new ApiError(404, 'Submission not found');
  res.json({ success: true, data: submission });
});

exports.markSpam = catchAsync(async (req, res) => {
  const submission = await ContactSubmission.findOneAndUpdate(
    scopeFilter(req, { _id: req.params.id }),
    { status: 'spam' },
    { new: true }
  );
  if (!submission) throw new ApiError(404, 'Submission not found');
  res.json({ success: true, data: submission });
});
