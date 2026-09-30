const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const ApiError = require('../utils/apiError');

// Local disk storage. Files land in backend/uploads/<YYYY-MM>/ and are served
// read-only at /uploads by app.js. Swap this storage engine for multer-s3 (or a
// Cloudinary upload stream) and nothing else in the codebase needs to change.
const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

const monthDir = () => {
  const d = new Date();
  const dir = path.join(UPLOAD_ROOT, `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const ALLOWED = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      cb(null, monthDir());
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = ALLOWED[file.mimetype] || path.extname(file.originalname) || '';
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      return cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

module.exports = { upload, UPLOAD_ROOT };
