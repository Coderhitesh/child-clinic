const path = require('path');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/apiError');
const env = require('../config/env');
const { UPLOAD_ROOT } = require('../middleware/upload');
const { logAudit } = require('../middleware/audit');

// Absolute URL so the value can be stored straight on a model and rendered anywhere.
const publicUrl = (req, file) => {
  const rel = path.relative(UPLOAD_ROOT, file.path).split(path.sep).join('/');
  const base = env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${rel}`;
};

const describe = (req, file) => ({
  url: publicUrl(req, file),
  name: file.originalname,
  size: file.size,
  mimeType: file.mimetype,
});

exports.uploadOne = catchAsync(async (req, res) => {
  const file = req.file || req.files?.[0];
  if (!file) {
    throw new ApiError(
      400,
      'No file received. Send it as multipart/form-data under the field "file" — and let the HTTP client set the Content-Type so the multipart boundary survives.'
    );
  }
  const data = describe(req, file);
  await logAudit({ req, action: 'FILE_UPLOAD', resourceType: 'File', meta: { url: data.url } });
  res.status(201).json({ success: true, data });
});

exports.uploadMany = catchAsync(async (req, res) => {
  if (!req.files?.length) {
    throw new ApiError(
      400,
      'No files received. Send them as multipart/form-data under the field "files", with the Content-Type set by the HTTP client.'
    );
  }
  const data = req.files.map((f) => describe(req, f));
  await logAudit({ req, action: 'FILE_UPLOAD', resourceType: 'File', meta: { count: data.length } });
  res.status(201).json({ success: true, data });
});

// Deletes a file this API produced. The url must point inside the uploads folder.
exports.remove = catchAsync(async (req, res) => {
  const { url } = req.body;
  if (!url) throw new ApiError(400, 'url required');

  const marker = '/uploads/';
  const idx = url.indexOf(marker);
  if (idx === -1) throw new ApiError(400, 'Not an uploaded file URL');

  const rel = url.slice(idx + marker.length);
  const target = path.resolve(UPLOAD_ROOT, rel);
  if (!target.startsWith(path.resolve(UPLOAD_ROOT))) throw new ApiError(400, 'Invalid path');

  if (fs.existsSync(target)) fs.unlinkSync(target);
  await logAudit({ req, action: 'FILE_DELETE', resourceType: 'File', meta: { url } });
  res.json({ success: true, message: 'File deleted' });
});
