const env = require('../config/env');

// Turns a stored relative path (/files/..., /uploads/...) into an absolute URL the browser can open
// from any origin. Already-absolute URLs pass through untouched.
const absoluteUrl = (url, req) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = (env.API_PUBLIC_URL || (req ? `${req.protocol}://${req.get('host')}` : `http://localhost:${env.PORT}`)).replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

module.exports = { absoluteUrl };
