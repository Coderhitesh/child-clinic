const PaymentModeSetting = require('../models/PaymentModeSetting');
const catchAsync = require('../utils/catchAsync');

// public: what payment modes are available (global default, or a specific clinic's override)
exports.get = catchAsync(async (req, res) => {
  const { clinic } = req.query;
  const [override, global] = await Promise.all([
    clinic ? PaymentModeSetting.findOne({ clinic }) : null,
    PaymentModeSetting.findOne({ clinic: null }),
  ]);
  const data = {
    payAtClinicEnabled: override ? override.payAtClinicEnabled : global ? global.payAtClinicEnabled : true,
    payOnlineEnabled: override ? override.payOnlineEnabled : global ? global.payOnlineEnabled : true,
    scope: override ? 'clinic' : 'global',
  };
  res.json({ success: true, data });
});

// superadmin: set global default
exports.setGlobal = catchAsync(async (req, res) => {
  const { payAtClinicEnabled, payOnlineEnabled } = req.body;
  const settings = await PaymentModeSetting.findOneAndUpdate(
    { clinic: null },
    { payAtClinicEnabled, payOnlineEnabled },
    { new: true, upsert: true }
  );
  res.json({ success: true, data: settings });
});

// superadmin/clinic_admin: set per-clinic override
exports.setForClinic = catchAsync(async (req, res) => {
  const { clinicId } = req.params;
  const { payAtClinicEnabled, payOnlineEnabled } = req.body;
  const settings = await PaymentModeSetting.findOneAndUpdate(
    { clinic: clinicId },
    { payAtClinicEnabled, payOnlineEnabled, clinic: clinicId },
    { new: true, upsert: true }
  );
  res.json({ success: true, data: settings });
});
