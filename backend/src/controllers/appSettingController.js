const AppSetting = require('../models/AppSetting');
const catchAsync = require('../utils/catchAsync');
const { logAudit } = require('../middleware/audit');

const getOrCreate = async () => {
  let doc = await AppSetting.findOne({ key: 'app' });
  if (!doc) doc = await AppSetting.create({ key: 'app' });
  return doc;
};

// compares dotted versions: 1.10.0 > 1.9.3
const cmp = (a = '0', b = '0') => {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
};

// GET /app-config?platform=android&version=1.0.0 — public, called on every app launch
exports.publicConfig = catchAsync(async (req, res) => {
  const doc = await getOrCreate();
  const platform = req.query.platform === 'ios' ? 'ios' : 'android';
  const current = req.query.version || '0.0.0';
  const rules = doc[platform] || {};

  const updateAvailable = cmp(current, rules.latestVersion) < 0;
  const updateRequired = cmp(current, rules.minSupportedVersion) < 0;

  res.json({
    success: true,
    data: {
      maintenance: {
        enabled: Boolean(doc.maintenance?.enabled),
        title: doc.maintenance?.title,
        message: doc.maintenance?.message,
        until: doc.maintenance?.until,
        allowBrowsing: Boolean(doc.maintenance?.allowBrowsing),
      },
      version: {
        current,
        latestVersion: rules.latestVersion,
        minSupportedVersion: rules.minSupportedVersion,
        storeUrl: rules.storeUrl,
        releaseNotes: rules.releaseNotes,
        updateAvailable,
        updateRequired,
      },
      support: { phone: doc.supportPhone, email: doc.supportEmail },
    },
  });
});

// GET /app-config/admin — the raw record for the console
exports.adminGet = catchAsync(async (req, res) => {
  const doc = await getOrCreate();
  res.json({ success: true, data: doc });
});

exports.update = catchAsync(async (req, res) => {
  const doc = await getOrCreate();
  const { maintenance, android, ios, supportPhone, supportEmail } = req.body;

  if (maintenance) doc.maintenance = { ...doc.maintenance?.toObject?.(), ...maintenance };
  if (android) doc.android = { ...doc.android?.toObject?.(), ...android };
  if (ios) doc.ios = { ...doc.ios?.toObject?.(), ...ios };
  if (supportPhone !== undefined) doc.supportPhone = supportPhone;
  if (supportEmail !== undefined) doc.supportEmail = supportEmail;

  await doc.save();
  await logAudit({ req, action: 'APP_SETTING_UPDATE', resourceType: 'AppSetting', resourceId: doc._id });
  res.json({ success: true, data: doc });
});
